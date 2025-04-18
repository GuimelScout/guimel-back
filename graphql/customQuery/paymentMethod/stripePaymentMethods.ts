import { KeystoneContext } from "@keystone-6/core/types";
import Stripe from "../../../integrations/stripe";

const typeDefs = `
  type StripeCard {
    brand: String
    country: String
    exp_month: Int
    exp_year: Int
    last4: String
  }

  type StripePaymentMethod {
    id: String
    object: String
    customer: String
    type: String
    card: StripeCard
    created: Int
    livemode: Boolean
    metadata: JSON
  }

  type StripePaymentMethodsData {
    data: [StripePaymentMethod]
  }

  type StripePaymentMethodsType {
    message: String,
    success: Boolean,
    data: StripePaymentMethodsData
  }
`;

const definition = `
  StripePaymentMethods(email: String!): StripePaymentMethodsType
`;

const resolver = { StripePaymentMethods: async (root: any, {email}: {email:string}, context: KeystoneContext) => {

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
      const paymentMethods = await Stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      });

      return {
        message: "",
        success: true,
        data: {
          data: paymentMethods.data
        },
      };
    } catch (e: any) {
      return {
        message: e,
        success: false,
        data: {},
      };
    }
  },
};

export default { typeDefs, definition, resolver };
