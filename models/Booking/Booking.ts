import { graphql, list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  calendarDay,
  integer,
  virtual,
  select,
  text,
} from "@keystone-6/core/fields";
import { bookingHooks } from "./Booking.hooks";
import access from "./Booking.access";

export default list({
  access,
  hooks: bookingHooks,
  fields: {
    start_date: calendarDay(),
    end_date: calendarDay(),
    guests_adults:integer(),
    guests_childs:integer(),
    guestsCount: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item: any) {
          return (item?.guests_adults ?? 0) + (item?.guests_childs ?? 0);
        },
      }),
    }),
    code: text({
      isIndexed: "unique",
      ui: {
        createView: {
          fieldMode: "hidden",
        },
      },
    }),
    payment_type: select({
      options: [
        { label: "Pago Completo", value: 'full_payment' },
        { label: "Solo Comisión", value: 'commission_only' }
      ],
      validation: { isRequired: true },
      defaultValue: 'full_payment'
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
        { label: "Reservado", value: "reserved" },
        { label: "Cancelado", value: "cancelled" },
        { label: "Confirmado", value: "confirmed" },
        { label: "Completado", value: "completed" },
      ],
    }),
    activity: relationship({
      ref: "Activity.booking",
      many: true,
    }),
    lodging: relationship({
      ref: "Lodging.booking",
    }),
    location: relationship({
      ref: "Location.booking",
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
