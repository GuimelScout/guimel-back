import { KeystoneContext } from "@keystone-6/core/types";

export async function createActivities(context: KeystoneContext, locations: any[]) {
  const existingActivities = await context.sudo().query.Activity.findMany({
    query: "id name",
  });
  
  if (existingActivities.length > 0) {
    console.log("♻️  Skipped Activity seeding - activities already exist.");
    return existingActivities;
  }

  const activitiesData = [
    {
      name: "Snorkel en Arrecife de Coral",
      description: "Explora los increíbles arrecifes de coral de Playa del Carmen con nuestro tour de snorkel. Nada junto a peces tropicales y descubre la vida marina del Caribe mexicano.",
      address: "Calle 10 Norte, 77710 Playa del Carmen, Quintana Roo, México",
      price: "45.00",
      type_day: "one_day",
      location: { connect: { id: locations[0].id } }, // Playa del Carmen
    },
    {
      name: "Tour de Ruinas Mayas de Tulum",
      description: "Descubre la historia antigua de los mayas en las impresionantes ruinas de Tulum. Una experiencia única que combina arqueología con vistas espectaculares al mar Caribe.",
      address: "Carretera Tulum-Coba Km 1, 77780 Tulum, Quintana Roo, México",
      price: "65.00",
      type_day: "one_day",
      location: { connect: { id: locations[1].id } }, // Tulum
    },
    {
      name: "Buceo en Arrecife Palancar",
      description: "Sumérgete en uno de los mejores sitios de buceo del mundo en Cozumel. El arrecife Palancar ofrece una experiencia submarina inolvidable con corales y vida marina abundante.",
      address: "Marina Cozumel, 77600 Cozumel, Quintana Roo, México",
      price: "85.00",
      type_day: "one_day",
      location: { connect: { id: locations[2].id } }, // Cozumel
    }
  ];

  const activities = [];
  
  for (const activityData of activitiesData) {
    const activity = await context.sudo().query.Activity.createOne({
      data: activityData,
      query: "id name price location { id name }",
    });
    activities.push(activity);
    console.log(`✅ Created activity: ${activity.name} in ${activity.location?.name || 'Unknown'}`);
  }

  console.log("✅ Activity seeding complete.");
  return activities;
}
