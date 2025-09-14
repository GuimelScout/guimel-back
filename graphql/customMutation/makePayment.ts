import { KeystoneContext } from "@keystone-6/core/types";
import Stripe from "../../integrations/stripe";

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
  endDate: CalendarDay!,
  guestsCount: String!, 
  nameCard: String!, 
  email: String!, 
  notes: String!, 
  paymentMethodId: String!, 
  total: String!, 
  noDuplicatePaymentMethod: Boolean!, 
  ): makePaymentType
`;

// Helper to validate input data
type PaymentInput = {
  activityIds: string[];
  lodgingId?: string;
  locationId: string;
  startDate: Date;
  endDate: Date;
  guestsCount: string;
  nameCard: string;
  email: string;
  paymentMethodId: string;
  total: string;
};

function validatePaymentInput({ activityIds, lodgingId, locationId, startDate, endDate, guestsCount, nameCard, email, paymentMethodId, total }: PaymentInput) {
  if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("At least one activity must be selected.");
  }
  if (!locationId) throw new Error("Location is required.");
  if (!startDate || !endDate) throw new Error("Dates are required.");
  if (!guestsCount || isNaN(Number(guestsCount)) || Number(guestsCount) <= 0) throw new Error("Number of guests must be greater than 0.");
  if (!nameCard) throw new Error("Cardholder name is required.");
  if (!email) throw new Error("Email is required.");
  if (!paymentMethodId) throw new Error("Payment method is required.");
  if (!total || isNaN(Number(total)) || Number(total) <= 0) throw new Error("Total must be greater than 0.");
}

type Activity = { id: string; name: string; price: string };
type Lodging = { id: string; name: string; price: string } | undefined;

function calculateTotal(activities: Activity[], lodging: Lodging, guestsCount: string): number {
  let total = 0;
  activities.forEach((activity: Activity) => {
    total += parseFloat(activity.price || "0.00") * Number(guestsCount);
  });
  if (lodging) {
    total += parseFloat(lodging.price || "0.00") * Number(guestsCount);
  }
  return total;
}

type StripePaymentIntentParams = {
  total: string;
  user: { stripeCustomerId: string };
  paymentMethod: { stripePaymentMethodId: string; id: string };
  activityNames: string;
  activityIds: string;
  lodgingId?: string;
};

async function createStripePaymentIntent({ total, user, paymentMethod, activityNames, activityIds, lodgingId }: StripePaymentIntentParams) {
  return await Stripe.paymentIntents.create({
    amount: Number(total) * 100,
    currency: "mxn",
    customer: user.stripeCustomerId,
    payment_method: paymentMethod.stripePaymentMethodId,
    description: `Payment for activities: ${activityNames} (${activityIds})`,
    confirm: true,
    off_session: true,
    metadata: {
      paymentMethod: paymentMethod.id,
      activityIds: activityIds,
      lodgingId: lodgingId,
    }
  });
}

const resolver = {
  makePayment: async (
    root: any,
    {
      activityIds,
      lodgingId,
      locationId,
      startDate,
      endDate,
      guestsCount,
      nameCard,
      email,
      notes,
      paymentMethodId,
      total,
      noDuplicatePaymentMethod,
    }: PaymentInput & { notes: string; noDuplicatePaymentMethod: boolean },
    context: KeystoneContext,
  ) => {
    try {
      // Input validation
      validatePaymentInput({ activityIds, lodgingId, locationId, startDate, endDate, guestsCount, nameCard, email, paymentMethodId, total });

      // Find activities
      const activities = (await context.query.Activity.findMany({
        where: { id: { in: activityIds } },
        query: "id name price"
      })) as Activity[];
      if (!activities || activities.length === 0) throw new Error("No valid activities found.");

      // Find lodging if applicable
      let lodging: Lodging = undefined;
      if (lodgingId) {
        lodging = (await context.query.Lodging.findOne({
          where: { id: lodgingId },
          query: "id name price",
        })) as Lodging;
        if (!lodging) throw new Error("Selected lodging not found.");
      }
      // Calculate total in backend
      const totalInBack = calculateTotal(activities, lodging, guestsCount);
      if (Number(total) !== totalInBack) {
        return {
          message: "Communication error, please reload the page and try again.",
          success: false,
        };
      }

      // Find user
      const user = (await context.query.User.findOne({
        where: { email },
        query: "id name email stripeCustomerId"
      })) as { id: string; name: string; email: string; stripeCustomerId: string };
      if (!user) throw new Error("User not found.");

      // Check if user has Stripe customer ID, create one if not
      if (!user.stripeCustomerId) {
        const stripeCustomer = await Stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id
          }
        });
        
        // Update user with Stripe customer ID
        await context.query.User.updateOne({
          where: { id: user.id },
          data: { stripeCustomerId: stripeCustomer.id }
        });
        user.stripeCustomerId = stripeCustomer.id;
      }

      // Find payment method
      const paymentMethod = (await context.query.PaymentMethod.findOne({
        where: { id: paymentMethodId },
        query: "id stripeProcessorId stripePaymentMethodId"
      })) as { id: string; stripeProcessorId: string; stripePaymentMethodId: string };
      if (!paymentMethod) throw new Error("Payment method not found.");

      // Attach payment method if applicable
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

      // Create description
      const activityNames = activities.map(activity => activity.name).join(", ");
      const activityIdsStr = activities.map(activity => activity.id).join(",");

      // Create PaymentIntent
      const stripePaymentIntent = await createStripePaymentIntent({
        total,
        user,
        paymentMethod,
        activityNames,
        activityIds: activityIdsStr,
        lodgingId
      });

      if (stripePaymentIntent?.error) {
        // Record failed payment
        await context.query.Payment.createOne({
          data: {
            paymentMethod: 'card',
            amount: total,
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

      // Record successful payment
      const payment = await context.query.Payment.createOne({
        data: {
          paymentMethod: { connect: { id: paymentMethodId } },
          activity: { connect: activities.map(activity => ({ id: activity.id })) },
          lodging: lodging ? { connect: { id: lodging.id } } : undefined,
          user: { connect: { id: user.id } },
          amount: total,
          status: "succeeded",
          processorStripeChargeId: stripePaymentIntent?.id || "",
          notes,
        },
      });

      // Record booking
      const booking = await context.query.Booking.createOne({
        data: {
          start_date: startDate,
          end_date: endDate,
          guests_adults: Number(guestsCount),
          activity: { connect: activities.map(activity => ({ id: activity.id })) },
          lodging: lodging ? { connect: { id: lodging.id } } : undefined,
          location: { connect: { id: locationId } },
          user: { connect: { id: user.id } },
          payment: { connect: { id: payment.id } },
          status: "paid",
        },
      });

      return {
        message: "Payment and booking creation successful.",
        success: true,
        data: { booking: booking.id },
      };
    } catch (e: any) {
      return {
        message: (e && typeof e === 'object' && 'message' in e) ? e.message : "We had communication problems with the server. Please try again.",
        success: false,
      };
    }
  },
};

export default { typeDefs, definition, resolver };
