import {
  text,
  checkbox,
  timestamp,
  relationship,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import access from "./Payment.access";

export default list({
  access,
  fields: {
    cardType: text(),
    isDefault: checkbox(),
    lastFourDigits: text(),
    expMonth: text(),
    expYear: text(),
    stripeProcessorId: text(),
    stripePaymentMethodId: text({isIndexed: "unique",}),
    address: text(),
    postalCode: text(),
    ownerName: text(),
    country: text(), // Two-letter country code (ISO 3166-1 alpha-2).
    payment: relationship({
      ref: "Payment.paymentMethod",
      many: true,
    }),
    user: relationship({
      ref: "User.paymentMethod",
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
    updatedAt: timestamp({
      defaultValue: { kind: "now" },
      db: { updatedAt: true },
    }),
  },
});
