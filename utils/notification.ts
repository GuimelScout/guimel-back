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
