import { list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  text,
  image,
} from "@keystone-6/core/fields";
import access from "../../utils/generalAccess/access";
import { linkHooks } from "./Location.hooks";

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
    image: image({ storage: "local_images" }),
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
