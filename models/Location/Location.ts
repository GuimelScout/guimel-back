import { list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  text,
  image,
} from "@keystone-6/core/fields";
import { linkHooks } from "./Location.hooks";
import access from "./Location.access";

export default list({
  access,
  fields: {
    name: text(),
    description: text({ ui: { displayMode: "textarea" } }),
    activity: relationship({
      ref: "Activity.location",
      many: true,
    }),
    lodging: relationship({
      ref: "Lodging.location",
      many: true,
    }),
    booking: relationship({
      ref: "Booking.location",
      many: true,
    }),
    image: image({ storage: "s3_files" }),
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
      ref: "LocationGallery.location",
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
  },
});
