"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default
});
module.exports = __toCommonJS(keystone_exports);

// env.ts
var path = require("path");
var dotenv = require("dotenv");
dotenv.config({ path: path.resolve(process.cwd(), "config", ".env.dev") });

// models/Lodging/Lodging.ts
var import_core = require("@keystone-6/core");
var import_fields = require("@keystone-6/core/fields");

// utils/generalAccess/access.ts
var access = {
  operation: {
    query: () => true,
    create: () => true,
    update: () => true,
    delete: () => true
  },
  filter: {
    query: () => true,
    update: () => true,
    delete: () => true
  }
};
var access_default = access;

// utils/helpers/unike_link.ts
function genUniqueLink(link) {
  return link.toLocaleLowerCase().replaceAll(" ", "-").replace(/ñ/g, "n").replace(/[^a-z0-9-]/g, "");
}

// models/Lodging/Lodging.hooks.ts
var linkHooks = {
  resolveInput: async ({ resolvedData, item, context }) => {
    if (item) {
      return item.link;
    }
    let baseLink = genUniqueLink(`${resolvedData.name.toLowerCase()}`);
    let uniqueLink = baseLink;
    let existingUser = await context.db.Lodging.findOne({
      where: { link: uniqueLink }
    });
    let counter = 1;
    while (existingUser) {
      uniqueLink = `${baseLink}-${counter}`;
      existingUser = await context.db.Lodging.findOne({
        where: { link: uniqueLink }
      });
      counter++;
    }
    return uniqueLink;
  }
};

