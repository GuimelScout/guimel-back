import { KeystoneContext } from "@keystone-6/core/types";
export async function createOrganization(
  context: KeystoneContext,
  userID: string
) {
  const org = await context.sudo().query.Organization.findMany({
    query: "id",
  });
  if (org.length > 0) {
    console.log("♻️  Skipped Organization seeding.");
    return org[0].id;
  }

  const data = await context.sudo().query.Organization.createOne({
    data: {
      name: "Guimel",
      notes: "G",
      user: { connect: { id: userID } },
    },
    query: "id",
  });
  console.log("✅ Organization seeding complete.");

  return data.id;
}
