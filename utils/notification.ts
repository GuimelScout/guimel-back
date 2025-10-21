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
    console.log('Correo enviado con éxito. 📧');
  } catch (error) {
    console.error('Error al enviar correo. ❌:', error);
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

export async function sendBookingNotificationToHosts(booking: any) {
  try {
    if (!booking.activitiesWithHost || booking.activitiesWithHost.length === 0) {
      return;
    }

    const uniqueHosts = new Map();
    
    booking.activitiesWithHost.forEach((activity: any) => {
      if (activity.host && activity.host.id) {
        uniqueHosts.set(activity.host.id, {
          ...activity.host,
          activities: uniqueHosts.get(activity.host.id)?.activities || []
        });
        uniqueHosts.get(activity.host.id).activities.push({
          name: activity.name,
          link: activity.link,
          price: activity.price
        });
      }
    });

    const hostsToNotify = Array.from(uniqueHosts.values());

    let finalRecipients = [];

    if (hostsToNotify.length > 0) {
      finalRecipients = [hostsToNotify[0]];
    } else {
      return;
    }

    const emailPromises = finalRecipients.map(async (recipient: any) => {
      const msg = {
        to: recipient.email,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: '🎉 Nueva reservación recibida - Guimel',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">¡Nueva reservación recibida!</h2>
            <p>Hola ${recipient.name},</p>
            <p>Se ha realizado una nueva reservación en tu actividad:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Detalles de la reservación:</h3>
              <p><strong>Código de reservación:</strong> ${getBookingCode(booking)}</p>
              <p><strong>Cliente:</strong> ${booking.user.name} ${booking.user.lastName || ''}</p>
              <p><strong>Email del cliente:</strong> ${booking.user.email}</p>
              <p><strong>Teléfono:</strong> ${booking.user.countryCode || ''}${booking.user.phone || 'No proporcionado'}</p>
              <p><strong>Ubicación:</strong> ${booking.location.name}</p>
              <p><strong>Fechas:</strong> ${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}</p>
              <p><strong>Número de huéspedes:</strong> ${booking.guests_adults}</p>
              <p><strong>Tipo de pago:</strong> ${booking.payment_type === 'full_payment' ? 'Pago completo' : 'Solo reservación'}</p>
            </div>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2d5a2d;">Actividades reservadas:</h3>
              ${booking.activitiesWithHost.map((activity: any) => `
                <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 3px;">
                  <p style="margin: 0;"><strong>${activity.name}</strong></p>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONT_END_URL}/dashboard" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver en Dashboard
              </a>
            </div>
          </div>
        `,
      };

      return sgMail.send(msg);
    });

    await Promise.all(emailPromises);
    console.log(`✅ [HOST_NOTIFICATION] Booking notification sent to ${finalRecipients.length} recipients`);
  } catch (error: any) {
    console.error('❌ [HOST_NOTIFICATION] Error sending booking notification to hosts:', {
      error: error.message,
      stack: error.stack,
      bookingId: booking.id
    });
  }
}
