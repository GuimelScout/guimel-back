import { KeystoneContext } from "@keystone-6/core/types";
import Stripe from "../../integrations/stripe";

const typeDefs = `
  type makePaymentType {
    message: String,
    success: Boolean,
    data: JSON
  }
`;

const definition = `
  makePayment(
  lodgingId: String, 
  activityId: String!, 
  startDate: CalendarDay!, 
  endDate: CalendarDay!,
  guestss: String!, 
  nameCard: String!, 
  email: String!, 
  notes: String!, 
  paymentMethodId: String!, 
  total: String!, 
  noDuplicatePaymentMethod: Boolean!, 
  ): makePaymentType
`;

const resolver = {
  makePayment: async (
    root: any,
    {
      activityId,
      lodgingId,
      startDate,
      endDate,
      guestss,
      nameCard,
      email,
      notes,
      paymentMethodId,
      total,
      noDuplicatePaymentMethod,
    }: {
      startDate: Date;
      endDate: Date;
      lodgingId: string;
      activityId: string;
      guestss: string;
      nameCard: string;
      email: string;
      notes: string;
      paymentMethodId: string;
      total: string;
      noDuplicatePaymentMethod: boolean;
    },
    context: KeystoneContext,
  ) => {
    
    const dataPayment = {
      lodgingId,
      activityId,
      startDate,
      endDate,
      guestss,
      nameCard,
      email,
      notes,
      paymentMethodId,
      total
    };

    try {

      let lodging: Record<string, any> | undefined;

      const activity = await context.query.Activity.findOne({
        where: {
          id: dataPayment.activityId,
        },
        query: "id name price"
      });
      
      let totalInBack : number = parseFloat(activity.price || "0.00") * Number(guestss);

      if(dataPayment.lodgingId){
        lodging = await context.query.Lodging.findOne({
          where: {
            id: dataPayment.lodgingId,
          },
          query: "id name price",
        });
        totalInBack += parseFloat(lodging?.price || "0.00") * Number(guestss);
      }else{
        lodging = undefined;
      }

      //Check if total is diferent from front
      if(Number(total) != totalInBack){
        return {
          message: "Hubo un error de comunicación, por favor recargue la página e intente de nuevo.",
          success: false,
        };
      }

      const user = await context.query.User.findOne({
        where: {
          email: dataPayment.email,
        },
        query: "id name stripeCustomerId"
      });

      const paymentMethod = await context.query.PaymentMethod.findOne({
        where: {
          id: dataPayment.paymentMethodId,
        },
        query: "id stripeProcessorId stripePaymentMethodId"
      }); 

      if(noDuplicatePaymentMethod){
          await Stripe.paymentMethods.attach(paymentMethod.stripePaymentMethodId,{
            customer: user.stripeCustomerId,
          }
        );

        await Stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.stripePaymentMethodId,
          },
        });
      }

      const stripePaymentIntent = await Stripe.paymentIntents.create({
        amount: Number(dataPayment.total) * 100,
        currency: "mxn",
        customer: user.stripeCustomerId,
        payment_method: paymentMethod.stripePaymentMethodId,
        description: `Payment for activity ${activity.name} (${dataPayment.activityId}) of ${activity.price}`,
        confirm: true,
        off_session: true,
        metadata: {
          paymentMethod: dataPayment.paymentMethodId,
          activityId: dataPayment.activityId,
          lodgingId: dataPayment.lodgingId,
        }
      });

      if (stripePaymentIntent?.error) {
        // In case payment error
        await context.query.Payment.createOne({
          data: {
            paymentMethod: 'card',
            amount: total,
            status: "failed",
            processorStripeChargeId: stripePaymentIntent?.id || "",
            stripeErrorMessage: stripePaymentIntent?.error?.message,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        return {
          message: stripePaymentIntent?.error?.message,
          success: false,
        };
      }

      const payment = await context.query.Payment.createOne({
        data: {
          paymentMethod: {
            connect: {
              id: dataPayment.paymentMethodId,
            },
          },
          activity: {
            connect: {
              id: activity.id,
            },
          },
          lodging: (lodging) ? {
            connect: {
              id: lodging.id,
            },
          } : undefined,
          user: {
            connect: {
              id: user.id,
            },
          },
          amount: total,
          status: "succeeded",
          processorStripeChargeId: stripePaymentIntent?.id || "",
          notes: dataPayment.notes
        },
      });

      const booking = await context.query.Booking.createOne({
        data: {
          start_date: dataPayment.startDate,
          end_date: dataPayment.endDate,
          guests_adults: Number(dataPayment.guestss),
          activity: {
            connect: {
              id: activity.id,
            },
          },
          lodging: (lodging) ? {
            connect: {
              id: lodging.id,
            },
          } : undefined,
          user: {
            connect: {
              id: user.id,
            },
          },
          payment: {
            connect: {
              id: payment.id
            }
          },
          status: "paid",
        },
      });

      return {
        message: "Pago y creación de reserva exitoso.",
        success: true,
        data: {
          booking: booking.id
        }
      };

    } catch (e) {
      console.log("e");
      console.log(e);
      return {
        message: "Tuvimos problemas de comunicación con el servidor. Por favor intentelo de nuevo.",
        success: false,
      };
    }
  },
};

export default { typeDefs, definition, resolver };
