import { KeystoneContext } from "@keystone-6/core/types";
import Stripe from "../../integrations/stripe";
import { Activity, calculatePaymentBreakdownWithGuests, calculateTotalWithCommissions, Lodging } from "../../utils/helpers/priceCalculation";
import { getBookingCode } from "../../utils/helpers/bookingCode";

const typeDefs = `
  type makePaymentType {
    message: String,
    success: Boolean,
    data: JSON
  }
`;

const definition = `
  makePayment(
  lodgingId: String, 
  locationId: String, 
  activityIds: [String!]!, 
  startDate: CalendarDay!, 
  guestsCount: String!, 
  nameCard: String!, 
  email: String!, 
  notes: String!, 
  paymentMethodId: String!, 
  total: String!, 
  noDuplicatePaymentMethod: Boolean!,
  paymentType: String!
  ): makePaymentType
`;

// Helper to validate input data
type PaymentInput = {
  activityIds: string[];
  lodgingId?: string;
  locationId: string;
  startDate: Date;
  guestsCount: string;
  nameCard: string;
  email: string;
  paymentMethodId: string;
  total: string;
  paymentType: string;
};

function validatePaymentInput({ activityIds, lodgingId, locationId, startDate, guestsCount, nameCard, email, paymentMethodId, total, paymentType }: PaymentInput) {
  if (!locationId) throw new Error("Location is required.");
  if (!startDate) throw new Error("Start date is required.");
  if (!guestsCount || isNaN(Number(guestsCount)) || Number(guestsCount) <= 0) throw new Error("Number of guests must be greater than 0.");
  if (!nameCard) throw new Error("Cardholder name is required.");
  if (!email) throw new Error("Email is required.");
  if (!paymentMethodId) throw new Error("Payment method is required.");
  if (!total || isNaN(Number(total)) || Number(total) <= 0) throw new Error("Total must be greater than 0.");
  if (!paymentType || !['full_payment', 'commission_only'].includes(paymentType)) {
    throw new Error("Payment type must be 'full_payment' or 'commission_only'.");
  }
}





type StripePaymentIntentParams = {
  total: string;
  user: { stripeCustomerId: string };
  paymentMethod: { stripePaymentMethodId: string; id: string };
  activityNames: string | undefined;
  activityIds: string | undefined;
  lodgingId?: string;
  lodgingName?: string;
};

async function createStripePaymentIntent({ total, user, paymentMethod, activityNames, activityIds, lodgingId, lodgingName }: StripePaymentIntentParams) {
  // Convert to cents and round to avoid floating point issues
  const amountInCents = Math.round(Number(total) * 100);

  const description = activityNames ? `Payment for activities: ${activityNames} (${activityIds})` : `Payment for lodging: ${lodgingName || 'N/A'}`;

  try {
    const paymentIntent = await Stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "mxn",
      customer: user.stripeCustomerId,
      payment_method: paymentMethod.stripePaymentMethodId,
      description: description,
      confirm: false, // Don't confirm immediately, keep in processing state
      metadata: {
        paymentMethod: paymentMethod.id,
        activityIds: activityIds || '',
        lodgingId: lodgingId || '',
      }
    });
    
    
    return paymentIntent;
  } catch (error: any) {
    throw error;
  }
}

