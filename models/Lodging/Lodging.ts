import { graphql, list } from "@keystone-6/core";
import { text, timestamp, relationship, image, select, virtual, decimal } from "@keystone-6/core/fields";
import { linkHooks } from "./Lodging.hooks";
import access from "./Lodging.access";
import { calculateTotalPrice } from "../../utils/helpers/priceCalculation";

export default list({
  access,
  fields: {
    name: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: "textarea" } }),
    price: decimal(),
    commission_type: select({
      options: [
        { label: "Precio Fijo", value: 'fixed' },
        { label: "Porcentaje", value: 'percentage' }
      ],
      defaultValue: 'percentage',
      validation: { isRequired: true }
    }),
    commission_value: decimal({
      validation: { isRequired: true }
    }),
    total_price: virtual({
      field: graphql.field({
        type: graphql.Float,
        async resolve(item: any) {
          return calculateTotalPrice(
            item.price,
            item.commission_type,
            item.commission_value
          );
        },
      }),
    }),
    type_day: select({
      options: [
        { label: "Un día", value: 'one_day' },
        { label: "Cualquier día", value: 'any_day' },
        { label: "Solo entre semana", value: 'weekdays' },
        { label: "Solo fines de semana", value: 'weekends' },
        { label: "Rango de fechas", value: 'date_range' },
        { label: "Algunos días", value: 'some_days' }, // when user select some_days, AvailableDays save the info
      ],
      defaultValue: 'any_day',
      ui: {
       description: "Select the type of day the lodging is available. If you select 'some_days', you must select the days in the AvailableDays section.",
      },
    }),
    available_days: relationship({
      ref: "LodgingAvailableDay.lodging",
      many: true,
      ui: {
        description: "Select the days the lodging is available only if you select 'some_days' in the Type day section.",
      },
    }),
    status: select({
          options: [
            { label: "Disponible", value: 'available' },
            { label: "No Disponible", value: 'no_available' },
          ],
          validation: { isRequired: true },
        }),
    type: select({
          options: [
            { label: "Hotel", value: 'hotel' },
            { label: "Casa", value: 'house' },
            { label: "Departamento", value: 'department' },
            { label: "Campamento", value: 'camp' },
            { label: "Condominio", value: 'condominium' },
          ],
          validation: { isRequired: true },
        }),
    address:text({validation: { isRequired: true}}),
    lat: text(),
    lng: text(),
    hostBy: relationship({
      ref: "User.lodging",
    }),
    lodgingType: relationship({
      ref: "LodgingType.lodging",
      many: true,
    }),
    activity: relationship({
      ref: "Activity.lodging",
      many: true,
    }),
    payment: relationship({
      ref: "Payment.lodging",
      many: true,
    }),

    booking: relationship({
      ref: "Booking.lodging",
      many: true,
    }),
    reviewStar: virtual({
      field: graphql.field({
        type: graphql.Float,
        async resolve(item: any, args, context) {
          const reviews = await context.db.Review.findMany({
            where: { lodging: { id: { equals: item.id } } },
          });
    
          const ratings = reviews.map(review => ({ rating: review.rating as number }));
    
          if (ratings.length === 0) return 0;
    
          const averageRating =
            ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length;
    
          return parseFloat(averageRating.toFixed(2));
        },
      }),
    }),
    review: relationship({
      ref: "Review.lodging",
      many: true,
    }),
    location: relationship({
      ref: "Location.lodging",
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
    gallery: relationship({
      ref: "LodgingGallery.lodging",
      many: true,
    }),
    includes: relationship({
      ref: "LodgingInclude.lodging",
      many: true,
    }),
    logo: image({ storage: "s3_files" }),
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
