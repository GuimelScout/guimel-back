import { sendConfirmationEmail, sendConfirmationSMS } from "../../utils/notification";
import { getBookingCode } from "../../utils/helpers/bookingCode";

export const bookingHooks = {
    afterOperation: async ({ operation, item, context }: any) => {
      if (operation === 'create') {
        const code = getBookingCode({ id: item.id, createdAt: item.createdAt });
        
        await context.db.Booking.updateOne({
          where: { id: item.id },
          data: { code: code }
        });

        const [user, activities, location] = await Promise.all([
          context.db.User.findOne({
            where: { id: item.userId },
            query: 'id name lastName email phone countryCode',
          }),

        
          context.db.Activity.findMany({
            where: { booking: { some: { id: { equals: item.id } } } },
            query: 'id name location { name image { url } }',
          }),

          context.db.Location.findOne({
            where: { id: item.locationId },
            query: 'name image { url }',
          }),
        ]);

        let lodging: any;
        if(item.lodgingId){
          lodging = context.db.Lodging.findOne({
            where: { id: item.lodgingId },
            query: 'id name',
          });
        }

        const hostIds = activities.map((item:any) => item.hostById).filter(Boolean);

        const users = await context.db.User.findMany({
          where: { id: { in: hostIds } },
          query: 'id name lastName email phone countryCode',
        });

        const userMap = Object.fromEntries(users.map((u:any) => [u.id, u]));

        const activitiesWithHost = activities.map((activity:any) => ({
          ...activity,
          host: userMap[activity.hostById] || null,
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
        }catch (e){
          console.log("Error al enviar el correo de confirmación.");
          console.log(e);
        }
         try{
          await sendConfirmationSMS(bookingInfo);
        }catch(e){
          console.log("Error al enviar el mensaje de confirmación.");
          console.log(e);
        } 
      }
    },
};
