import { list } from "@keystone-6/core";
import {
  text,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import access from "./Location.access";

export default list({
  access,
  fields: {
    name: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: "textarea" } }),

    location: relationship({
      ref: "Location.services",
      many: true,
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

