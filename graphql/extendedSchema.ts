import type { GraphQLSchema } from "graphql";
import { mergeSchemas } from "@graphql-tools/schema";

import customMutation from "./customMutation";
import customQuery from "./customQuery";

export default function extendGraphqlSchema(baseSchema: GraphQLSchema) {
  return mergeSchemas({
    schemas: [baseSchema],
    typeDefs: `
      ${customQuery.typeDefs}
      ${customMutation.typeDefs}

      type Mutation {
        ${customMutation.definitions}
      }

      type Query {
        ${customQuery.definitions}
      }
      
    `,
    resolvers: {
      Mutation: {
        ...customMutation.resolvers,
      },

      Query: {
        ...customQuery.resolvers,
      },

    },
  });
}
