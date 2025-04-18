import makePayment from "./makePayment";

const customMutation = {
  typeDefs: `
    ${makePayment.typeDefs}
  `,
  definitions: `
    ${makePayment.definition}
  `,
  resolvers: {
    ...makePayment.resolver,
  },
};

export default customMutation;
