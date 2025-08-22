import { list } from "@keystone-6/core";
import { text, timestamp, relationship,  select, integer } from "@keystone-6/core/fields";
import access from "./Lodging.access";

export default list({
  access,
  fields: {
    type: select({
      options: [
        { label: "Lugar Dedicado", value: 'spot' }, //only available in camping
        { label: "Cuarto privado", value: 'private_room' },
        { label: "Cuarto compartido", value: 'shared_room' },
      ],
      validation: { isRequired: true },
    }),
    description: text({ ui: { displayMode: "textarea" } }),
    max_person_capacity: integer(),
    lodging: relationship({
      ref: "Lodging.lodgingType",
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
