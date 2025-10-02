// keystone/utils/notifications.ts
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { getBookingCode } from './helpers/bookingCode';
import { generatePassword } from './helpers/generate_password';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendConfirmationEmail(booking: any) {

  const msg = {
    to: booking.user.email,
    from: process.env.SENDGRID_FROM_EMAIL as string,
    templateId: process.env.SENDGRID_TEMPLATE_BOOKING_ID as string,
    dynamicTemplateData: {
      name: `${booking.user.name} ${booking.user.lastName ?? ''}`,
      location: booking.location.name,
      date: `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}`,
      booking_code: getBookingCode(booking),
      guestsCount: booking.guests_adults,
      user: booking.user.email,
      password: generatePassword(booking.user.name),
      activities: booking.activitiesWithHost.map((a: any) => ({
        name: a.name,
        description: a.description,
        price: a.price,
        host: a.host.name,
        host_email:a.host.email,
        host_phone:`${a.host.countryCode}${a.host.phone}`,
        link: `${process.env.FRONT_END_URL as string}/actividad/${a.link}`,
        image: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${a.image_id}.${a.image_extension}`,
      })),
    },
  };
  try {
    await sgMail.send(msg);
    console.log('Correo enviado con éxito');
  } catch (error) {
    console.error('Error al enviar correo:', error);
  }
}

export async function sendConfirmationSMS(booking: any) {
  try {

     await twilioClient.messages.create({
      body: `Hola ${booking.user.name}, 🎉 tu experiencia en ${booking.location.name} está confirmada para el ${new Date(booking.start_date).toLocaleDateString()}. ¡Te esperamos para vivir esta aventura inolvidable!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `${booking.user.countryCode}${booking.user.phone}`,
    }); 

    console.log('SMS enviado con éxito');
  } catch (error) {
    console.error('Error al enviar SMS:', error);
  }
}

export async function sendContactNotificationToAdmins(contact: any, context: any) {
  try {
    // Get all admin users
    const adminUsers = await context.db.User.findMany({
      where: { 
        role: { 
          some: { 
            name: { equals: "admin" } 
          } 
        } 
      },
      query: 'id name lastName email'
    });

    if (adminUsers.length === 0) {
      console.log('No admin users found to notify');
      return;
    }

    // Send email to each admin user
    const emailPromises = adminUsers.map(async (admin: any) => {
      const msg = {
        to: admin.email,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: 'Nuevo mensaje de contacto recibido',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Nuevo mensaje de contacto</h2>
            <p>Hola ${admin.name},</p>
            <p>Se ha recibido un nuevo mensaje de contacto en la plataforma:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Detalles del mensaje:</h3>
              <p><strong>Nombre:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> ${contact.email}</p>
              <p><strong>Teléfono:</strong> ${contact.phone || 'No proporcionado'}</p>
              <p><strong>Fecha:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
              <p><strong>Mensaje:</strong></p>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin-top: 10px;">
                ${contact.message}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Este es un mensaje automático del sistema de Guimel.
            </p>
          </div>
        `,
      };

      return sgMail.send(msg);
    });

    await Promise.all(emailPromises);
    console.log(`Contact notification sent to ${adminUsers.length} admin users`);
  } catch (error) {
    console.error('Error sending contact notification to admins:', error);
  }
}
