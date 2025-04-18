import {  graphql, list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  calendarDay,
  virtual,
  checkbox,
} from "@keystone-6/core/fields";
import access from "../../utils/generalAccess/access";

export default list({
  access,
  fields: {
    start_date: calendarDay(),
    end_date: calendarDay(),
    specific_date: calendarDay(),
    duration_days: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item: any) {
          if (item?.start_date && item?.end_date) {
            const startDate = new Date(item.start_date);
            const endDate = new Date(item.end_date);
    
            const diffTime = endDate.getTime() - startDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
            return diffDays.toString();
          }else if (item?.specific_date){
            return "1";
          }
          return "0"; 
        },
      }),
    }),
    monday: checkbox({defaultValue:true}),
    tuesday: checkbox({defaultValue:true}),
    wednesday: checkbox({defaultValue:true}),
    thursday: checkbox({defaultValue:true}),
    friday: checkbox({defaultValue:true}),
    saturday: checkbox({defaultValue:true}),
    sunday: checkbox({defaultValue:true}),

    activity: relationship({
      ref: "Activity.available",
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
