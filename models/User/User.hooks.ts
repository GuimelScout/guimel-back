import Stripe from "../../integrations/stripe";
import { genUniqueLink } from "../../utils/helpers/unike_link";
import { Role } from "../Role/constants";

export const phoneHooks = {
  validateInput: async ({ resolvedData, addValidationError }: any) => {
    const { phone } = resolvedData;
    if (phone) {
      // Phone vaidation just numbers and more than 10 digits
      const pattern = /\+?\d{10,}(?:-?\d+)*$/;
      if (!pattern.test(phone) || (phone.length < 10 && phone.length !== 0)) {
        addValidationError(
          "El teléfono debe ser de 10 dígitos y puros números"
        );
      }
    }
    return phone;
  },
};

export const emailHooks = {
  validateInput: async ({ resolvedData, addValidationError }: any) => {
    const { email } = resolvedData;

    if (email && email !== "") {
      // if email comes, verifies regex
      const pattern =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!pattern.test(email)) {
        addValidationError("El formato del correo es incorrecto");
      }
    }
    return email;
  },
};

export const linkHooks = {
  resolveInput: async ({ resolvedData, item, context }: any) => {
    if (item) {
      return item.link;
    }

    let baseLink = genUniqueLink(`${resolvedData.name.toLowerCase()} ${resolvedData.lastName.toLowerCase()}`);

    let uniqueLink : string = baseLink;

    let existingUser = await context.db.User.findOne({
      where: { link: uniqueLink },
    });

    let counter = 1;
    while (existingUser) {
      uniqueLink = `${baseLink}-${counter}`;
      existingUser = await context.db.User.findOne({
        where: { link: uniqueLink },
      });
      counter++;
    }

    return uniqueLink;
  },
};
export const hooksUser = {

  resolveInput: async ({ item, context, operation, resolvedData }:any) => {
    if (operation === 'create') {
      if (!resolvedData.role || resolvedData.role.length === 0) {
        const defaultRole = await context.db.Role.findOne({
          where: { id: "cm9i4wp3q0002jbciibd00fzu" },
        });
  
        if (defaultRole) {
          resolvedData.role = {
            connect: [{ id: defaultRole.id }],
          };
        }

        const existingCustomers = await Stripe.customers.list({
          email: resolvedData.email,
          limit: 1,
        });
  
        let stripeResp;

        if (existingCustomers.data.length > 0) {
          stripeResp = existingCustomers.data[0];
        } else {
          stripeResp = await Stripe.customers.create({
            name: `${resolvedData.name} ${resolvedData.lastName}`,
            email: resolvedData.email,
            phone: resolvedData.phone,
          });
        }
        
        resolvedData.stripeCustomerId = stripeResp.id;
      }
    }
    return resolvedData;
  }
};
