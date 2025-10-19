import { sendConfirmationEmail, sendConfirmationSMS } from "../../utils/notification";
import { getBookingCode } from "../../utils/helpers/bookingCode";

export const bookingHooks = {
    afterOperation: async ({ operation, item, context }: any) => {
      if (operation === 'create') {
        let code = getBookingCode({ id: item.id, createdAt: item.createdAt });
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          const existingBooking = await context.query.Booking.findOne({
            where: { code: code },
          });
          
          if (!existingBooking) {
            break;
          }
          
          code = getBookingCode({ 
            id: item.id + Math.random().toString(36).substring(2, 8), 
            createdAt: item.createdAt 
          });
          attempts++;
        }
        
        if (attempts >= maxAttempts) {
          return;
        }
        
        await context.sudo().query.Booking.updateOne({
          where: { id: item.id },
          data: { code: code }
        });

        if (item.user?.id) {
          const [user, activities, location] = await Promise.all([
            context.query.User.findOne({
              where: { id: item.user.id },
              query: 'id name lastName email phone countryCode',
            }),

          
            context.query.Activity.findMany({
              where: { booking: { some: { id: { equals: item.id } } } },
              query: 'id name hostBy { id } location { name image { url } }',
            }),

            context.query.Location.findOne({
              where: { id: item.location?.id },
              query: 'name image { url }',
            }),
          ]);

          let lodging: any;
          if(item.lodging?.id){
            lodging = await context.query.Lodging.findOne({
              where: { id: item.lodging.id },
              query: 'id name',
            });
          }

          const hostIds = activities.map((activity:any) => activity.hostBy?.id).filter(Boolean);

          const users = await context.query.User.findMany({
            where: { id: { in: hostIds } },
            query: 'id name lastName email phone countryCode',
          });

          const userMap = Object.fromEntries(users.map((u:any) => [u.id, u]));

          const activitiesWithHost = activities.map((activity:any) => ({
            ...activity,
            host: userMap[activity.hostBy?.id] || null,
          }));

          const bookingInfo = {
            ...item,
            user,
            activitiesWithHost,
            location,
            lodging,
          };
          
          try{
            await sendConfirmationEmail(bookingInfo);
            console.log("Correo de confirmación enviado con éxito.");
          }catch (_){
          }
           try{
            await sendConfirmationSMS(bookingInfo);
          }catch(_){
            console.log("Error al enviar el mensaje de confirmación.");
          } 
        } else {
          console.log("Booking creado sin usuario asociado - no se enviaron notificaciones");
        }
      }
    },
};
