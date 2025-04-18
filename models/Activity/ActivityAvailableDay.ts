import { list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  calendarDay,
} from "@keystone-6/core/fields";
import access from "../../utils/generalAccess/access";

export default list({
  access,
  fields: {
    day: calendarDay(),

    activity: relationship({
      ref: "Activity.available_days",
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
