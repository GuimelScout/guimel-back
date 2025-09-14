import { graphql, list } from "@keystone-6/core";
import {
  text,
  password,
  timestamp,
  relationship,
  virtual,
  image,
  checkbox,
  select,
} from "@keystone-6/core/fields";
import { emailHooks, hooksUser, linkHooks, phoneHooks } from "./User.hooks";
import access from "./User.access";
import { hasRole } from "../../auth/permissions";
import { Role } from "../Role/constants";

export default list({
  access,
  hooks: hooksUser,
  fields: {
    name: text({ validation: { isRequired: true } }),
    lastName: text({validation: { isRequired: true },}),
    secondLastName: text(),
    email: text({
      isIndexed: "unique",
      validation: { isRequired: true },
      hooks: emailHooks,
    }),
    password: password({
      validation: { isRequired: true },
    }),
    countryCode: text(),
    phone: text({
      hooks: phoneHooks,
    }),
    description: text({ ui: { displayMode: "textarea" } }),
    instagram: text(),
    facebook: text(),
    twitter: text(),
    linkedin: text(),
    tiktok: text(),
    youtube: text(),
    website: text(),
    stripeCustomerId: text(),
    role: relationship({
      ref: "Role.user",
      many: true,
      access: {
        update: ({ session }) => hasRole(session, [Role.ADMIN]),
      },
    }),
    lodging: relationship({
      ref: "Lodging.hostBy",
      many: true,
    }),
    booking: relationship({
      ref: "Booking.user",
      many: true,
    }),
    reviewStar: virtual({
      field: graphql.field({
        type: graphql.Float,
        async resolve(item, args, context) {
          const reviews = await context.db.Review.findMany({
            //@ts-ignore
            where: { user: { id: { equals: item.id } } },
          });
          const ratings = reviews.map(review => ({ rating: review.rating as number }));
          if (ratings.length === 0) return 0;
          const averageRating =
            ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length;
          return parseFloat(averageRating.toFixed(2));
        },
      }),
    }),
    reviews: relationship({
      ref: "Review.user",
      many: true,
    }),
    link: text({
      isIndexed: "unique",
      hooks: linkHooks,
      ui: {
        createView: {
          fieldMode: "hidden",
        },
      },
    }),
    status: select({
      type: "enum",
      validation: {
        isRequired: true,
      },
      defaultValue: "initial",
      options: [
        { label: "Inicial", value: "initial" },
        { label: "Registro completado", value: "registration_done" },
        { label: "Verificado", value: "verified" },
      ],
    }),
    activity: relationship({
      ref: "Activity.hostBy",
      many: true,
    }),
    payment: relationship({
      ref: "Payment.user",
      many: true,
    }),
    paymentMethod: relationship({
      ref: "PaymentMethod.user",
      many: true,
    }),
    verified: checkbox(),
    image: image({ storage: "s3_files" }),

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