const resolver = {
  makePayment: async (
    root: any,
    {
      activityIds,
      lodgingId,
      locationId,
      startDate,
      guestsCount,
      nameCard,
      email,
      notes,
      paymentMethodId,
      total,
      noDuplicatePaymentMethod,
      paymentType,
    }: PaymentInput & { notes: string; noDuplicatePaymentMethod: boolean },
    context: KeystoneContext,
  ) => {
    
    let paymentIntentId: string | undefined;
    let paymentId: string | undefined;
    let bookingId: string | undefined;
    
    try {
      validatePaymentInput({ activityIds, lodgingId, locationId, startDate, guestsCount, nameCard, email, paymentMethodId, total, paymentType });

      // Find activities with commission data
      let activities: Activity[] = [];
      if (activityIds.length > 0) {
        const acts = (await context.query.Activity.findMany({
          where: { id: { in: activityIds } },
          query: "id name price commission_type commission_value"
        })) as Activity[];
        activities = acts;
        if (!activities || activities.length === 0) throw new Error("No valid activities found.");
      }

      // Find lodging if applicable with commission data
      let lodging: Lodging = undefined;
      if (lodgingId) {
        lodging = (await context.query.Lodging.findOne({
          where: { id: lodgingId },
          query: "id name price commission_type commission_value",
        })) as Lodging;
        if (!lodging) throw new Error("Selected lodging not found.");
      }
      
      
      const totalInBack = calculateTotalWithCommissions(activities, lodging, guestsCount, paymentType);

      const roundedTotalInBack = parseFloat(totalInBack.toFixed(2));
      const roundedFrontendTotal = parseFloat(Number(total).toFixed(2));
      const difference = Math.abs(roundedFrontendTotal - roundedTotalInBack);
      
      // Use a small tolerance (0.01) to account for floating point precision issues
      // This allows for differences up to 1 cent due to rounding in intermediate calculations
      if (difference > 0.01) {
        return {
          message: `Communication error, please reload the page and try again. Total mismatch: Frontend=${roundedFrontendTotal}, Backend=${roundedTotalInBack}, Difference=${difference}`,
          success: false,
        };
      }

      const user = (await context.query.User.findOne({
        where: { email },
        query: "id name email stripeCustomerId"
      })) as { id: string; name: string; email: string; stripeCustomerId: string };
      if (!user) throw new Error("User not found.");

      if (!user.stripeCustomerId) {
        const stripeCustomer = await Stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id
          }
        });
        await context.sudo().query.User.updateOne({
          where: { id: user.id },
          data: { stripeCustomerId: stripeCustomer.id }
        });
        user.stripeCustomerId = stripeCustomer.id;
      }

      const paymentMethod = (await context.query.PaymentMethod.findOne({
        where: { id: paymentMethodId },
        query: "id stripeProcessorId stripePaymentMethodId"
      })) as { id: string; stripeProcessorId: string; stripePaymentMethodId: string };    
      if (!paymentMethod) throw new Error("Payment method not found.");

      if (noDuplicatePaymentMethod) {
        await Stripe.paymentMethods.attach(paymentMethod.stripePaymentMethodId, {
          customer: user.stripeCustomerId,
        });
        await Stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.stripePaymentMethodId,
          },
        });
      }

      const activityNames = activities.length > 0 ? activities.map(activity => activity.name).join(", ") : undefined;
      const activityIdsStr = activities.length > 0 ? activities.map(activity => activity.id).join(",") : undefined;

      const roundedTotal = roundedTotalInBack.toString();
      
      const stripePaymentIntent = await createStripePaymentIntent({
        total: roundedTotal,
        user,
        paymentMethod,
        activityNames,
        activityIds: activityIdsStr,
        lodgingId,
        lodgingName: lodging?.name
      });
          
      paymentIntentId = stripePaymentIntent?.id;

      if (stripePaymentIntent?.error) {
        await context.query.Payment.createOne({
          data: {
            paymentMethod: 'card',
            amount: roundedTotal,
            status: "failed",
            processorStripeChargeId: stripePaymentIntent?.id || "",
            stripeErrorMessage: stripePaymentIntent?.error?.message,
            user: { connect: { id: user.id } },
          },
        });
        return {
          message: stripePaymentIntent?.error?.message,
          success: false,
        };
      }
      
      let payment = await context.query.Payment.createOne({
        data: {
          paymentMethod: { connect: { id: paymentMethodId } },
          activity: activities.length > 0 ? { connect: activities.map(activity => ({ id: activity.id })) } : undefined,
          lodging: lodging ? { connect: { id: lodging.id } } : undefined,
          user: { connect: { id: user.id } },
          amount: roundedTotal,
          status: "succeeded",
          processorStripeChargeId: stripePaymentIntent?.id || "",
          notes,
        },
      });

      paymentId = payment.id;

      const bookingStatus = paymentType === 'full_payment' ? 'paid' : 'reserved';
      
      const booking = await context.query.Booking.createOne({
        data: {
          start_date: startDate,
          //end_date: undefined,
          guests_adults: Number(guestsCount),
          payment_type: paymentType,
          activity: activities.length > 0 ? { connect: activities.map(activity => ({ id: activity.id })) } : undefined,
          lodging: lodging ? { connect: { id: lodging.id } } : undefined,
          location: { connect: { id: locationId } },
          user: { connect: { id: user.id } },
          payment: { connect: { id: payment.id } },
          status: bookingStatus,
          code: getBookingCode({ id: payment.id, createdAt: payment.createdAt }), //this is to prevent the code stay empty
        },
      });

      bookingId = booking.id;

      await Stripe.paymentIntents.confirm(paymentIntentId, {
        off_session: true
      });
      
      return {
        message: "Tu pago y reserva han sido creadas exitosamente. En breve te llegara un correo de confirmación. Te estamos redirigiendo a la página de tu reserva...",
        success: true,
        data: { booking: booking.id },
      };
    } catch (e: any) {
      
      if (paymentIntentId) {
        try {
          await Stripe.paymentIntents.cancel(paymentIntentId);
        } catch (_) {
        }
      }

      if (paymentId) {
        await context.sudo().query.Payment.updateOne({
          where: { id: paymentId },
          data: { status: "cancelled", notes: notes + " - Reason for cancellation: Communication error with the server. " + e.message }
        });
      }

      if (bookingId) {
        await context.sudo().query.Booking.updateOne({
          where: { id: bookingId },
          data: { status: "cancelled",  }
        });
      }
      
      return {
        message: (e && typeof e === 'object' && 'message' in e) ? e.message : "We had communication problems with the server. Please try again.",
        success: false,
      };
    }
  },
};

export default { typeDefs, definition, resolver };
