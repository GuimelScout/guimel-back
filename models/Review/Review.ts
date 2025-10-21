import {  list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  integer,
  text,
} from "@keystone-6/core/fields";
import { reviewHooks } from "./Review.hooks";
import access from "./Review.access";

export default list({
  access,
  hooks: reviewHooks,
  fields: {
    review: text(),
    rating: integer(),
    activity:relationship({
      ref: "Activity.review",
    }),
    lodging:relationship({
      ref: "Lodging.review",
    }),
    user: relationship({
      ref: "User.reviews",
    }),
    createdBy: relationship({
      ref: "User.createdBy",
    }),
    createdAt: timestamp({
      defaultValue: {
        kind: "now",
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    }),
  },
});