// models/Lodging/Lodging.ts
var Lodging_default = (0, import_core.list)({
  access: access_default,
  fields: {
    name: (0, import_fields.text)({ validation: { isRequired: true } }),
    description: (0, import_fields.text)({ ui: { displayMode: "textarea" } }),
    price: (0, import_fields.decimal)(),
    status: (0, import_fields.select)({
      options: [
        { label: "Disponible", value: "available" },
        { label: "No Disponible", value: "no_available" }
      ],
      validation: { isRequired: true }
    }),
    type: (0, import_fields.select)({
      options: [
        { label: "Hotel", value: "hotel" },
        { label: "Casa", value: "house" },
        { label: "Departamento", value: "department" },
        { label: "Campamento", value: "camp" },
        { label: "Condominio", value: "condominium" }
      ],
      validation: { isRequired: true }
    }),
    address: (0, import_fields.text)({ validation: { isRequired: true } }),
    lat: (0, import_fields.text)(),
    lng: (0, import_fields.text)(),
    hostBy: (0, import_fields.relationship)({
      ref: "User.lodging"
    }),
    lodgingType: (0, import_fields.relationship)({
      ref: "LodgingType.lodging",
      many: true
    }),
    activity: (0, import_fields.relationship)({
      ref: "Activity.lodging",
      many: true
    }),
    payment: (0, import_fields.relationship)({
      ref: "Payment.lodging",
      many: true
    }),
    booking: (0, import_fields.relationship)({
      ref: "Booking.lodging",
      many: true
    }),
    reviewStar: (0, import_fields.virtual)({
      field: import_core.graphql.field({
        type: import_core.graphql.Float,
        async resolve(item, args, context) {
          const reviews = await context.db.Review.findMany({
            where: { lodging: { id: { equals: item.id } } }
          });
          const ratings = reviews.map((review) => ({ rating: review.rating }));
          if (ratings.length === 0) return 0;
          const averageRating = ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length;
          return parseFloat(averageRating.toFixed(2));
        }
      })
    }),
    review: (0, import_fields.relationship)({
      ref: "Review.lodging",
      many: true
    }),
    location: (0, import_fields.relationship)({
      ref: "Location.lodging",
      many: true
    }),
    link: (0, import_fields.text)({
      isIndexed: "unique",
      hooks: linkHooks,
      ui: {
        createView: {
          fieldMode: "hidden"
        }
      }
    }),
    gallery: (0, import_fields.relationship)({
      ref: "LodgingGallery.lodging",
      many: true
    }),
    includes: (0, import_fields.relationship)({
      ref: "LodgingInclude.lodging",
      many: true
    }),
    logo: (0, import_fields.image)({ storage: "local_images" }),
    createdAt: (0, import_fields.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/User/User.ts
var import_core2 = require("@keystone-6/core");
var import_fields2 = require("@keystone-6/core/fields");

// integrations/stripe.ts
var Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
var stripe_default = Stripe;

// models/User/User.hooks.ts
var phoneHooks = {
  validateInput: async ({ resolvedData, addValidationError }) => {
    const { phone } = resolvedData;
    if (phone) {
      const pattern = /^\+\d{10,}$/;
      if (!pattern.test(phone)) {
        addValidationError(
          "El tel\xE9fono debe tener el formato internacional: +52XXXXXXXXXX (solo d\xEDgitos, sin espacios ni guiones)"
        );
      }
    }
    return phone;
  }
};
var emailHooks = {
  validateInput: async ({ resolvedData, addValidationError }) => {
    const { email } = resolvedData;
    if (email && email !== "") {
      const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!pattern.test(email)) {
        addValidationError("El formato del correo es incorrecto");
      }
    }
    return email;
  }
};
var linkHooks2 = {
  resolveInput: async ({ resolvedData, item, context }) => {
    if (item) {
      return item.link;
    }
    let baseLink = genUniqueLink(`${resolvedData.name.toLowerCase()} ${resolvedData.lastName.toLowerCase()}`);
    let uniqueLink = baseLink;
    let existingUser = await context.db.User.findOne({
      where: { link: uniqueLink }
    });
    let counter = 1;
    while (existingUser) {
      uniqueLink = `${baseLink}-${counter}`;
      existingUser = await context.db.User.findOne({
        where: { link: uniqueLink }
      });
      counter++;
    }
    return uniqueLink;
  }
};
var hooksUser = {
  resolveInput: async ({ item, context, operation, resolvedData }) => {
    if (operation === "create") {
      if (!resolvedData.role || resolvedData.role.length === 0) {
        const defaultRole = await context.db.Role.findOne({
          where: { id: "cm9i4wp3q0002jbciibd00fzu" }
        });
        if (defaultRole) {
          resolvedData.role = {
            connect: [{ id: defaultRole.id }]
          };
        }
        const existingCustomers = await stripe_default.customers.list({
          email: resolvedData.email,
          limit: 1
        });
        let stripeResp;
        if (existingCustomers.data.length > 0) {
          stripeResp = existingCustomers.data[0];
        } else {
          stripeResp = await stripe_default.customers.create({
            name: `${resolvedData.name} ${resolvedData.lastName}`,
            email: resolvedData.email,
            phone: resolvedData.phone
          });
        }
        resolvedData.stripeCustomerId = stripeResp.id;
      }
    }
    return resolvedData;
  }
};

// models/User/User.access.ts
var access2 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => true,
    delete: ({ session: session2 }) => true
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => true,
    delete: ({ session: session2 }) => true
  },
  item: {
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => true,
    delete: ({ session: session2 }) => true
  }
};
var User_access_default = access2;

// models/User/User.ts
var User_default = (0, import_core2.list)({
  access: User_access_default,
  hooks: hooksUser,
  fields: {
    name: (0, import_fields2.text)({ validation: { isRequired: true } }),
    lastName: (0, import_fields2.text)({ validation: { isRequired: true } }),
    secondLastName: (0, import_fields2.text)(),
    email: (0, import_fields2.text)({
      isIndexed: "unique",
      validation: { isRequired: true },
      hooks: emailHooks
    }),
    password: (0, import_fields2.password)({
      validation: { isRequired: true }
    }),
    phone: (0, import_fields2.text)({
      hooks: phoneHooks
    }),
    description: (0, import_fields2.text)({ ui: { displayMode: "textarea" } }),
    instagram: (0, import_fields2.text)(),
    stripeCustomerId: (0, import_fields2.text)(),
    role: (0, import_fields2.relationship)({
      ref: "Role.user",
      many: true
    }),
    lodging: (0, import_fields2.relationship)({
      ref: "Lodging.hostBy",
      many: true
    }),
    booking: (0, import_fields2.relationship)({
      ref: "Booking.user",
      many: true
    }),
    reviewStar: (0, import_fields2.virtual)({
      field: import_core2.graphql.field({
        type: import_core2.graphql.Float,
        async resolve(item, args, context) {
          const reviews = await context.db.Review.findMany({
            //@ts-ignore
            where: { user: { id: { equals: item.id } } }
          });
          const ratings = reviews.map((review) => ({ rating: review.rating }));
          if (ratings.length === 0) return 0;
          const averageRating = ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length;
          return parseFloat(averageRating.toFixed(2));
        }
      })
    }),
    reviews: (0, import_fields2.relationship)({
      ref: "Review.user",
      many: true
    }),
    link: (0, import_fields2.text)({
      isIndexed: "unique",
      hooks: linkHooks2,
      ui: {
        createView: {
          fieldMode: "hidden"
        }
      }
    }),
    status: (0, import_fields2.select)({
      type: "enum",
      validation: {
        isRequired: true
      },
      defaultValue: "initial",
      options: [
        { label: "Inicial", value: "initial" },
        { label: "Registro completado", value: "registration_done" },
        { label: "Verificado", value: "verified" }
      ]
    }),
    activity: (0, import_fields2.relationship)({
      ref: "Activity.hostBy",
      many: true
    }),
    payment: (0, import_fields2.relationship)({
      ref: "Payment.user",
      many: true
    }),
    paymentMethod: (0, import_fields2.relationship)({
      ref: "PaymentMethod.user",
      many: true
    }),
    verified: (0, import_fields2.checkbox)(),
    image: (0, import_fields2.image)({ storage: "local_images" }),
    createdAt: (0, import_fields2.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Lodging/LodgingType.ts
var import_core3 = require("@keystone-6/core");
var import_fields3 = require("@keystone-6/core/fields");
var LodgingType_default = (0, import_core3.list)({
  access: access_default,
  fields: {
    type: (0, import_fields3.select)({
      options: [
        { label: "Lugar Dedicado", value: "spot" },
        //only available in camping
        { label: "Cuarto privado", value: "private_room" },
        { label: "Cuarto compartido", value: "shared_room" }
      ],
      validation: { isRequired: true }
    }),
    description: (0, import_fields3.text)({ ui: { displayMode: "textarea" } }),
    max_person_capacity: (0, import_fields3.integer)(),
    lodging: (0, import_fields3.relationship)({
      ref: "Lodging.lodgingType"
    }),
    createdAt: (0, import_fields3.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Activity/Activity.ts
var import_core4 = require("@keystone-6/core");
var import_fields4 = require("@keystone-6/core/fields");

// models/Activity/Activity.hooks.ts
var linkHooks3 = {
  resolveInput: async ({ resolvedData, item, context }) => {
    if (item) {
      return item.link;
    }
    let baseLink = genUniqueLink(`${resolvedData.name.toLowerCase()}`);
    let uniqueLink = baseLink;
    let existingUser = await context.db.Activity.findOne({
      where: { link: uniqueLink }
    });
    let counter = 1;
    while (existingUser) {
      uniqueLink = `${baseLink}-${counter}`;
      existingUser = await context.db.Activity.findOne({
        where: { link: uniqueLink }
      });
      counter++;
    }
    return uniqueLink;
  }
};

// models/Activity/Activity.ts
var import_fields_document = require("@keystone-6/fields-document");
var Activity_default = (0, import_core4.list)({
  access: access_default,
  fields: {
    name: (0, import_fields4.text)({ validation: { isRequired: true } }),
    description: (0, import_fields4.text)({ ui: { displayMode: "textarea" } }),
    descriptionActivities: (0, import_fields_document.document)({
      formatting: true,
      links: true
    }),
    address: (0, import_fields4.text)({ ui: { displayMode: "textarea", description: 'You must add the address like: "street, zip neighborhood state country"' } }),
    price: (0, import_fields4.decimal)(),
    type_day: (0, import_fields4.select)({
      options: [
        { label: "Un d\xEDa", value: "one_day" },
        { label: "Cualquier d\xEDa", value: "any_day" },
        { label: "Solo entre semana", value: "weekdays" },
        { label: "Solo fines de semana", value: "weekends" },
        { label: "Rango de fechas", value: "date_range" },
        { label: "Algunos d\xEDas", value: "some_days" }
        // when user select some_days, AvailableDays save the info
      ],
      validation: { isRequired: true }
    }),
    is_available: (0, import_fields4.virtual)({
      field: import_core4.graphql.field({
        type: import_core4.graphql.Boolean,
        async resolve(item) {
          return true;
        }
      })
    }),
    reviewStar: (0, import_fields4.virtual)({
      field: import_core4.graphql.field({
        type: import_core4.graphql.Float,
        async resolve(item, args, context) {
          const reviews = await context.db.Review.findMany({
            where: { activity: { id: { equals: item.id } } }
          });
          const ratings = reviews.map((review) => ({ rating: review.rating }));
          if (ratings.length === 0) return 0;
          const averageRating = ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length;
          return parseFloat(averageRating.toFixed(1));
        }
      })
    }),
    includes: (0, import_fields4.relationship)({
      ref: "ActivityInclude.activity",
      many: true
    }),
    whatToDo: (0, import_fields4.relationship)({
      ref: "ActivityWhatToDo.activity",
      many: true
    }),
    available: (0, import_fields4.relationship)({
      ref: "ActivityAvailable.activity"
    }),
    available_days: (0, import_fields4.relationship)({
      ref: "ActivityAvailableDay.activity",
      many: true
    }),
    lodging: (0, import_fields4.relationship)({
      ref: "Lodging.activity",
      many: true
    }),
    booking: (0, import_fields4.relationship)({
      ref: "Booking.activity",
      many: true
    }),
    review: (0, import_fields4.relationship)({
      ref: "Review.activity",
      many: true
    }),
    location: (0, import_fields4.relationship)({
      ref: "Location.activity",
      many: true
    }),
    gallery: (0, import_fields4.relationship)({
      ref: "ActivityGallery.activity",
      many: true
    }),
    payment: (0, import_fields4.relationship)({
      ref: "Payment.activity",
      many: true
    }),
    link: (0, import_fields4.text)({
      isIndexed: "unique",
      hooks: linkHooks3,
      ui: {
        createView: {
          fieldMode: "hidden"
        }
      }
    }),
    image: (0, import_fields4.image)({ storage: "local_images" }),
    hostBy: (0, import_fields4.relationship)({
      ref: "User.activity"
    }),
    createdAt: (0, import_fields4.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Activity/ActivityInclude.ts
var import_core5 = require("@keystone-6/core");
var import_fields5 = require("@keystone-6/core/fields");
var ActivityInclude_default = (0, import_core5.list)({
  access: access_default,
  fields: {
    name: (0, import_fields5.text)({ validation: { isRequired: true } }),
    description: (0, import_fields5.text)({ ui: { displayMode: "textarea" } }),
    activity: (0, import_fields5.relationship)({
      ref: "Activity.includes",
      many: true
    }),
    createdAt: (0, import_fields5.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Activity/ActivityWhatToDo.ts
var import_core6 = require("@keystone-6/core");
var import_fields6 = require("@keystone-6/core/fields");
var ActivityWhatToDo_default = (0, import_core6.list)({
  access: access_default,
  fields: {
    name: (0, import_fields6.text)({ validation: { isRequired: true } }),
    description: (0, import_fields6.text)({ ui: { displayMode: "textarea" } }),
    activity: (0, import_fields6.relationship)({
      ref: "Activity.whatToDo",
      many: true
    }),
    createdAt: (0, import_fields6.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Activity/ActivityAvailable.ts
var import_core7 = require("@keystone-6/core");
var import_fields7 = require("@keystone-6/core/fields");
var ActivityAvailable_default = (0, import_core7.list)({
  access: access_default,
  fields: {
    start_date: (0, import_fields7.calendarDay)(),
    end_date: (0, import_fields7.calendarDay)(),
    specific_date: (0, import_fields7.calendarDay)(),
    duration_days: (0, import_fields7.virtual)({
      field: import_core7.graphql.field({
        type: import_core7.graphql.String,
        async resolve(item) {
          if (item?.start_date && item?.end_date) {
            const startDate = new Date(item.start_date);
            const endDate = new Date(item.end_date);
            const diffTime = endDate.getTime() - startDate.getTime();
            const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
            return diffDays.toString();
          } else if (item?.specific_date) {
            return "1";
          }
          return "0";
        }
      })
    }),
    monday: (0, import_fields7.checkbox)({ defaultValue: true }),
    tuesday: (0, import_fields7.checkbox)({ defaultValue: true }),
    wednesday: (0, import_fields7.checkbox)({ defaultValue: true }),
    thursday: (0, import_fields7.checkbox)({ defaultValue: true }),
    friday: (0, import_fields7.checkbox)({ defaultValue: true }),
    saturday: (0, import_fields7.checkbox)({ defaultValue: true }),
    sunday: (0, import_fields7.checkbox)({ defaultValue: true }),
    activity: (0, import_fields7.relationship)({
      ref: "Activity.available"
    }),
    createdAt: (0, import_fields7.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Activity/ActivityAvailableDay.ts
var import_core8 = require("@keystone-6/core");
var import_fields8 = require("@keystone-6/core/fields");
var ActivityAvailableDay_default = (0, import_core8.list)({
  access: access_default,
  fields: {
    day: (0, import_fields8.calendarDay)(),
    activity: (0, import_fields8.relationship)({
      ref: "Activity.available_days"
    }),
    createdAt: (0, import_fields8.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Booking/Booking.ts
var import_core9 = require("@keystone-6/core");
var import_fields9 = require("@keystone-6/core/fields");

// utils/notification.ts
var import_mail = __toESM(require("@sendgrid/mail"));
var import_twilio = __toESM(require("twilio"));
import_mail.default.setApiKey(process.env.SENDGRID_API_KEY);
var twilioClient = (0, import_twilio.default)(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
async function sendConfirmationEmail(booking) {
  const msg = {
    to: booking.user.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "Confirmaci\xF3n de tu reserva",
    html: `
      <p>Hola ${booking.user.name} ${booking.user.lastName},</p>
      <p>Tu reserva para la actividad ha sido confirmada para el d\xEDa ${new Date(booking.start_date).toLocaleDateString()}.</p>
      <p>\xA1Gracias por reservar con nosotros!</p>
    `
  };
  try {
    await import_mail.default.send(msg);
    console.log("Correo enviado con \xE9xito");
  } catch (error) {
    console.error("Error al enviar correo:", error);
  }
}
async function sendConfirmationSMS(booking) {
  try {
    await twilioClient.messages.create({
      body: `Hola ${booking.user.name} ${booking.user.lastName}, tu reserva est\xE1 confirmada para el ${new Date(booking.start_date).toLocaleDateString()}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: booking.user.phone
    });
    console.log("SMS enviado con \xE9xito");
  } catch (error) {
    console.error("Error al enviar SMS:", error);
  }
}

// models/Booking/Booking.hooks.ts
var bookingHooks = {
  afterOperation: async ({ operation, item, context }) => {
    if (operation === "create") {
      console.log("item");
      console.log(item);
      const [user, activity] = await Promise.all([
        context.db.User.findOne({
          where: { id: item.userId },
          query: "id name lastName email phone"
        }),
        context.db.Activity.findOne({
          where: { id: item.activityId },
          query: "id name"
        })
      ]);
      let lodging;
      if (item.lodgingId) {
        lodging = context.db.Lodging.findOne({
          where: { id: item.lodgingId },
          query: "id name"
        });
      }
      const bookingInfo = {
        ...item,
        user,
        activity,
        lodging
      };
      await sendConfirmationEmail(bookingInfo);
      await sendConfirmationSMS(bookingInfo);
    }
  }
};

// models/Booking/Booking.ts
var Booking_default = (0, import_core9.list)({
  access: access_default,
  hooks: bookingHooks,
  fields: {
    start_date: (0, import_fields9.calendarDay)(),
    end_date: (0, import_fields9.calendarDay)(),
    guests_adults: (0, import_fields9.integer)(),
    guests_childs: (0, import_fields9.integer)(),
    guestss: (0, import_fields9.virtual)({
      field: import_core9.graphql.field({
        type: import_core9.graphql.String,
        async resolve(item) {
          return (item?.guests_adults ?? 0) + (item?.guests_childs ?? 0);
        }
      })
    }),
    code: (0, import_fields9.virtual)({
      field: import_core9.graphql.field({
        type: import_core9.graphql.String,
        async resolve(item) {
          console.log("item");
          console.log(item);
          const fecha = new Date(item.createdAt);
          const day = fecha.getDate().toString().padStart(2, "0");
          const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
          const anio = fecha.getFullYear();
          const fechaFormateada = `${day}${month}${anio}`;
          return `${item.id.toString().slice(-6).toUpperCase()}-${fechaFormateada}`;
        }
      })
    }),
    status: (0, import_fields9.select)({
      type: "enum",
      validation: {
        isRequired: true
      },
      defaultValue: "pending",
      options: [
        { label: "Pendiente", value: "pending" },
        { label: "Pagado", value: "paid" },
        { label: "Cancelado", value: "cancelled" },
        { label: "Confirmado", value: "confirmed" },
        { label: "Completado", value: "completed" }
      ]
    }),
    activity: (0, import_fields9.relationship)({
      ref: "Activity.booking"
    }),
    lodging: (0, import_fields9.relationship)({
      ref: "Lodging.booking"
    }),
    user: (0, import_fields9.relationship)({
      ref: "User.booking"
    }),
    payment: (0, import_fields9.relationship)({
      ref: "Payment.booking"
    }),
    createdAt: (0, import_fields9.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Review/Review.ts
var import_core10 = require("@keystone-6/core");
var import_fields10 = require("@keystone-6/core/fields");
var Review_default = (0, import_core10.list)({
  access: access_default,
  fields: {
    review: (0, import_fields10.text)(),
    rating: (0, import_fields10.integer)(),
    activity: (0, import_fields10.relationship)({
      ref: "Activity.review"
    }),
    lodging: (0, import_fields10.relationship)({
      ref: "Lodging.review"
    }),
    user: (0, import_fields10.relationship)({
      ref: "User.reviews"
    }),
    createdAt: (0, import_fields10.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Location/Location.ts
var import_core11 = require("@keystone-6/core");
var import_fields11 = require("@keystone-6/core/fields");

// models/Location/Location.hooks.ts
var linkHooks4 = {
  resolveInput: async ({ resolvedData, item, context }) => {
    if (item) {
      return item.link;
    }
    let baseLink = genUniqueLink(`${resolvedData.name.toLowerCase()}`);
    let uniqueLink = baseLink;
    let existingUser = await context.db.Location.findOne({
      where: { link: uniqueLink }
    });
    let counter = 1;
    while (existingUser) {
      uniqueLink = `${baseLink}-${counter}`;
      existingUser = await context.db.Location.findOne({
        where: { link: uniqueLink }
      });
      counter++;
    }
    return uniqueLink;
  }
};

// models/Location/Location.ts
var Location_default = (0, import_core11.list)({
  access: access_default,
  fields: {
    name: (0, import_fields11.text)(),
    description: (0, import_fields11.text)({ ui: { displayMode: "textarea" } }),
    activity: (0, import_fields11.relationship)({
      ref: "Activity.location",
      many: true
    }),
    lodging: (0, import_fields11.relationship)({
      ref: "Lodging.location",
      many: true
    }),
    image: (0, import_fields11.image)({ storage: "local_images" }),
    link: (0, import_fields11.text)({
      isIndexed: "unique",
      hooks: linkHooks4,
      ui: {
        createView: {
          fieldMode: "hidden"
        }
      }
    }),
    gallery: (0, import_fields11.relationship)({
      ref: "LocationGallery.location",
      many: true
    }),
    createdAt: (0, import_fields11.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Activity/ActivityGallery.ts
var import_core12 = require("@keystone-6/core");
var import_fields12 = require("@keystone-6/core/fields");
var ActivityGallery_default = (0, import_core12.list)({
  access: access_default,
  fields: {
    description: (0, import_fields12.text)(),
    image: (0, import_fields12.image)({ storage: "local_images" }),
    activity: (0, import_fields12.relationship)({
      ref: "Activity.gallery",
      many: true
    }),
    createdAt: (0, import_fields12.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Lodging/LodgingGallery.ts
var import_core13 = require("@keystone-6/core");
var import_fields13 = require("@keystone-6/core/fields");
var LodgingGallery_default = (0, import_core13.list)({
  access: access_default,
  fields: {
    description: (0, import_fields13.text)(),
    image: (0, import_fields13.image)({ storage: "local_images" }),
    lodging: (0, import_fields13.relationship)({
      ref: "Lodging.gallery",
      many: true
    }),
    createdAt: (0, import_fields13.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Location/LocationGallery.ts
var import_core14 = require("@keystone-6/core");
var import_fields14 = require("@keystone-6/core/fields");
var LocationGallery_default = (0, import_core14.list)({
  access: access_default,
  fields: {
    description: (0, import_fields14.text)(),
    image: (0, import_fields14.image)({ storage: "local_images" }),
    location: (0, import_fields14.relationship)({
      ref: "Location.gallery",
      many: true
    }),
    createdAt: (0, import_fields14.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Lodging/LodgingInclude.ts
var import_core15 = require("@keystone-6/core");
var import_fields15 = require("@keystone-6/core/fields");
var LodgingInclude_default = (0, import_core15.list)({
  access: access_default,
  fields: {
    name: (0, import_fields15.text)({ validation: { isRequired: true } }),
    description: (0, import_fields15.text)({ ui: { displayMode: "textarea" } }),
    lodging: (0, import_fields15.relationship)({
      ref: "Lodging.includes",
      many: true
    }),
    createdAt: (0, import_fields15.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Payment/Payment.ts
var import_core16 = require("@keystone-6/core");
var import_fields16 = require("@keystone-6/core/fields");
var Payment_default = (0, import_core16.list)({
  access: access_default,
  fields: {
    amount: (0, import_fields16.decimal)({
      scale: 6,
      defaultValue: "0.000000"
    }),
    status: (0, import_fields16.select)({
      type: "enum",
      validation: {
        isRequired: true
      },
      defaultValue: "pending",
      options: [
        { label: "Pendiente", value: "pending" },
        { label: "Procesando", value: "processing" },
        { label: "Exitoso", value: "succeeded" },
        { label: "Cancelado", value: "cancelled" },
        { label: "Fallido", value: "failed" },
        { label: "Devuelto", value: "refunded" }
      ]
    }),
    processorStripeChargeId: (0, import_fields16.text)(),
    stripeErrorMessage: (0, import_fields16.text)({
      ui: {
        displayMode: "textarea"
      }
    }),
    processorRefundId: (0, import_fields16.text)(),
    notes: (0, import_fields16.text)(),
    activity: (0, import_fields16.relationship)({
      ref: "Activity.payment"
    }),
    lodging: (0, import_fields16.relationship)({
      ref: "Lodging.payment"
    }),
    user: (0, import_fields16.relationship)({
      ref: "User.payment"
    }),
    booking: (0, import_fields16.relationship)({
      ref: "Booking.payment"
    }),
    paymentMethod: (0, import_fields16.relationship)({
      ref: "PaymentMethod.payment"
    }),
    createdAt: (0, import_fields16.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/Payment/PaymentMethod.ts
var import_fields17 = require("@keystone-6/core/fields");
var import_core17 = require("@keystone-6/core");

// models/Payment/PaymentMethod.access.ts
var access3 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => true,
    delete: ({ session: session2 }) => true
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => true,
    delete: ({ session: session2 }) => true
  },
  item: {
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => true,
    delete: ({ session: session2 }) => true
  }
};
var PaymentMethod_access_default = access3;

// models/Payment/PaymentMethod.ts
var PaymentMethod_default = (0, import_core17.list)({
  access: PaymentMethod_access_default,
  fields: {
    cardType: (0, import_fields17.text)(),
    isDefault: (0, import_fields17.checkbox)(),
    lastFourDigits: (0, import_fields17.text)(),
    expMonth: (0, import_fields17.text)(),
    expYear: (0, import_fields17.text)(),
    stripeProcessorId: (0, import_fields17.text)(),
    stripePaymentMethodId: (0, import_fields17.text)({ isIndexed: "unique" }),
    address: (0, import_fields17.text)(),
    postalCode: (0, import_fields17.text)(),
    ownerName: (0, import_fields17.text)(),
    country: (0, import_fields17.text)(),
    // Two-letter country code (ISO 3166-1 alpha-2).
    payment: (0, import_fields17.relationship)({
      ref: "Payment.paymentMethod",
      many: true
    }),
    user: (0, import_fields17.relationship)({
      ref: "User.paymentMethod",
      many: true
    }),
    createdAt: (0, import_fields17.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    }),
    updatedAt: (0, import_fields17.timestamp)({
      defaultValue: { kind: "now" },
      db: { updatedAt: true }
    })
  }
});

// models/Role/Role.ts
var import_core18 = require("@keystone-6/core");
var import_fields18 = require("@keystone-6/core/fields");

// models/Role/constants.ts
var role_options = [
  { label: "Admin", value: "admin" /* ADMIN */ },
  { label: "Anfitri\xF3n", value: "hoster" /* HOSTER */ },
  { label: "Usuario", value: "user" /* USER */ }
];

// models/Role/Role.ts
var Role_default = (0, import_core18.list)({
  access: access_default,
  fields: {
    name: (0, import_fields18.select)({
      options: role_options,
      validation: { isRequired: true }
    }),
    user: (0, import_fields18.relationship)({
      ref: "User.role",
      many: true
    }),
    createdAt: (0, import_fields18.timestamp)({
      defaultValue: {
        kind: "now"
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    })
  }
});

// models/schema.ts
var schema_default = {
  Activity: Activity_default,
  ActivityGallery: ActivityGallery_default,
  ActivityInclude: ActivityInclude_default,
  ActivityWhatToDo: ActivityWhatToDo_default,
  ActivityAvailable: ActivityAvailable_default,
  ActivityAvailableDay: ActivityAvailableDay_default,
  Booking: Booking_default,
  Location: Location_default,
  LocationGallery: LocationGallery_default,
  Lodging: Lodging_default,
  LodgingType: LodgingType_default,
  LodgingGallery: LodgingGallery_default,
  LodgingInclude: LodgingInclude_default,
  Payment: Payment_default,
  PaymentMethod: PaymentMethod_default,
  Review: Review_default,
  Role: Role_default,
  User: User_default
};

// keystone.ts
var import_core19 = require("@keystone-6/core");

// auth/auth.ts
var import_crypto = require("crypto");
var import_auth = require("@keystone-6/auth");
var import_session = require("@keystone-6/core/session");
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV !== "production") {
  sessionSecret = (0, import_crypto.randomBytes)(32).toString("hex");
}
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "email",
  sessionData: `
    id 
    name 
    role {
      id
      name
    }
    createdAt
  `,
  secretField: "password",
  // WARNING: remove initFirstItem functionality in production
  //   see https://keystonejs.com/docs/config/auth#init-first-item for more
  initFirstItem: {
    fields: ["name", "email", "password", "role"]
  }
});
var sessionMaxAge = 60 * 60 * 24 * 30;
var session = (0, import_session.statelessSessions)({
  maxAge: sessionMaxAge,
  secret: sessionSecret
});

// graphql/extendedSchema.ts
var import_schema = require("@graphql-tools/schema");

// graphql/customMutation/makePayment.ts
var typeDefs = `
  type makePaymentType {
    message: String,
    success: Boolean,
    data: JSON
  }
`;
var definition = `
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
var resolver = {
  makePayment: async (root, {
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
    noDuplicatePaymentMethod
  }, context) => {
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
      let lodging;
      const activity = await context.query.Activity.findOne({
        where: {
          id: dataPayment.activityId
        },
        query: "id name price"
      });
      let totalInBack = parseFloat(activity.price || "0.00") * Number(guestss);
      if (dataPayment.lodgingId) {
        lodging = await context.query.Lodging.findOne({
          where: {
            id: dataPayment.lodgingId
          },
          query: "id name price"
        });
        totalInBack += parseFloat(lodging?.price || "0.00") * Number(guestss);
      } else {
        lodging = void 0;
      }
      if (Number(total) != totalInBack) {
        return {
          message: "Hubo un error de comunicaci\xF3n, por favor recargue la p\xE1gina e intente de nuevo.",
          success: false
        };
      }
      const user = await context.query.User.findOne({
        where: {
          email: dataPayment.email
        },
        query: "id name stripeCustomerId"
      });
      const paymentMethod = await context.query.PaymentMethod.findOne({
        where: {
          id: dataPayment.paymentMethodId
        },
        query: "id stripeProcessorId stripePaymentMethodId"
      });
      if (noDuplicatePaymentMethod) {
        await stripe_default.paymentMethods.attach(
          paymentMethod.stripePaymentMethodId,
          {
            customer: user.stripeCustomerId
          }
        );
        await stripe_default.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.stripePaymentMethodId
          }
        });
      }
      const stripePaymentIntent = await stripe_default.paymentIntents.create({
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
          lodgingId: dataPayment.lodgingId
        }
      });
      if (stripePaymentIntent?.error) {
        await context.query.Payment.createOne({
          data: {
            paymentMethod: "card",
            amount: total,
            status: "failed",
            processorStripeChargeId: stripePaymentIntent?.id || "",
            stripeErrorMessage: stripePaymentIntent?.error?.message,
            user: {
              connect: {
                id: user.id
              }
            }
          }
        });
        return {
          message: stripePaymentIntent?.error?.message,
          success: false
        };
      }
      const payment = await context.query.Payment.createOne({
        data: {
          paymentMethod: {
            connect: {
              id: dataPayment.paymentMethodId
            }
          },
          activity: {
            connect: {
              id: activity.id
            }
          },
          lodging: lodging ? {
            connect: {
              id: lodging.id
            }
          } : void 0,
          user: {
            connect: {
              id: user.id
            }
          },
          amount: total,
          status: "succeeded",
          processorStripeChargeId: stripePaymentIntent?.id || "",
          notes: dataPayment.notes
        }
      });
      const booking = await context.query.Booking.createOne({
        data: {
          start_date: dataPayment.startDate,
          end_date: dataPayment.endDate,
          guests_adults: Number(dataPayment.guestss),
          activity: {
            connect: {
              id: activity.id
            }
          },
          lodging: lodging ? {
            connect: {
              id: lodging.id
            }
          } : void 0,
          user: {
            connect: {
              id: user.id
            }
          },
          payment: {
            connect: {
              id: payment.id
            }
          },
          status: "paid"
        }
      });
      return {
        message: "Pago y creaci\xF3n de reserva exitoso.",
        success: true,
        data: {
          booking: booking.id
        }
      };
    } catch (e) {
      console.log("e");
      console.log(e);
      return {
        message: "Tuvimos problemas de comunicaci\xF3n con el servidor. Por favor intentelo de nuevo.",
        success: false
      };
    }
  }
};
var makePayment_default = { typeDefs, definition, resolver };

// graphql/customMutation/index.ts
var customMutation = {
  typeDefs: `
    ${makePayment_default.typeDefs}
  `,
  definitions: `
    ${makePayment_default.definition}
  `,
  resolvers: {
    ...makePayment_default.resolver
  }
};
var customMutation_default = customMutation;

// graphql/customQuery/paymentMethod/setupIntent.ts
var typeDefs2 = `
  type SetUpIntentData {
    setupIntent: String,
    ephemeralKey: String,
    customerId: String,
    email: String,
  }

  type SetUpIntentStripeType {
    message: String,
    success: Boolean,
    data: SetUpIntentData
  }
`;
var definition2 = `
  SetUpIntentStripe(email: String!): SetUpIntentStripeType
`;
var resolver2 = {
  SetUpIntentStripe: async (root, { email }, context) => {
    console.log("context.session");
    console.log(context.session);
    const user = await context.query.User.findOne({
      where: {
        email
      },
      query: "id name stripeCustomerId"
    });
    const stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      return {
        message: "Missing stripe customer id",
        success: false,
        data: {}
      };
    }
    try {
      const ephemeralKey = await stripe_default.ephemeralKeys.create(
        { customer: stripeCustomerId },
        { apiVersion: "2023-10-16" }
      );
      const setupIntent = await stripe_default.setupIntents.create({
        payment_method_types: ["card"],
        customer: stripeCustomerId,
        usage: "off_session"
      });
      const paymentMethods = await stripe_default.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card"
      });
      return {
        message: "",
        success: true,
        data: {
          setupIntent: setupIntent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customerId: stripeCustomerId
        }
      };
    } catch (e) {
      console.log(e);
      return {
        message: e,
        success: false,
        data: {}
      };
    }
  }
};
var setupIntent_default = { typeDefs: typeDefs2, definition: definition2, resolver: resolver2 };

// graphql/customQuery/paymentMethod/stripePaymentMethods.ts
var typeDefs3 = `
  type StripeCard {
    brand: String
    country: String
    exp_month: Int
    exp_year: Int
    last4: String
  }

  type StripePaymentMethod {
    id: String
    object: String
    customer: String
    type: String
    card: StripeCard
    created: Int
    livemode: Boolean
    metadata: JSON
  }

  type StripePaymentMethodsData {
    data: [StripePaymentMethod]
  }

  type StripePaymentMethodsType {
    message: String,
    success: Boolean,
    data: StripePaymentMethodsData
  }
`;
var definition3 = `
  StripePaymentMethods(email: String!): StripePaymentMethodsType
`;
var resolver3 = {
  StripePaymentMethods: async (root, { email }, context) => {
    const user = await context.query.User.findOne({
      where: {
        email
      },
      query: "id name stripeCustomerId"
    });
    const stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      return {
        message: "Missing stripe customer id",
        success: false,
        data: {}
      };
    }
    try {
      const paymentMethods = await stripe_default.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card"
      });
      return {
        message: "",
        success: true,
        data: {
          data: paymentMethods.data
        }
      };
    } catch (e) {
      return {
        message: e,
        success: false,
        data: {}
      };
    }
  }
};
var stripePaymentMethods_default = { typeDefs: typeDefs3, definition: definition3, resolver: resolver3 };

// graphql/customQuery/index.ts
var customQuery = {
  typeDefs: `
    ${setupIntent_default.typeDefs}
    ${stripePaymentMethods_default.typeDefs}
  `,
  definitions: `
    ${setupIntent_default.definition}
    ${stripePaymentMethods_default.definition}
  `,
  resolvers: {
    ...setupIntent_default.resolver,
    ...stripePaymentMethods_default.resolver
  }
};
var customQuery_default = customQuery;

// graphql/extendedSchema.ts
function extendGraphqlSchema(baseSchema) {
  return (0, import_schema.mergeSchemas)({
    schemas: [baseSchema],
    typeDefs: `
      ${customQuery_default.typeDefs}
      ${customMutation_default.typeDefs}

      type Mutation {
        ${customMutation_default.definitions}
      }

      type Query {
        ${customQuery_default.definitions}
      }
      
    `,
    resolvers: {
      Mutation: {
        ...customMutation_default.resolvers
      },
      Query: {
        ...customQuery_default.resolvers
      }
    }
  });
}

// keystone.ts
var path2 = require("path");
var dotenv2 = require("dotenv");
dotenv2.config({ path: path2.resolve(process.cwd(), "config", ".env.dev") });
if (process.env.NODE_ENV !== "test" && !process.env.IS_BUILDING) {
  if (!process.env.ALLOW_ORIGINS) {
    throw new Error("Allow Origins are not set");
  }
}
var keystone_default = withAuth(
  (0, import_core19.config)({
    db: {
      provider: "postgresql",
      url: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.PGHOST}:${process.env.DB_PORT}/${process.env.POSTGRES_DB}?connect_timeout=300`
    },
    server: {
      cors: true,
      maxFileSize: 200 * 1024 * 1024
    },
    storage: {
      local_images: {
        kind: "local",
        type: "image",
        generateUrl: (path3) => `http://${process.env.PGHOST}:3001/images${path3}`,
        serverRoute: {
          path: "/images"
        },
        storagePath: "public/images"
      }
    },
    graphql: {
      extendGraphqlSchema
    },
    lists: schema_default,
    session
  })
);
//# sourceMappingURL=config.js.map
