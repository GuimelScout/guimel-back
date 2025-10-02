import {  list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  integer,
  text,
} from "@keystone-6/core/fields";
import { contactHooks } from "./Contact.hooks";
import access from "./Contact.access";

export default list({
  access,
  hooks: contactHooks,
  fields: {
    name: text(),
    email: text(),
    phone: text(),
    message: text({ ui: { displayMode: "textarea" } }),
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
