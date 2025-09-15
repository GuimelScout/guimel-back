import { KeystoneContext } from "@keystone-6/core/types";

export async function createActivityWhatToDo(context: KeystoneContext, activities: any[]) {
  const existingWhatToDo = await context.sudo().query.ActivityWhatToDo.findMany({
    query: "id name",
  });
  
  if (existingWhatToDo.length > 0) {
    console.log("♻️  Skipped ActivityWhatToDo seeding - what to do already exist.");
    return existingWhatToDo;
  }

  const whatToDoData = [
    {
      name: "Nadar con Peces Tropicales",
      description: "Observa de cerca peces de colores vibrantes en su hábitat natural",
    },
    {
      name: "Explorar Corales Vivos",
      description: "Descubre la diversidad de corales y ecosistemas marinos",
    },
    {
      name: "Fotografía Submarina",
      description: "Captura momentos únicos de la vida marina con tu cámara",
    },
    {
      name: "Aprender sobre Conservación",
      description: "Conoce los esfuerzos de conservación marina en la zona",
    },
    {
      name: "Visitar Templos Mayas",
      description: "Explora los antiguos templos y estructuras ceremoniales",
    },
    {
      name: "Aprender Historia Maya",
      description: "Descubre la rica historia y cultura de la civilización maya",
    },
    {
      name: "Fotografiar Vistas Panorámicas",
      description: "Captura vistas espectaculares del mar Caribe desde las ruinas",
    },
    {
      name: "Caminar por la Muralla",
      description: "Recorre la antigua muralla defensiva de la ciudad maya",
    },
    {
      name: "Bucear en Arrecife Profundo",
      description: "Explora las profundidades del arrecife Palancar",
    },
    {
      name: "Ver Tortugas Marinas",
      description: "Encuentra tortugas marinas en su hábitat natural",
    },
    {
      name: "Explorar Cuevas Submarinas",
      description: "Descubre formaciones rocosas y cuevas bajo el agua",
    },
    {
      name: "Aprender Técnicas de Buceo",
      description: "Mejora tus habilidades de buceo con instructores expertos",
    }
  ];

  const whatToDo = [];
  
  for (const whatToDoItem of whatToDoData) {
    const whatToDoRecord = await context.sudo().query.ActivityWhatToDo.createOne({
      data: whatToDoItem,
      query: "id name description",
    });
    whatToDo.push(whatToDoRecord);
    console.log(`✅ Created activity what to do: ${whatToDoRecord.name}`);
  }

  // Assign what to do to activities based on type
  console.log("🔗 Assigning what to do to activities...");
  
  // Snorkel en Arrecife de Coral - water activities
  await context.sudo().query.Activity.updateOne({
    where: { id: activities[0].id },
    data: {
      whatToDo: {
        connect: [
          { id: whatToDo[0].id }, // Nadar con Peces Tropicales
          { id: whatToDo[1].id }, // Explorar Corales Vivos
          { id: whatToDo[2].id }, // Fotografía Submarina
          { id: whatToDo[3].id }, // Aprender sobre Conservación
        ]
      }
    }
  });
  console.log(`✅ Assigned what to do to ${activities[0].name}`);

  // Tour de Ruinas Mayas de Tulum - cultural activities
  await context.sudo().query.Activity.updateOne({
    where: { id: activities[1].id },
    data: {
      whatToDo: {
        connect: [
          { id: whatToDo[4].id }, // Visitar Templos Mayas
          { id: whatToDo[5].id }, // Aprender Historia Maya
          { id: whatToDo[6].id }, // Fotografiar Vistas Panorámicas
          { id: whatToDo[7].id }, // Caminar por la Muralla
        ]
      }
    }
  });
  console.log(`✅ Assigned what to do to ${activities[1].name}`);

  // Buceo en Arrecife Palancar - diving activities
  await context.sudo().query.Activity.updateOne({
    where: { id: activities[2].id },
    data: {
      whatToDo: {
        connect: [
          { id: whatToDo[8].id }, // Bucear en Arrecife Profundo
          { id: whatToDo[9].id }, // Ver Tortugas Marinas
          { id: whatToDo[10].id }, // Explorar Cuevas Submarinas
          { id: whatToDo[11].id }, // Aprender Técnicas de Buceo
        ]
      }
    }
  });
  console.log(`✅ Assigned what to do to ${activities[2].name}`);

  console.log("✅ ActivityWhatToDo seeding complete.");
  return whatToDo;
}
