import { list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  text,
  select,
  decimal,
} from "@keystone-6/core/fields";
import access from "./Payment.access";

export default list({
  access,
  fields: {
    amount: decimal({
      scale: 6,
      defaultValue: "0.000000",
    }),
    status: select({
      type: "enum",
      validation: {
        isRequired: true,
      },
      defaultValue: "pending",
      options: [
        { label: "Pendiente", value: "pending" },
        { label: "Procesando", value: "processing" },
        { label: "Exitoso", value: "succeeded" },
        { label: "Cancelado", value: "cancelled" },
        { label: "Fallido", value: "failed" },
        { label: "Devuelto", value: "refunded" },
      ],
    }),
    processorStripeChargeId: text(),
    stripeErrorMessage: text({
      ui: {
        displayMode: "textarea",
      },
    }),
    processorRefundId: text(),
    notes: text(),
    activity: relationship({
      ref: "Activity.payment",
    }),
    lodging: relationship({
      ref: "Lodging.payment",
    }),
    user: relationship({
      ref: "User.payment",
    }),
    booking: relationship({
      ref: "Booking.payment",
    }),
    paymentMethod: relationship({
      ref: "PaymentMethod.payment",
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
