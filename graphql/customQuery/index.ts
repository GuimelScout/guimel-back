import setupIntent from "./paymentMethod/setupIntent";
import stripePaymentMethods from "./paymentMethod/stripePaymentMethods";

const customQuery = {
  typeDefs: `
    ${setupIntent.typeDefs}
    ${stripePaymentMethods.typeDefs}
  `,
  definitions: `
    ${setupIntent.definition}
    ${stripePaymentMethods.definition}
  `,
  resolvers: {
    ...setupIntent.resolver,
    ...stripePaymentMethods.resolver,
  },
};

export default customQuery;
