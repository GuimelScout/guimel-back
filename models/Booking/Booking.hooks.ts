import { sendConfirmationEmail, sendConfirmationSMS } from "../../utils/notification";

export const bookingHooks = {
    afterOperation: async ({ operation, item, context }: any) => {
      if (operation === 'create') {
        const [user, activity] = await Promise.all([
          context.db.User.findOne({
            where: { id: item.userId },
            query: 'id name lastName email phone countryCode',
          }),
          context.db.Activity.findOne({
            where: { id: item.activityId },
            query: 'id name',
          }),
        ]);
        let lodging: any;
        if(item.lodgingId){
          lodging = context.db.Lodging.findOne({
            where: { id: item.lodgingId },
            query: 'id name',
          });
        }
        
        const bookingInfo = {
          ...item,
          user,
          activity,
          lodging,
        };
        await sendConfirmationEmail(bookingInfo);
        await sendConfirmationSMS(bookingInfo);
      }
    },
};
