import { list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  calendarDay,
} from "@keystone-6/core/fields";
import access from "./LodgingFields.access";

export default list({
  access,
  fields: {
    day: calendarDay(),

    lodging: relationship({
      ref: "Lodging.available_days",
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

