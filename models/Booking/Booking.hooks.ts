import { sendConfirmationEmail, sendConfirmationSMS, sendBookingNotificationToHosts } from "../../utils/notification";
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

        let userID = item.userId || item.user?.id;
        
        if (userID) {
          const [user, activities, location] = await Promise.all([
            context.query.User.findOne({
              where: { id: userID },
              query: 'id name lastName email phone countryCode',
            }),
          
            context.query.Activity.findMany({
              where: { booking: { some: { id: { equals: item.id } } } },
              query: 'id name hostBy { id } location { name image { url } }',
            }),

            context.query.Location.findOne({
              where: { id: item.locationId ?? item.location?.id },
              query: 'name image { url }',
            }),
          ]);
          
          let lodging: any;
          if(item.lodgingId || item.lodging?.id){
            lodging = await context.query.Lodging.findOne({
              where: { id: item.lodgingId ?? item.lodging?.id },
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
            console.log("✅ [BOOKING_HOOK] Confirmation email sent successfully");
          }catch (emailError: any){
            console.error("❌ [BOOKING_HOOK] Error sending confirmation email:", {
              error: emailError.message,
              stack: emailError.stack,
              bookingId: item.id,
              userEmail: user?.email
            });
          } 
          
          try{
            await sendConfirmationSMS(bookingInfo);
            console.log("✅ [BOOKING_HOOK] Confirmation SMS sent successfully");
          }catch(smsError: any){
            console.error("❌ [BOOKING_HOOK] Error sending confirmation SMS:", {
              error: smsError.message,
              stack: smsError.stack,
              bookingId: item.id,
              userPhone: user?.phone,
              userCountryCode: user?.countryCode
            });
          } 

          try{
            await sendBookingNotificationToHosts(bookingInfo);
            console.log("✅ [BOOKING_HOOK] Host notification sent successfully");
          }catch(hostNotificationError: any){
            console.error("❌ [BOOKING_HOOK] Error sending host notification:", {
              error: hostNotificationError.message,
              stack: hostNotificationError.stack,
              bookingId: item.id
            });
          } 
        } else {
          console.log("⚠️ [BOOKING_HOOK] Booking created without associated user - no notifications sent", {
            bookingId: item.id,
            status: item.status
          });
        }
      }
    },
};
