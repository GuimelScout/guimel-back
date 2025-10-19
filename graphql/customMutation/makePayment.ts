import { KeystoneContext } from "@keystone-6/core/types";
import Stripe from "../../integrations/stripe";
import { calculatePaymentBreakdownWithGuests } from "../../utils/helpers/priceCalculation";

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
  paymentType: String!
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
  paymentType: string;
};

function validatePaymentInput({ activityIds, lodgingId, locationId, startDate, endDate, guestsCount, nameCard, email, paymentMethodId, total, paymentType }: PaymentInput) {
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
  if (!paymentType || !['full_payment', 'commission_only'].includes(paymentType)) {
    throw new Error("Payment type must be 'full_payment' or 'commission_only'.");
  }
}

type Activity = { 
  id: string; 
  name: string; 
  price: string; 
  commission_type: string; 
  commission_value: string; 
};
type Lodging = { 
  id: string; 
  name: string; 
  price: string; 
  commission_type: string; 
  commission_value: string; 
} | undefined;

function calculateTotalWithCommissions(
  activities: Activity[], 
  lodging: Lodging, 
  guestsCount: string, 
  paymentType: string
): number {
  let total = 0;
  const guests = Number(guestsCount);
  
  // Calculate activities total
  activities.forEach((activity: Activity, index: number) => {
    const breakdown = calculatePaymentBreakdownWithGuests(
      activity.price,
      activity.commission_type,
      activity.commission_value,
      paymentType,
      guests
    );
    
    total += breakdown.payNow;
  });
  
  // Calculate lodging total
  if (lodging) {
    const breakdown = calculatePaymentBreakdownWithGuests(
      lodging.price,
      lodging.commission_type,
      lodging.commission_value,
      paymentType,
      guests
    );
    
    total += breakdown.payNow;
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
  console.log('💳 [STRIPE_PAYMENT_INTENT] Creating payment intent with params:', {
    total,
    amountInCents: Math.round(Number(total) * 100),
    currency: "mxn",
    customerId: user.stripeCustomerId,
    paymentMethodId: paymentMethod.stripePaymentMethodId,
    activityNames,
    activityIds,
    lodgingId
  });
  
  // Convert to cents and round to avoid floating point issues
  const amountInCents = Math.round(Number(total) * 100);
  
  try {
    const paymentIntent = await Stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "mxn",
      customer: user.stripeCustomerId,
      payment_method: paymentMethod.stripePaymentMethodId,
      description: `Payment for activities: ${activityNames} (${activityIds})`,
      confirm: false, // Don't confirm immediately, keep in processing state
      metadata: {
        paymentMethod: paymentMethod.id,
        activityIds: activityIds,
        lodgingId: lodgingId,
      }
    });
    
    console.log('✅ [STRIPE_PAYMENT_INTENT] Payment intent created successfully:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      client_secret: paymentIntent.client_secret
    });
    
    return paymentIntent;
  } catch (error: any) {
    console.error('❌ [STRIPE_PAYMENT_INTENT] Error creating payment intent:', {
      error: error.message,
      stack: error.stack,
      params: { total, user: user.stripeCustomerId, paymentMethod: paymentMethod.stripePaymentMethodId }
    });
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
      endDate,
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
    
    console.log('🚀 [MAKE_PAYMENT] Starting payment process', {
      activityIds,
      lodgingId,
      locationId,
      startDate,
      endDate,
      guestsCount,
      nameCard,
      email,
      paymentMethodId,
      total,
      noDuplicatePaymentMethod,
      paymentType,
      timestamp: new Date().toISOString()
    });
    
    let paymentIntentId: string | undefined;
    let paymentId: string | undefined;
    let bookingId: string | undefined;
    
    try {
      console.log('🔍 [MAKE_PAYMENT] Validating input data...');
      validatePaymentInput({ activityIds, lodgingId, locationId, startDate, endDate, guestsCount, nameCard, email, paymentMethodId, total, paymentType });
      console.log('✅ [MAKE_PAYMENT] Input validation passed');

      // Find activities with commission data
      console.log('🔍 [MAKE_PAYMENT] Fetching activities...', { activityIds });
      const activities = (await context.query.Activity.findMany({
        where: { id: { in: activityIds } },
        query: "id name price commission_type commission_value"
      })) as Activity[];
      console.log('📋 [MAKE_PAYMENT] Activities found:', activities.map(a => ({ id: a.id, name: a.name, price: a.price, commission_type: a.commission_type, commission_value: a.commission_value })));
      if (!activities || activities.length === 0) throw new Error("No valid activities found.");

      // Find lodging if applicable with commission data
      let lodging: Lodging = undefined;
      if (lodgingId) {
        console.log('🔍 [MAKE_PAYMENT] Fetching lodging...', { lodgingId });
        lodging = (await context.query.Lodging.findOne({
          where: { id: lodgingId },
          query: "id name price commission_type commission_value",
        })) as Lodging;
        console.log('🏨 [MAKE_PAYMENT] Lodging found:', lodging ? { id: lodging.id, name: lodging.name, price: lodging.price, commission_type: lodging.commission_type, commission_value: lodging.commission_value } : 'No lodging');
        if (!lodging) throw new Error("Selected lodging not found.");
      }
      
      console.log('💰 [MAKE_PAYMENT] Calculating totals...', { guestsCount, paymentType });
      const totalInBack = calculateTotalWithCommissions(activities, lodging, guestsCount, paymentType);

      const roundedTotalInBack = parseFloat(totalInBack.toFixed(2));
      const roundedFrontendTotal = parseFloat(Number(total).toFixed(2));
      
      console.log('💰 [MAKE_PAYMENT] Total comparison:', {
        frontendTotal: roundedFrontendTotal,
        backendTotal: roundedTotalInBack,
        match: roundedFrontendTotal === roundedTotalInBack
      });
      
      if (roundedFrontendTotal !== roundedTotalInBack) {
        console.error('❌ [MAKE_PAYMENT] Total mismatch detected!', {
          frontendTotal: roundedFrontendTotal,
          backendTotal: roundedTotalInBack,
          difference: Math.abs(roundedFrontendTotal - roundedTotalInBack)
        });
        return {
          message: `Communication error, please reload the page and try again.`,
          success: false,
        };
      }

      console.log('👤 [MAKE_PAYMENT] Fetching user...', { email });
      const user = (await context.query.User.findOne({
        where: { email },
        query: "id name email stripeCustomerId"
      })) as { id: string; name: string; email: string; stripeCustomerId: string };
      console.log('👤 [MAKE_PAYMENT] User found:', { id: user?.id, name: user?.name, email: user?.email, hasStripeCustomerId: !!user?.stripeCustomerId });
      if (!user) throw new Error("User not found.");

      if (!user.stripeCustomerId) {
        console.log('💳 [MAKE_PAYMENT] Creating Stripe customer...', { userId: user.id, email: user.email, name: user.name });
        const stripeCustomer = await Stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id
          }
        });
        console.log('💳 [MAKE_PAYMENT] Stripe customer created:', { customerId: stripeCustomer.id });
        await context.sudo().query.User.updateOne({
          where: { id: user.id },
          data: { stripeCustomerId: stripeCustomer.id }
        });
        user.stripeCustomerId = stripeCustomer.id;
        console.log('✅ [MAKE_PAYMENT] User updated with Stripe customer ID');
      }

      console.log('💳 [MAKE_PAYMENT] Fetching payment method...', { paymentMethodId });
      const paymentMethod = (await context.query.PaymentMethod.findOne({
        where: { id: paymentMethodId },
        query: "id stripeProcessorId stripePaymentMethodId"
      })) as { id: string; stripeProcessorId: string; stripePaymentMethodId: string };
      console.log('💳 [MAKE_PAYMENT] Payment method found:', { id: paymentMethod?.id, stripeProcessorId: paymentMethod?.stripeProcessorId, stripePaymentMethodId: paymentMethod?.stripePaymentMethodId });
      if (!paymentMethod) throw new Error("Payment method not found.");

      if (noDuplicatePaymentMethod) {
        console.log('🔗 [MAKE_PAYMENT] Attaching payment method to customer...', { 
          stripePaymentMethodId: paymentMethod.stripePaymentMethodId, 
          stripeCustomerId: user.stripeCustomerId 
        });
        await Stripe.paymentMethods.attach(paymentMethod.stripePaymentMethodId, {
          customer: user.stripeCustomerId,
        });
        await Stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.stripePaymentMethodId,
          },
        });
        console.log('✅ [MAKE_PAYMENT] Payment method attached and set as default');
      }

      const activityNames = activities.map(activity => activity.name).join(", ");
      const activityIdsStr = activities.map(activity => activity.id).join(",");

      const roundedTotal = roundedTotalInBack.toString();
      console.log('💳 [MAKE_PAYMENT] Creating Stripe payment intent...', {
        total: roundedTotal,
        activityNames,
        activityIds: activityIdsStr,
        lodgingId,
        userStripeCustomerId: user.stripeCustomerId,
        paymentMethodId: paymentMethod.stripePaymentMethodId
      });
      
      const stripePaymentIntent = await createStripePaymentIntent({
        total: roundedTotal,
        user,
        paymentMethod,
        activityNames,
        activityIds: activityIdsStr,
        lodgingId
      });
          
      paymentIntentId = stripePaymentIntent?.id;
      console.log('💳 [MAKE_PAYMENT] Stripe payment intent created:', { 
        paymentIntentId, 
        status: stripePaymentIntent?.status,
        amount: stripePaymentIntent?.amount,
        currency: stripePaymentIntent?.currency,
        hasError: !!stripePaymentIntent?.error
      });

      if (stripePaymentIntent?.error) {
        console.error('❌ [MAKE_PAYMENT] Stripe payment intent error:', stripePaymentIntent.error);
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
      console.log('💾 [MAKE_PAYMENT] Creating payment record...', {
        paymentMethodId,
        activityIds: activities.map(a => a.id),
        lodgingId: lodging?.id,
        userId: user.id,
        amount: roundedTotal,
        stripePaymentIntentId: stripePaymentIntent?.id
      });
      
      let payment = await context.query.Payment.createOne({
        data: {
          paymentMethod: { connect: { id: paymentMethodId } },
          activity: { connect: activities.map(activity => ({ id: activity.id })) },
          lodging: lodging ? { connect: { id: lodging.id } } : undefined,
          user: { connect: { id: user.id } },
          amount: roundedTotal,
          status: "succeeded",
          processorStripeChargeId: stripePaymentIntent?.id || "",
          notes,
        },
      });

      paymentId = payment.id;
      console.log('✅ [MAKE_PAYMENT] Payment record created:', { paymentId });

      const bookingStatus = paymentType === 'full_payment' ? 'paid' : 'reserved';
      console.log('📅 [MAKE_PAYMENT] Creating booking record...', {
        startDate,
        endDate,
        guestsAdults: Number(guestsCount),
        paymentType,
        bookingStatus,
        activityIds: activities.map(a => a.id),
        lodgingId: lodging?.id,
        locationId,
        userId: user.id,
        paymentId
      });
      
      const booking = await context.query.Booking.createOne({
        data: {
          start_date: startDate,
          end_date: endDate,
          guests_adults: Number(guestsCount),
          payment_type: paymentType,
          activity: { connect: activities.map(activity => ({ id: activity.id })) },
          lodging: lodging ? { connect: { id: lodging.id } } : undefined,
          location: { connect: { id: locationId } },
          user: { connect: { id: user.id } },
          payment: { connect: { id: payment.id } },
          status: bookingStatus,
        },
      });

      bookingId = booking.id;
      console.log('✅ [MAKE_PAYMENT] Booking record created:', { bookingId });

      console.log('💳 [MAKE_PAYMENT] Confirming Stripe payment intent...', { paymentIntentId });
      await Stripe.paymentIntents.confirm(paymentIntentId, {
        off_session: true
      });
      console.log('✅ [MAKE_PAYMENT] Stripe payment intent confirmed');

      console.log('🎉 [MAKE_PAYMENT] Payment process completed successfully!', {
        paymentId,
        bookingId,
        paymentIntentId,
        total: roundedTotal
      });
      
      return {
        message: "Tu pago y reserva han sido creadas exitosamente. En breve te llegara un correo de confirmación. Te estamos redirigiendo a la página de tu reserva...",
        success: true,
        data: { booking: booking.id },
      };
    } catch (e: any) {
      console.error('❌ [MAKE_PAYMENT] Error occurred during payment process:', {
        error: e.message,
        stack: e.stack,
        paymentIntentId,
        paymentId,
        bookingId,
        timestamp: new Date().toISOString()
      });
      
      if (paymentIntentId) {
        console.log('🔄 [MAKE_PAYMENT] Cancelling Stripe payment intent...', { paymentIntentId });
        try {
          await Stripe.paymentIntents.cancel(paymentIntentId);
          console.log('✅ [MAKE_PAYMENT] Stripe payment intent cancelled');
        } catch (cancelError) {
          console.error('❌ [MAKE_PAYMENT] Failed to cancel Stripe payment intent:', cancelError);
        }
      }

      if (paymentId) {
        console.log('🔄 [MAKE_PAYMENT] Updating payment status to cancelled...', { paymentId });
        await context.sudo().query.Payment.updateOne({
          where: { id: paymentId },
          data: { status: "cancelled", notes: notes + " - Reason for cancellation: Communication error with the server. " + e.message }
        });
        console.log('✅ [MAKE_PAYMENT] Payment status updated to cancelled');
      }

      if (bookingId) {
        console.log('🔄 [MAKE_PAYMENT] Updating booking status to cancelled...', { bookingId });
        await context.sudo().query.Booking.updateOne({
          where: { id: bookingId },
          data: { status: "cancelled",  }
        });
        console.log('✅ [MAKE_PAYMENT] Booking status updated to cancelled');
      }
      
      console.error('❌ [MAKE_PAYMENT] Returning error response:', {
        message: (e && typeof e === 'object' && 'message' in e) ? e.message : "We had communication problems with the server. Please try again.",
        success: false
      });
      
      return {
        message: (e && typeof e === 'object' && 'message' in e) ? e.message : "We had communication problems with the server. Please try again.",
        success: false,
      };
    }
  },
};

export default { typeDefs, definition, resolver };
