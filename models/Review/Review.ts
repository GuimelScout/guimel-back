import {  list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  integer,
  text,

} from "@keystone-6/core/fields";
import access from "../../utils/generalAccess/access";

export default list({
  access,
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
