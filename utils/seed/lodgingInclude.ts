import { KeystoneContext } from "@keystone-6/core/types";

export async function createLodgingIncludes(context: KeystoneContext, lodging: any[]) {
  const existingIncludes = await context.sudo().query.LodgingInclude.findMany({
    query: "id name",
  });
  
  if (existingIncludes.length > 0) {
    console.log("♻️  Skipped LodgingInclude seeding - includes already exist.");
    return existingIncludes;
  }

  const includesData = [
    {
      name: "WiFi Gratuito",
      description: "Conexión a internet de alta velocidad incluida en el precio",
    },
    {
      name: "Desayuno Continental",
      description: "Desayuno buffet con opciones locales e internacionales",
    },
    {
      name: "Aire Acondicionado",
      description: "Climatización individual en todas las habitaciones",
    },
    {
      name: "Piscina",
      description: "Piscina al aire libre con área de descanso",
    },
    {
      name: "Estacionamiento",
      description: "Estacionamiento gratuito para huéspedes",
    },
    {
      name: "Servicio de Limpieza",
      description: "Limpieza diaria de habitaciones",
    },
    {
      name: "Terraza Privada",
      description: "Terraza con vista al mar o jardín",
    },
    {
      name: "Cocina Equipada",
      description: "Cocina completa con electrodomésticos modernos",
    },
    {
      name: "Equipos de Buceo",
      description: "Alquiler gratuito de equipos de buceo y snorkel",
    },
    {
      name: "Transporte al Aeropuerto",
      description: "Servicio de traslado desde y hacia el aeropuerto",
    }
  ];

  const includes = [];
  
  for (const includeData of includesData) {
    const include = await context.sudo().query.LodgingInclude.createOne({
      data: includeData,
      query: "id name description",
    });
    includes.push(include);
    console.log(`✅ Created lodging include: ${include.name}`);
  }

  // Assign includes to lodging based on type and location
  console.log("🔗 Assigning includes to lodging...");
  
  // Hotel Boutique Playa del Carmen - luxury hotel includes
  await context.sudo().query.Lodging.updateOne({
    where: { id: lodging[0].id },
    data: {
      includes: {
        connect: [
          { id: includes[0].id }, // WiFi
          { id: includes[1].id }, // Desayuno
          { id: includes[2].id }, // Aire Acondicionado
          { id: includes[3].id }, // Piscina
          { id: includes[4].id }, // Estacionamiento
          { id: includes[5].id }, // Servicio de Limpieza
          { id: includes[6].id }, // Terraza Privada
        ]
      }
    }
  });
  console.log(`✅ Assigned includes to ${lodging[0].name}`);

  // Casa Maya Tulum - house with local experience includes
  await context.sudo().query.Lodging.updateOne({
    where: { id: lodging[1].id },
    data: {
      includes: {
        connect: [
          { id: includes[0].id }, // WiFi
          { id: includes[2].id }, // Aire Acondicionado
          { id: includes[4].id }, // Estacionamiento
          { id: includes[6].id }, // Terraza Privada
          { id: includes[7].id }, // Cocina Equipada
        ]
      }
    }
  });
  console.log(`✅ Assigned includes to ${lodging[1].name}`);

  // Resort de Buceo Cozumel - diving resort includes
  await context.sudo().query.Lodging.updateOne({
    where: { id: lodging[2].id },
    data: {
      includes: {
        connect: [
          { id: includes[0].id }, // WiFi
          { id: includes[1].id }, // Desayuno
          { id: includes[2].id }, // Aire Acondicionado
          { id: includes[3].id }, // Piscina
          { id: includes[4].id }, // Estacionamiento
          { id: includes[5].id }, // Servicio de Limpieza
          { id: includes[8].id }, // Equipos de Buceo
          { id: includes[9].id }, // Transporte al Aeropuerto
        ]
      }
    }
  });
  console.log(`✅ Assigned includes to ${lodging[2].name}`);

  console.log("✅ LodgingInclude seeding complete.");
  return includes;
}
