import { list } from "@keystone-6/core";
import { timestamp, select, relationship } from "@keystone-6/core/fields";
import { Role, role_options } from "./constants";
import access from "./Role.access";
import { hasRole } from "../../auth/permissions";

export default list({
  access,
  fields: {
    name: select({
      options: role_options,
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    user: relationship({
      ref: "User.role",
      many: true,
      access: {
        update: ({ session }) => hasRole(session, [Role.ADMIN]),
      },
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
