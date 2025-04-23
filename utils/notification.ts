// keystone/utils/notifications.ts
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendConfirmationEmail(booking: any) {
  const msg = {
    to: booking.user.email,
    from: process.env.SENDGRID_FROM_EMAIL as string,
    subject: 'Confirmación de tu reserva',
    html: `
      <p>Hola ${booking.user.name} ${booking.user.lastName},</p>
      <p>Tu reserva para la actividad ha sido confirmada para el día ${new Date(booking.start_date).toLocaleDateString()}.</p>
      <p>¡Gracias por reservar con nosotros!</p>
    `,
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
      body: `Hola ${booking.user.name} ${booking.user.lastName}, tu reserva está confirmada para el ${new Date(booking.start_date).toLocaleDateString()}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `${booking.user.countryCode}${booking.user.phone}`,
    });
    console.log('SMS enviado con éxito');
  } catch (error) {
    console.error('Error al enviar SMS:', error);
  }
}
