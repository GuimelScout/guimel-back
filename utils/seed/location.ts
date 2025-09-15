import { KeystoneContext } from "@keystone-6/core/types";

export async function createLocations(context: KeystoneContext) {
  const existingLocations = await context.sudo().query.Location.findMany({
    query: "id name",
  });
  
  if (existingLocations.length > 0) {
    console.log("♻️  Skipped Location seeding - locations already exist.");
    return existingLocations;
  }

  const locationsData = [
    {
      name: "Playa del Carmen",
      description: "Una de las playas más hermosas de la Riviera Maya, conocida por sus aguas cristalinas, arena blanca y vibrante vida nocturna. Perfecta para actividades acuáticas y relajación.",
    },
    {
      name: "Tulum",
      description: "Un destino místico que combina ruinas mayas con playas paradisíacas. Tulum ofrece una experiencia única donde la historia antigua se encuentra con la belleza natural del Caribe mexicano.",
    },
    {
      name: "Cozumel",
      description: "La isla más grande de México, famosa por sus arrecifes de coral y buceo de clase mundial. Cozumel es un paraíso para los amantes del mar y la aventura submarina.",
    }
  ];

  const locations = [];
  
  for (const locationData of locationsData) {
    const location = await context.sudo().query.Location.createOne({
      data: locationData,
      query: "id name description",
    });
    locations.push(location);
    console.log(`✅ Created location: ${location.name}`);
  }

  console.log("✅ Location seeding complete.");
  return locations;
}
