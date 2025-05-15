import { list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  image,
  text,
} from "@keystone-6/core/fields";
import access from "../../utils/generalAccess/access";

export default list({
  access,
  fields: {
    description: text(),
    image: image({ storage: "s3_files" }),
    lodging: relationship({
      ref: "Lodging.gallery",
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
