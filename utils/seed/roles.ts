import { KeystoneContext } from "@keystone-6/core/types";
import { rolesDB } from "../../models/Role/constants";

export async function createRoles(context: KeystoneContext) {
  const roles = await context.sudo().query.Role.findMany({
    query: "id",
  });
  if (roles.length > 0) {
    console.log("♻️ Skipped roles seeding.");
    return roles;
  }

  const roless = await context.sudo().query.Role.createMany({
    data: rolesDB,
    query: "id",
  });

  console.log("✅ Role seeding complete.");

  return roless;
}
