import { sendContactNotificationToAdmins } from "../../utils/notification";

export const contactHooks = {
  afterOperation: async ({ operation, item, context }: any) => {
    if (operation === 'create') {
      try {
        await sendContactNotificationToAdmins(item, context);
      } catch (error) {
        console.error('Error sending contact notification to admins:', error);
      }
    }
  },
};