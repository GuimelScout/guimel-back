import { KeystoneContext } from "@keystone-6/core/types";

export async function createLodging(context: KeystoneContext, activities: any[], locations: any[]) {
  const existingLodging = await context.sudo().query.Lodging.findMany({
    query: "id name",
  });
  
  if (existingLodging.length > 0) {
    console.log("♻️  Skipped Lodging seeding - lodging already exist.");
    return existingLodging;
  }

  const lodgingData = [
    {
      name: "Hotel Boutique Playa del Carmen",
      description: "Un encantador hotel boutique ubicado en el corazón de Playa del Carmen, a solo 2 cuadras de la playa. Perfecto para parejas y familias que buscan comodidad y proximidad a las actividades acuáticas.",
      price: "120.00",
      commission_type: "percentage",
      commission_value: "10.00",
      status: "available",
      type: "hotel",
      address: "Calle 5 Norte entre Av. 5 y 10, 77710 Playa del Carmen, Quintana Roo, México",
      lat: "20.6286",
      lng: "-87.0739",
      activity: { connect: { id: activities[0].id } }, // Snorkel activity
      location: { connect: { id: locations[0].id } }, // Playa del Carmen
    },
    {
      name: "Casa Maya Tulum",
      description: "Una hermosa casa tradicional maya renovada, ubicada cerca de las ruinas de Tulum. Ofrece una experiencia auténtica con todas las comodidades modernas y fácil acceso a los sitios arqueológicos.",
      price: "95.00",
      commission_type: "percentage",
      commission_value: "8.00",
      status: "available",
      type: "house",
      address: "Carretera Tulum-Coba Km 2.5, 77780 Tulum, Quintana Roo, México",
      lat: "20.2118",
      lng: "-87.4654",
      activity: { connect: { id: activities[1].id } }, // Ruinas Mayas activity
      location: { connect: { id: locations[1].id } }, // Tulum
    },
    {
      name: "Resort de Buceo Cozumel",
      description: "Un resort especializado en buceo ubicado en la costa de Cozumel. Ofrece paquetes completos de buceo, equipos de primera calidad y acceso directo a los mejores sitios de buceo de la isla.",
      price: "150.00",
      commission_type: "percentage",
      commission_value: "12.00",
      status: "available",
      type: "hotel",
      address: "Carretera Costera Sur Km 12, 77600 Cozumel, Quintana Roo, México",
      lat: "20.4229",
      lng: "-86.9223",
      activity: { connect: { id: activities[2].id } }, // Buceo activity
      location: { connect: { id: locations[2].id } }, // Cozumel
    }
  ];

  const lodging = [];
  
  for (const lodgingItem of lodgingData) {
    const lodgingRecord = await context.sudo().query.Lodging.createOne({
      data: lodgingItem,
      query: "id name price type activity { id name } location { id name }",
    });
    lodging.push(lodgingRecord);
    console.log(`✅ Created lodging: ${lodgingRecord.name} (${lodgingRecord.type}) for ${lodgingRecord.activity?.name || 'Unknown'} activity`);
  }

  console.log("✅ Lodging seeding complete.");
  return lodging;
}
