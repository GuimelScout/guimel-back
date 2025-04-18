import { graphql, list } from "@keystone-6/core";
import {
  text,
  timestamp,
  relationship,
  decimal,
  select,
  virtual,
  image,
} from "@keystone-6/core/fields";
import access from "../../utils/generalAccess/access";
import { linkHooks } from "./Activity.hooks";
import { document } from '@keystone-6/fields-document';

export default list({
  access,
  fields: {
    name: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: "textarea" } }),
    descriptionActivities: document({
      formatting: true,
      links: true,
    }),
    address: text({ ui: { displayMode: "textarea",description:'You must add the address like: "street, zip neighborhood state country"' } }),
    price: decimal(),
    type_day: select({
      options: [
        { label: "Un día", value: 'one_day' },
        { label: "Cualquier día", value: 'any_day' },
        { label: "Solo entre semana", value: 'weekdays' },
        { label: "Solo fines de semana", value: 'weekends' },
        { label: "Rango de fechas", value: 'date_range' },
        { label: "Algunos días", value: 'some_days' }, // when user select some_days, AvailableDays save the info
      ],
      validation: { isRequired: true },
    }),
     is_available: virtual({
          field: graphql.field({
            type: graphql.Boolean,
            async resolve(item: any) {

              return true; 
            },
          }),
        }),
      reviewStar: virtual({
        field: graphql.field({
          type: graphql.Float,
          async resolve(item, args, context) {
            const reviews = await context.db.Review.findMany({
              where: { activity: { id: { equals: item.id } } },
            });
            const ratings = reviews.map(review => ({ rating: review.rating as number }));
            if (ratings.length === 0) return 0;
            const averageRating =
              ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length;
      
            return parseFloat(averageRating.toFixed(1));
          },
        }),
      }),
    includes: relationship({
      ref: "ActivityInclude.activity",
      many: true,
    }),
    whatToDo: relationship({
      ref: "ActivityWhatToDo.activity",
      many: true,
    }),
    available: relationship({
      ref: "ActivityAvailable.activity",
    }),
    available_days: relationship({
      ref: "ActivityAvailableDay.activity",
      many: true,
    }),
    lodging: relationship({
      ref: "Lodging.activity",
      many: true,
    }),
    booking: relationship({
      ref: "Booking.activity",
      many: true,
    }),
    review: relationship({
      ref: "Review.activity",
      many: true,
    }),
    location: relationship({
      ref: "Location.activity",
      many: true,
    }),
    gallery: relationship({
      ref: "ActivityGallery.activity",
      many: true,
    }),
    payment: relationship({
      ref: "Payment.activity",
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
    image: image({ storage: "local_images" }),
    hostBy: relationship({
      ref: "User.activity",
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
