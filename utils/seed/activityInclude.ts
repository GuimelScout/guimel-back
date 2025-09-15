import { KeystoneContext } from "@keystone-6/core/types";

export async function createActivityIncludes(context: KeystoneContext, activities: any[]) {
  const existingIncludes = await context.sudo().query.ActivityInclude.findMany({
    query: "id name",
  });
  
  if (existingIncludes.length > 0) {
    console.log("♻️  Skipped ActivityInclude seeding - includes already exist.");
    return existingIncludes;
  }

  const includesData = [
    {
      name: "Equipo de Snorkel",
      description: "Máscara, snorkel y aletas incluidas en el precio",
    },
    {
      name: "Guía Certificado",
      description: "Guía profesional certificado en buceo y vida marina",
    },
    {
      name: "Transporte desde Hotel",
      description: "Recogida y regreso desde tu hotel en Playa del Carmen",
    },
    {
      name: "Refrigerio y Agua",
      description: "Snacks ligeros y agua embotellada durante la actividad",
    },
    {
      name: "Seguro de Actividad",
      description: "Seguro de accidentes durante la actividad acuática",
    },
    {
      name: "Fotografía Submarina",
      description: "Fotos profesionales bajo el agua (opcional)",
    },
    {
      name: "Entrada a Ruinas",
      description: "Entrada incluida al sitio arqueológico de Tulum",
    },
    {
      name: "Guía Arqueológico",
      description: "Guía especializado en historia y cultura maya",
    },
    {
      name: "Transporte en Van",
      description: "Transporte cómodo desde Cancún o Playa del Carmen",
    },
    {
      name: "Almuerzo Típico",
      description: "Almuerzo con comida tradicional mexicana",
    },
    {
      name: "Equipo de Buceo Completo",
      description: "Regulador, chaleco, tanque, wetsuit y accesorios",
    },
    {
      name: "Instructor de Buceo",
      description: "Instructor certificado PADI para principiantes y avanzados",
    },
    {
      name: "Boat Trip",
      description: "Paseo en barco hasta los sitios de buceo",
    },
    {
      name: "Certificado de Buceo",
      description: "Certificación de buceo para principiantes (opcional)",
    }
  ];

  const includes = [];
  
  for (const includeData of includesData) {
    const include = await context.sudo().query.ActivityInclude.createOne({
      data: includeData,
      query: "id name description",
    });
    includes.push(include);
    console.log(`✅ Created activity include: ${include.name}`);
  }

  // Assign includes to activities based on type
  console.log("🔗 Assigning includes to activities...");
  
  // Snorkel en Arrecife de Coral - water activity includes
  await context.sudo().query.Activity.updateOne({
    where: { id: activities[0].id },
    data: {
      includes: {
        connect: [
          { id: includes[0].id }, // Equipo de Snorkel
          { id: includes[1].id }, // Guía Certificado
          { id: includes[2].id }, // Transporte desde Hotel
          { id: includes[3].id }, // Refrigerio y Agua
          { id: includes[4].id }, // Seguro de Actividad
          { id: includes[5].id }, // Fotografía Submarina
        ]
      }
    }
  });
  console.log(`✅ Assigned includes to ${activities[0].name}`);

  // Tour de Ruinas Mayas de Tulum - cultural activity includes
  await context.sudo().query.Activity.updateOne({
    where: { id: activities[1].id },
    data: {
      includes: {
        connect: [
          { id: includes[6].id }, // Entrada a Ruinas
          { id: includes[7].id }, // Guía Arqueológico
          { id: includes[8].id }, // Transporte en Van
          { id: includes[9].id }, // Almuerzo Típico
          { id: includes[4].id }, // Seguro de Actividad
        ]
      }
    }
  });
  console.log(`✅ Assigned includes to ${activities[1].name}`);

  // Buceo en Arrecife Palancar - diving activity includes
  await context.sudo().query.Activity.updateOne({
    where: { id: activities[2].id },
    data: {
      includes: {
        connect: [
          { id: includes[10].id }, // Equipo de Buceo Completo
          { id: includes[11].id }, // Instructor de Buceo
          { id: includes[12].id }, // Boat Trip
          { id: includes[3].id }, // Refrigerio y Agua
          { id: includes[4].id }, // Seguro de Actividad
          { id: includes[13].id }, // Certificado de Buceo
        ]
      }
    }
  });
  console.log(`✅ Assigned includes to ${activities[2].name}`);

  console.log("✅ ActivityInclude seeding complete.");
  return includes;
}
