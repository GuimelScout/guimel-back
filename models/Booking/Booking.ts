import { graphql, list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  calendarDay,
  integer,
  virtual,
  select,
} from "@keystone-6/core/fields";
import access from "../../utils/generalAccess/access";

export default list({
  access,
  fields: {
    start_date: calendarDay(),
    end_date: calendarDay(),
    guests_adults:integer(),
    guests_childs:integer(),
    guestss: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item: any) {
          return (item?.guests_adults ?? 0) + (item?.guests_childs ?? 0);
        },
      }),
    }),
    code: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item: any) {
          console.log("item");
          console.log(item);
          const fecha = new Date(item.createdAt);
          const day = fecha.getDate().toString().padStart(2, '0');
          const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
          const anio = fecha.getFullYear();
          const fechaFormateada = `${day}${month}${anio}`;
          return `${item.id.toString().slice(-6).toUpperCase()}-${fechaFormateada}`;
        },
      }),
    }),
    status: select({
      type: "enum",
      validation: {
        isRequired: true,
      },
      defaultValue: "pending",
      options: [
        { label: "Pendiente", value: "pending" },
        { label: "Pagado", value: "paid" },
        { label: "Cancelado", value: "cancelled" },
        { label: "Confirmado", value: "confirmed" },
        { label: "Completado", value: "completed" },
      ],
    }),
    activity: relationship({
      ref: "Activity.booking",
    }),
    lodging: relationship({
      ref: "Lodging.booking",
    }),
    user: relationship({
      ref: "User.booking",
    }),
    payment: relationship({
      ref: "Payment.booking",
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
