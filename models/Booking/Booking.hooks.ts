import { sendConfirmationEmail, sendConfirmationSMS } from "../../utils/notification";
import { getBookingCode } from "../../utils/helpers/bookingCode";

export const bookingHooks = {
    afterOperation: async ({ operation, item, context }: any) => {
      console.log('📅 [BOOKING_HOOK] Hook triggered:', {
        operation,
        bookingId: item.id,
        status: item.status,
        paymentType: item.payment_type,
        userId: item.user?.id,
        timestamp: new Date().toISOString()
      });
      
      if (operation === 'create') {
        console.log('🆕 [BOOKING_HOOK] Processing new booking creation...', {
          bookingId: item.id,
          startDate: item.start_date,
          endDate: item.end_date,
          guestsAdults: item.guests_adults,
          status: item.status
        });
        
        let code = getBookingCode({ id: item.id, createdAt: item.createdAt });
        let attempts = 0;
        const maxAttempts = 10;
        
        console.log('🔑 [BOOKING_HOOK] Generating unique booking code...', {
          initialCode: code,
          bookingId: item.id,
          createdAt: item.createdAt
        });
        
        while (attempts < maxAttempts) {
          console.log(`🔍 [BOOKING_HOOK] Checking code uniqueness (attempt ${attempts + 1}/${maxAttempts}):`, { code });
          
          const existingBooking = await context.query.Booking.findOne({
            where: { code: code },
          });
          
          if (!existingBooking) {
            console.log('✅ [BOOKING_HOOK] Code is unique:', { code });
            break;
          }
          
          console.log('⚠️ [BOOKING_HOOK] Code already exists, generating new one...', { 
            existingCode: code, 
            existingBookingId: existingBooking.id 
          });
          
          code = getBookingCode({ 
            id: item.id + Math.random().toString(36).substring(2, 8), 
            createdAt: item.createdAt 
          });
          attempts++;
        }
        
        if (attempts >= maxAttempts) {
          console.error('❌ [BOOKING_HOOK] Failed to generate unique code after maximum attempts:', {
            maxAttempts,
            finalCode: code,
            bookingId: item.id
          });
          return;
        }
        
        console.log('💾 [BOOKING_HOOK] Updating booking with unique code...', { 
          bookingId: item.id, 
          finalCode: code 
        });
        
        await context.sudo().query.Booking.updateOne({
          where: { id: item.id },
          data: { code: code }
        });
        
        console.log('✅ [BOOKING_HOOK] Booking code updated successfully');

        if (item.user?.id) {
          console.log('👤 [BOOKING_HOOK] User found, fetching booking details for notifications...', {
            userId: item.user.id,
            bookingId: item.id
          });
          
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
          
          console.log('📊 [BOOKING_HOOK] Booking data fetched:', {
            user: user ? { id: user.id, name: user.name, email: user.email } : null,
            activitiesCount: activities?.length || 0,
            location: location ? { id: location.id, name: location.name } : null,
            hasLodging: !!item.lodging?.id
          });

          let lodging: any;
          if(item.lodging?.id){
            console.log('🏨 [BOOKING_HOOK] Fetching lodging details...', { lodgingId: item.lodging.id });
            lodging = await context.query.Lodging.findOne({
              where: { id: item.lodging.id },
              query: 'id name',
            });
            console.log('🏨 [BOOKING_HOOK] Lodging fetched:', lodging ? { id: lodging.id, name: lodging.name } : 'Not found');
          }

          console.log('👥 [BOOKING_HOOK] Processing activity hosts...', {
            activitiesCount: activities?.length || 0,
            activities: activities?.map((a: any) => ({ id: a.id, name: a.name, hostId: a.hostBy?.id })) || []
          });

          const hostIds = activities.map((activity:any) => activity.hostBy?.id).filter(Boolean);
          console.log('👥 [BOOKING_HOOK] Host IDs found:', { hostIds, uniqueHosts: [...new Set(hostIds)] });

          const users = await context.query.User.findMany({
            where: { id: { in: hostIds } },
            query: 'id name lastName email phone countryCode',
          });

          console.log('👥 [BOOKING_HOOK] Host users fetched:', {
            requestedHosts: hostIds.length,
            foundHosts: users.length,
            hosts: users.map((u: any) => ({ id: u.id, name: u.name, email: u.email }))
          });

          const userMap = Object.fromEntries(users.map((u:any) => [u.id, u]));

          const activitiesWithHost = activities.map((activity:any) => ({
            ...activity,
            host: userMap[activity.hostBy?.id] || null,
          }));
          
          console.log('📋 [BOOKING_HOOK] Activities with host data prepared:', {
            activitiesWithHost: activitiesWithHost.map((a: any) => ({
              id: a.id,
              name: a.name,
              hasHost: !!a.host,
              hostName: a.host?.name || 'No host'
            }))
          });

          const bookingInfo = {
            ...item,
            user,
            activitiesWithHost,
            location,
            lodging,
          };
          
          console.log('📧 [BOOKING_HOOK] Preparing to send notifications...', {
            bookingId: item.id,
            userEmail: user?.email,
            userPhone: user?.phone,
            userCountryCode: user?.countryCode,
            activitiesCount: activitiesWithHost?.length || 0,
            hasLocation: !!location,
            hasLodging: !!lodging
          });
          
          try{
            console.log('📧 [BOOKING_HOOK] Sending confirmation email...');
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
            console.log('📱 [BOOKING_HOOK] Sending confirmation SMS...');
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
          
          console.log('🎉 [BOOKING_HOOK] Booking hook processing completed successfully', {
            bookingId: item.id,
            code: code,
            userEmail: user?.email,
            userPhone: user?.phone
          });
        } else {
          console.log("⚠️ [BOOKING_HOOK] Booking created without associated user - no notifications sent", {
            bookingId: item.id,
            status: item.status
          });
        }
      }
    },
};
