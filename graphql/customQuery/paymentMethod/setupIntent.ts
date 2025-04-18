import { KeystoneContext } from "@keystone-6/core/types";
import Stripe from "../../../integrations/stripe";


const typeDefs = `
  type SetUpIntentData {
    setupIntent: String,
    ephemeralKey: String,
    customerId: String,
    email: String,
  }

  type SetUpIntentStripeType {
    message: String,
    success: Boolean,
    data: SetUpIntentData
  }
`;

const definition = `
  SetUpIntentStripe(email: String!): SetUpIntentStripeType
`;

const resolver = { SetUpIntentStripe: async (root: any, {email}: {email:string}, context: KeystoneContext) => {
    //validateAccess(context.session, [Role.CLIENT]);

    console.log("context.session");
    console.log(context.session);

    const user = await context.query.User.findOne({
      where: {
        email: email,
      },
      query: "id name stripeCustomerId"
    });

    const stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      return {
        message: "Missing stripe customer id",
        success: false,
        data: {},
      };
    }

    try {
      const ephemeralKey = await Stripe.ephemeralKeys.create(
        { customer: stripeCustomerId },
        { apiVersion: "2023-10-16" },
      );

      const setupIntent = await Stripe.setupIntents.create({
        payment_method_types: ["card"],
        customer: stripeCustomerId,
        usage: "off_session",
      });

      const paymentMethods = await Stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      });

      return {
        message: "",
        success: true,
        data: {
          setupIntent: setupIntent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customerId: stripeCustomerId,
        },
      };
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log(e);
      return {
        message: e,
        success: false,
        data: {},
      };
    }
  },
};

export default { typeDefs, definition, resolver };
