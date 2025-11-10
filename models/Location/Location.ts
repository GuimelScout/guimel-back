import { list } from "@keystone-6/core";
import {
  timestamp,
  relationship,
  text,
  image,
  select,
} from "@keystone-6/core/fields";
import { linkHooks } from "./Location.hooks";
import access from "./Location.access";

export default list({
  access,
  fields: {
    name: text(),
    description: text({ ui: { displayMode: "textarea" } }),
    type: select({
      options: [
        { label: "Area de Proteccion de Flora y Fauna", value: "flora_and_fauna_protection_area" },
        { label: "Area de Protección de Recursos Naturales", value: "natural_resources_protection_area" },
        { label: "Monumento Natural", value: "natural_monument" },
        { label: "Parque Nacional", value: "national_park" },
        { label: "Reserva de la Biosfera", value: "biosphere_reserve" },
        { label: "Santuario", value: "sanctuary" },
      ],
    }),
    technicalSheetUrl: text({
      label: "Link a Ficha Técnica de la ANP",
      ui: {
        description: "URL para acceder a la ficha técnica del Área Natural Protegida",
      },
    }),
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
    services: relationship({
      ref: "LocationService.location",
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
