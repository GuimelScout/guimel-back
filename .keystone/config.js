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

// models/Role/constants.ts
var role_options = [
  { label: "Admin", value: "admin" /* ADMIN */ },
  { label: "Anfitri\xF3n", value: "hoster" /* HOSTER */ },
  { label: "Usuario", value: "user" /* USER */ }
];

// auth/permissions.ts
var hasRole = (session2, allowedRoles) => {
  if (!session2 || !session2.data.role) {
    return false;
  }
  const hasAccess = session2.data.role?.some(
    (role) => [...allowedRoles, "admin" /* ADMIN */].includes(role.name)
  );
  return hasAccess;
};

// models/Lodging/Lodging.access.ts
var access = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { hostBy: { id: { equals: session2.itemId } } };
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { hostBy: { id: { equals: session2.itemId } } };
      }
      return false;
    }
  },
  item: {
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  }
};
var Lodging_access_default = access;

// utils/helpers/priceCalculation.ts
function calculateTotalPrice(basePrice, commissionType, commissionValue) {
  if (!basePrice || !commissionValue) return 0;
  const price = parseFloat(basePrice.toString());
  let commission = 0;
  if (commissionType === "percentage") {
    commission = price * (parseFloat(commissionValue.toString()) / 100);
  } else {
    commission = parseFloat(commissionValue.toString());
  }
  const totalWithCommission = parseFloat((price + commission).toFixed(2));
  const totalPrice = totalWithCommission + calculateStripeFee(totalWithCommission);
  return totalPrice;
}
function calculateStripeFee(amount) {
  const amt = parseFloat(amount.toString());
  return parseFloat((amt * 0.036 + 3).toFixed(2));
}
function calculatePaymentBreakdownWithGuests(basePrice, commissionType, commissionValue, paymentType, guestsCount) {
  const pricePerGuest = parseFloat(basePrice.toString());
  const totalBasePrice = pricePerGuest * guestsCount;
  let commission = 0;
  if (commissionType === "percentage") {
    commission = totalBasePrice * (parseFloat(commissionValue.toString()) / 100);
  } else {
    commission = parseFloat(commissionValue.toString());
  }
  const totalPrice = totalBasePrice + commission;
  const stripeFee = calculateStripeFee(totalPrice);
  if (paymentType === "full_payment") {
    return {
      payNow: parseFloat((totalPrice + stripeFee).toFixed(2)),
      payAtProperty: 0,
      basePrice: parseFloat(totalBasePrice.toFixed(2)),
      commission: parseFloat(commission.toFixed(2)),
      stripeFee: parseFloat(stripeFee.toFixed(2)),
      totalCommission: parseFloat((commission + stripeFee).toFixed(2))
    };
  } else {
    return {
      payNow: parseFloat((commission + stripeFee).toFixed(2)),
      payAtProperty: parseFloat(totalBasePrice.toFixed(2)),
      basePrice: parseFloat(totalBasePrice.toFixed(2)),
      commission: parseFloat(commission.toFixed(2)),
      stripeFee: parseFloat(stripeFee.toFixed(2)),
      totalCommission: parseFloat((commission + stripeFee).toFixed(2))
    };
  }
}

// models/Lodging/Lodging.ts
var Lodging_default = (0, import_core.list)({
  access: Lodging_access_default,
  fields: {
    name: (0, import_fields.text)({ validation: { isRequired: true } }),
    description: (0, import_fields.text)({ ui: { displayMode: "textarea" } }),
    price: (0, import_fields.decimal)(),
    commission_type: (0, import_fields.select)({
      options: [
        { label: "Precio Fijo", value: "fixed" },
        { label: "Porcentaje", value: "percentage" }
      ],
      defaultValue: "percentage",
      validation: { isRequired: true }
    }),
    commission_value: (0, import_fields.decimal)({
      validation: { isRequired: true }
    }),
    total_price: (0, import_fields.virtual)({
      field: import_core.graphql.field({
        type: import_core.graphql.Float,
        async resolve(item) {
          return calculateTotalPrice(
            item.price,
            item.commission_type,
            item.commission_value
          );
        }
      })
    }),
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
    logo: (0, import_fields.image)({ storage: "s3_files" }),
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
    let { phone } = resolvedData;
    if (phone) {
      const pattern = /^\d{10}$/;
      if (!pattern.test(phone)) {
        addValidationError(
          "El tel\xE9fono debe tener exactamente 10 d\xEDgitos, sin espacios ni s\xEDmbolos"
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
          where: { name: "user" }
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
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */])
  },
  item: {
    create: ({ session: session2 }) => true,
    update: ({ session: session2, item }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */])) {
        return session2?.itemId === item?.id;
      }
      return false;
    },
    delete: ({ session: session2, item }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */])) {
        return session2?.itemId === item?.id;
      }
      return false;
    }
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
    countryCode: (0, import_fields2.text)(),
    phone: (0, import_fields2.text)({
      hooks: phoneHooks
    }),
    description: (0, import_fields2.text)({ ui: { displayMode: "textarea" } }),
    instagram: (0, import_fields2.text)(),
    facebook: (0, import_fields2.text)(),
    twitter: (0, import_fields2.text)(),
    linkedin: (0, import_fields2.text)(),
    tiktok: (0, import_fields2.text)(),
    youtube: (0, import_fields2.text)(),
    website: (0, import_fields2.text)(),
    stripeCustomerId: (0, import_fields2.text)(),
    role: (0, import_fields2.relationship)({
      ref: "Role.user",
      many: true,
      access: {
        update: ({ session: session2 }) => hasRole(session2, ["admin" /* ADMIN */])
      }
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
    createdBy: (0, import_fields2.relationship)({
      ref: "Review.createdBy",
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
    image: (0, import_fields2.image)({ storage: "s3_files" }),
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
  access: Lodging_access_default,
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

// models/Activity/Activity.access.ts
var access3 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { hostBy: { id: { equals: session2.itemId } } };
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { hostBy: { id: { equals: session2.itemId } } };
      }
      return false;
    }
  },
  item: {
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return true;
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return true;
      }
      return false;
    }
  }
};
var Activity_access_default = access3;

// models/Activity/Activity.ts
var Activity_default = (0, import_core4.list)({
  access: Activity_access_default,
  fields: {
    name: (0, import_fields4.text)({ validation: { isRequired: true } }),
    description: (0, import_fields4.text)({ ui: { displayMode: "textarea" } }),
    descriptionActivities: (0, import_fields_document.document)({
      formatting: true,
      links: true
    }),
    address: (0, import_fields4.text)({ ui: { displayMode: "textarea", description: 'You must add the address like: "street, zip neighborhood state country"' } }),
    price: (0, import_fields4.decimal)(),
    commission_type: (0, import_fields4.select)({
      options: [
        { label: "Precio Fijo", value: "fixed" },
        { label: "Porcentaje", value: "percentage" }
      ],
      defaultValue: "percentage",
      validation: { isRequired: true }
    }),
    commission_value: (0, import_fields4.decimal)({
      validation: { isRequired: true }
    }),
    total_price: (0, import_fields4.virtual)({
      field: import_core4.graphql.field({
        type: import_core4.graphql.Float,
        async resolve(item) {
          return calculateTotalPrice(
            item.price,
            item.commission_type,
            item.commission_value
          );
        }
      })
    }),
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
      validation: { isRequired: true },
      ui: {
        description: "Select the type of day the activity is available. If you select 'some_days', you must select the days in the AvailableDays section."
      }
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
    totalReviews: (0, import_fields4.virtual)({
      field: import_core4.graphql.field({
        type: import_core4.graphql.Int,
        async resolve(item, args, context) {
          const reviews = await context.db.Review.findMany({
            where: { activity: { id: { equals: item.id } } }
          });
          return reviews.length;
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
      many: true,
      ui: {
        description: "Select the days the activity is available only if you select 'some_days' in the Type day section."
      }
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
    image: (0, import_fields4.image)({ storage: "s3_files" }),
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

// models/Activity/ActivityFieldsMany.access.ts
var access4 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { activity: { some: { hostBy: { id: { equals: session2.itemId } } } } };
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { activity: { some: { hostBy: { id: { equals: session2.itemId } } } } };
      }
      return false;
    }
  },
  item: {
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  }
};
var ActivityFieldsMany_access_default = access4;

// models/Activity/ActivityInclude.ts
var ActivityInclude_default = (0, import_core5.list)({
  access: ActivityFieldsMany_access_default,
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
  access: ActivityFieldsMany_access_default,
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

// models/Activity/ActivityFields.access.ts
var access5 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { activity: { hostBy: { id: { equals: session2.itemId } } } };
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { activity: { hostBy: { id: { equals: session2.itemId } } } };
      }
      return false;
    }
  },
  item: {
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  }
};
var ActivityFields_access_default = access5;

// models/Activity/ActivityAvailable.ts
var ActivityAvailable_default = (0, import_core7.list)({
  access: ActivityFields_access_default,
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
  access: ActivityFields_access_default,
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

// utils/helpers/bookingCode.ts
function getBookingCode(item) {
  const fecha = new Date(item.createdAt);
  const day = fecha.getDate().toString().padStart(2, "0");
  const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const anio = fecha.getFullYear() % 100;
  const dateFormat = `${day}${month}${anio}`;
  const timestamp20 = Date.now().toString().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const idCode = item.id ? `${item.id.toString().slice(-4)}${timestamp20}`.toUpperCase() : `${random}${timestamp20}`.toUpperCase();
  return `${idCode}-${dateFormat}`;
}

// utils/helpers/generate_password.ts
function generatePassword(name) {
  const firstTwoLetters = name.substring(0, 2).toUpperCase();
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return `${process.env.KEY_PASS ?? ""}${year}${firstTwoLetters}`;
}

// utils/notification.ts
import_mail.default.setApiKey(process.env.SENDGRID_API_KEY);
var twilioClient = (0, import_twilio.default)(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
async function sendConfirmationEmail(booking) {
  const msg = {
    to: booking.user.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    templateId: process.env.SENDGRID_TEMPLATE_BOOKING_ID,
    dynamicTemplateData: {
      name: `${booking.user.name} ${booking.user.lastName ?? ""}`,
      location: booking.location.name,
      date: `${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}`,
      booking_code: getBookingCode(booking),
      guestsCount: booking.guests_adults,
      user: booking.user.email,
      password: generatePassword(booking.user.name),
      activities: booking.activitiesWithHost.map((a) => ({
        name: a.name,
        description: a.description,
        price: a.price,
        host: a.host.name,
        host_email: a.host.email,
        host_phone: `${a.host.countryCode}${a.host.phone}`,
        link: `${process.env.FRONT_END_URL}/actividad/${a.link}`,
        image: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${a.image_id}.${a.image_extension}`
      }))
    }
  };
  try {
    await import_mail.default.send(msg);
    console.log("Correo enviado con \xE9xito. \u{1F4E7}");
  } catch (error) {
    console.error("Error al enviar correo. \u274C:", error);
  }
}
async function sendConfirmationSMS(booking) {
  try {
    await twilioClient.messages.create({
      body: `Hola ${booking.user.name}, \u{1F389} tu experiencia en ${booking.location.name} est\xE1 confirmada para el ${new Date(booking.start_date).toLocaleDateString()}. \xA1Te esperamos para vivir esta aventura inolvidable!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `${booking.user.countryCode}${booking.user.phone}`
    });
    console.log("SMS enviado con \xE9xito");
  } catch (error) {
    console.error("Error al enviar SMS:", error);
  }
}
async function sendContactNotificationToAdmins(contact, context) {
  try {
    const adminUsers = await context.db.User.findMany({
      where: {
        role: {
          some: {
            name: { equals: "admin" }
          }
        }
      },
      query: "id name lastName email"
    });
    if (adminUsers.length === 0) {
      return;
    }
    const emailPromises = adminUsers.map(async (admin) => {
      const msg = {
        to: admin.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: "Nuevo mensaje de contacto recibido",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Nuevo mensaje de contacto</h2>
            <p>Hola ${admin.name},</p>
            <p>Se ha recibido un nuevo mensaje de contacto en la plataforma:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Detalles del mensaje:</h3>
              <p><strong>Nombre:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> ${contact.email}</p>
              <p><strong>Tel\xE9fono:</strong> ${contact.phone || "No proporcionado"}</p>
              <p><strong>Fecha:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
              <p><strong>Mensaje:</strong></p>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin-top: 10px;">
                ${contact.message}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Este es un mensaje autom\xE1tico del sistema de Guimel.
            </p>
          </div>
        `
      };
      return import_mail.default.send(msg);
    });
    await Promise.all(emailPromises);
    console.log(`Contact notification sent to ${adminUsers.length} admin users`);
  } catch (error) {
    console.error("Error sending contact notification to admins:", error);
  }
}
async function sendBookingNotificationToHosts(booking) {
  try {
    if (!booking.activitiesWithHost || booking.activitiesWithHost.length === 0) {
      return;
    }
    const uniqueHosts = /* @__PURE__ */ new Map();
    booking.activitiesWithHost.forEach((activity) => {
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
    const emailPromises = finalRecipients.map(async (recipient) => {
      const msg = {
        to: recipient.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: "\u{1F389} Nueva reservaci\xF3n recibida - Guimel",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">\xA1Nueva reservaci\xF3n recibida!</h2>
            <p>Hola ${recipient.name},</p>
            <p>Se ha realizado una nueva reservaci\xF3n en tu actividad:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Detalles de la reservaci\xF3n:</h3>
              <p><strong>C\xF3digo de reservaci\xF3n:</strong> ${getBookingCode(booking)}</p>
              <p><strong>Cliente:</strong> ${booking.user.name} ${booking.user.lastName || ""}</p>
              <p><strong>Email del cliente:</strong> ${booking.user.email}</p>
              <p><strong>Tel\xE9fono:</strong> ${booking.user.countryCode || ""}${booking.user.phone || "No proporcionado"}</p>
              <p><strong>Ubicaci\xF3n:</strong> ${booking.location.name}</p>
              <p><strong>Fechas:</strong> ${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}</p>
              <p><strong>N\xFAmero de hu\xE9spedes:</strong> ${booking.guests_adults}</p>
              <p><strong>Tipo de pago:</strong> ${booking.payment_type === "full_payment" ? "Pago completo" : "Solo reservaci\xF3n"}</p>
            </div>

            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2d5a2d;">Actividades reservadas:</h3>
              ${booking.activitiesWithHost.map((activity) => `
                <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 3px;">
                  <p style="margin: 0;"><strong>${activity.name}</strong></p>
                </div>
              `).join("")}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONT_END_URL}/dashboard" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver en Dashboard
              </a>
            </div>
          </div>
        `
      };
      return import_mail.default.send(msg);
    });
    await Promise.all(emailPromises);
    console.log(`\u2705 [HOST_NOTIFICATION] Booking notification sent to ${finalRecipients.length} recipients`);
  } catch (error) {
    console.error("\u274C [HOST_NOTIFICATION] Error sending booking notification to hosts:", {
      error: error.message,
      stack: error.stack,
      bookingId: booking.id
    });
  }
}

// models/Booking/Booking.hooks.ts
var bookingHooks = {
  afterOperation: async ({ operation, item, context }) => {
    if (operation === "create") {
      let code = getBookingCode({ id: item.id, createdAt: item.createdAt });
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        const existingBooking = await context.query.Booking.findOne({
          where: { code }
        });
        if (!existingBooking) {
          break;
        }
        code = getBookingCode({
          id: item.id + Math.random().toString(36).substring(2, 8),
          createdAt: item.createdAt
        });
        attempts++;
      }
      if (attempts >= maxAttempts) {
        return;
      }
      await context.sudo().query.Booking.updateOne({
        where: { id: item.id },
        data: { code }
      });
      let userID = item.userId || item.user?.id;
      if (userID) {
        const [user, activities, location] = await Promise.all([
          context.query.User.findOne({
            where: { id: userID },
            query: "id name lastName email phone countryCode"
          }),
          context.query.Activity.findMany({
            where: { booking: { some: { id: { equals: item.id } } } },
            query: "id name hostBy { id } location { name image { url } }"
          }),
          context.query.Location.findOne({
            where: { id: item.locationId ?? item.location?.id },
            query: "name image { url }"
          })
        ]);
        let lodging;
        if (item.lodgingId || item.lodging?.id) {
          lodging = await context.query.Lodging.findOne({
            where: { id: item.lodgingId ?? item.lodging?.id },
            query: "id name"
          });
        }
        const hostIds = activities.map((activity) => activity.hostBy?.id).filter(Boolean);
        const users = await context.query.User.findMany({
          where: { id: { in: hostIds } },
          query: "id name lastName email phone countryCode"
        });
        const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
        const activitiesWithHost = activities.map((activity) => ({
          ...activity,
          host: userMap[activity.hostBy?.id] || null
        }));
        const bookingInfo = {
          ...item,
          user,
          activitiesWithHost,
          location,
          lodging
        };
        try {
          await sendConfirmationEmail(bookingInfo);
          console.log("\u2705 [BOOKING_HOOK] Confirmation email sent successfully");
        } catch (emailError) {
          console.error("\u274C [BOOKING_HOOK] Error sending confirmation email:", {
            error: emailError.message,
            stack: emailError.stack,
            bookingId: item.id,
            userEmail: user?.email
          });
        }
        try {
          await sendConfirmationSMS(bookingInfo);
          console.log("\u2705 [BOOKING_HOOK] Confirmation SMS sent successfully");
        } catch (smsError) {
          console.error("\u274C [BOOKING_HOOK] Error sending confirmation SMS:", {
            error: smsError.message,
            stack: smsError.stack,
            bookingId: item.id,
            userPhone: user?.phone,
            userCountryCode: user?.countryCode
          });
        }
        try {
          await sendBookingNotificationToHosts(bookingInfo);
          console.log("\u2705 [BOOKING_HOOK] Host notification sent successfully");
        } catch (hostNotificationError) {
          console.error("\u274C [BOOKING_HOOK] Error sending host notification:", {
            error: hostNotificationError.message,
            stack: hostNotificationError.stack,
            bookingId: item.id
          });
        }
      } else {
        console.log("\u26A0\uFE0F [BOOKING_HOOK] Booking created without associated user - no notifications sent", {
          bookingId: item.id,
          status: item.status
        });
      }
    }
  }
};

// models/Booking/Booking.access.ts
var access6 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (!session2) return false;
      return hasRole(session2, ["hoster" /* HOSTER */]);
    },
    delete: ({ session: session2 }) => {
      if (!session2) return false;
      return hasRole(session2, ["hoster" /* HOSTER */]);
    }
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (!session2) return false;
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { user: { id: { equals: session2.itemId } } };
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (!session2) return false;
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { user: { id: { equals: session2.itemId } } };
      }
      return false;
    }
  },
  item: {
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (!session2) return false;
      return hasRole(session2, ["hoster" /* HOSTER */]);
    },
    delete: ({ session: session2 }) => {
      if (!session2) return false;
      return hasRole(session2, ["hoster" /* HOSTER */]);
    }
  }
};
var Booking_access_default = access6;

// models/Booking/Booking.ts
var Booking_default = (0, import_core9.list)({
  access: Booking_access_default,
  hooks: bookingHooks,
  fields: {
    start_date: (0, import_fields9.calendarDay)(),
    end_date: (0, import_fields9.calendarDay)(),
    guests_adults: (0, import_fields9.integer)(),
    guests_childs: (0, import_fields9.integer)(),
    guestsCount: (0, import_fields9.virtual)({
      field: import_core9.graphql.field({
        type: import_core9.graphql.String,
        async resolve(item) {
          return (item?.guests_adults ?? 0) + (item?.guests_childs ?? 0);
        }
      })
    }),
    code: (0, import_fields9.text)({
      isIndexed: "unique",
      ui: {
        createView: {
          fieldMode: "hidden"
        }
      }
    }),
    payment_type: (0, import_fields9.select)({
      options: [
        { label: "Pago Completo", value: "full_payment" },
        { label: "Solo Comisi\xF3n", value: "commission_only" }
      ],
      validation: { isRequired: true },
      defaultValue: "full_payment"
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
        { label: "Reservado", value: "reserved" },
        { label: "Cancelado", value: "cancelled" },
        { label: "Confirmado", value: "confirmed" },
        { label: "Completado", value: "completed" }
      ]
    }),
    activity: (0, import_fields9.relationship)({
      ref: "Activity.booking",
      many: true
    }),
    lodging: (0, import_fields9.relationship)({
      ref: "Lodging.booking"
    }),
    location: (0, import_fields9.relationship)({
      ref: "Location.booking"
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

// models/Review/Review.hooks.ts
var reviewHooks = {
  resolveInput: async ({ resolvedData, item, context, operation }) => {
    if (operation === "create" && context.session?.itemId) {
      return {
        ...resolvedData,
        createdBy: { connect: { id: context.session.itemId } }
      };
    }
    return resolvedData;
  }
};

// models/Review/Review.access.ts
var access7 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => !!session2,
    delete: ({ session: session2 }) => !!session2
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["user" /* USER */, "hoster" /* HOSTER */])) {
        return {
          user: { id: { equals: session2?.itemId } }
        };
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["user" /* USER */, "hoster" /* HOSTER */])) {
        return {
          user: { id: { equals: session2?.itemId } }
        };
      }
      return false;
    }
  },
  item: {
    create: ({ session: session2 }) => true,
    update: ({ session: session2, item }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["user" /* USER */, "hoster" /* HOSTER */])) {
        return item.user === session2?.itemId;
      }
      return false;
    },
    delete: ({ session: session2, item }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["user" /* USER */, "hoster" /* HOSTER */])) {
        return item.user === session2?.itemId;
      }
      return false;
    }
  }
};
var Review_access_default = access7;

// models/Review/Review.ts
var Review_default = (0, import_core10.list)({
  access: Review_access_default,
  hooks: reviewHooks,
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
    createdBy: (0, import_fields10.relationship)({
      ref: "User.createdBy"
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

// models/Location/Location.access.ts
var access8 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => hasRole(session2, []),
    update: ({ session: session2 }) => hasRole(session2, []),
    delete: ({ session: session2 }) => hasRole(session2, [])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => hasRole(session2, []),
    delete: ({ session: session2 }) => hasRole(session2, [])
  },
  item: {
    create: ({ session: session2 }) => hasRole(session2, []),
    update: ({ session: session2 }) => hasRole(session2, []),
    delete: ({ session: session2 }) => hasRole(session2, [])
  }
};
var Location_access_default = access8;

// models/Location/Location.ts
var Location_default = (0, import_core11.list)({
  access: Location_access_default,
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
    booking: (0, import_fields11.relationship)({
      ref: "Booking.location",
      many: true
    }),
    image: (0, import_fields11.image)({ storage: "s3_files" }),
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
  access: ActivityFieldsMany_access_default,
  fields: {
    description: (0, import_fields12.text)(),
    image: (0, import_fields12.image)({ storage: "s3_files" }),
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

// models/Lodging/LodgingFields.access.ts
var access9 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { hostBy: { id: { equals: session2.itemId } } };
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { hostBy: { id: { equals: session2.itemId } } };
      }
      return false;
    }
  },
  item: {
    create: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  }
};
var LodgingFields_access_default = access9;

// models/Lodging/LodgingGallery.ts
var LodgingGallery_default = (0, import_core13.list)({
  access: LodgingFields_access_default,
  fields: {
    description: (0, import_fields13.text)(),
    image: (0, import_fields13.image)({ storage: "s3_files" }),
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
  access: Location_access_default,
  fields: {
    description: (0, import_fields14.text)(),
    image: (0, import_fields14.image)({ storage: "s3_files" }),
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
  access: Lodging_access_default,
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

// models/Payment/Payment.access.ts
var access10 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { user: { id: { equals: session2.itemId } } };
      }
      return false;
    },
    delete: ({ session: session2 }) => {
      if (hasRole(session2, ["admin" /* ADMIN */])) {
        return true;
      }
      if (hasRole(session2, ["hoster" /* HOSTER */])) {
        return { user: { id: { equals: session2.itemId } } };
      }
      return false;
    }
  },
  item: {
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */])
  }
};
var Payment_access_default = access10;

// models/Payment/Payment.ts
var Payment_default = (0, import_core16.list)({
  access: Payment_access_default,
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
      ref: "Activity.payment",
      many: true
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
var PaymentMethod_default = (0, import_core17.list)({
  access: Payment_access_default,
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

// models/Role/Role.access.ts
var access11 = {
  operation: {
    query: ({ session: session2 }) => true,
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */])
  },
  filter: {
    query: ({ session: session2 }) => true,
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */])
  },
  item: {
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */]),
    delete: ({ session: session2 }) => hasRole(session2, ["hoster" /* HOSTER */, "user" /* USER */])
  }
};
var Role_access_default = access11;

// models/Role/Role.ts
var Role_default = (0, import_core18.list)({
  access: Role_access_default,
  fields: {
    name: (0, import_fields18.select)({
      options: role_options,
      isIndexed: "unique",
      validation: { isRequired: true }
    }),
    user: (0, import_fields18.relationship)({
      ref: "User.role",
      many: true,
      access: {
        update: ({ session: session2 }) => hasRole(session2, ["admin" /* ADMIN */])
      }
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

// models/Contact/Contact.ts
var import_core19 = require("@keystone-6/core");
var import_fields19 = require("@keystone-6/core/fields");

// models/Contact/Contact.hooks.ts
var contactHooks = {
  afterOperation: async ({ operation, item, context }) => {
    if (operation === "create") {
      try {
        await sendContactNotificationToAdmins(item, context);
      } catch (error) {
        console.error("Error sending contact notification to admins:", error);
      }
    }
  }
};

// models/Contact/Contact.access.ts
var access12 = {
  operation: {
    query: ({ session: session2 }) => hasRole(session2, ["admin" /* ADMIN */]),
    create: ({ session: session2 }) => true,
    update: ({ session: session2 }) => hasRole(session2, ["admin" /* ADMIN */]),
    delete: ({ session: session2 }) => hasRole(session2, ["admin" /* ADMIN */])
  },
  filter: {
    query: ({ session: session2 }) => hasRole(session2, ["admin" /* ADMIN */]),
    update: ({ session: session2 }) => hasRole(session2, ["admin" /* ADMIN */]),
    delete: ({ session: session2 }) => hasRole(session2, ["admin" /* ADMIN */])
  },
  item: {
    create: ({ session: session2 }) => true,
    update: ({ session: session2, item }) => hasRole(session2, ["admin" /* ADMIN */]),
    delete: ({ session: session2, item }) => hasRole(session2, ["admin" /* ADMIN */])
  }
};
var Contact_access_default = access12;

// models/Contact/Contact.ts
var Contact_default = (0, import_core19.list)({
  access: Contact_access_default,
  hooks: contactHooks,
  fields: {
    name: (0, import_fields19.text)(),
    email: (0, import_fields19.text)(),
    phone: (0, import_fields19.text)(),
    message: (0, import_fields19.text)({ ui: { displayMode: "textarea" } }),
    createdAt: (0, import_fields19.timestamp)({
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
  User: User_default,
  Contact: Contact_default
};

// keystone.ts
var import_core20 = require("@keystone-6/core");

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
    fields: ["name", "lastName", "email", "password", "role"]
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
  locationId: String, 
  activityIds: [String!]!, 
  startDate: CalendarDay!, 
  endDate: CalendarDay!,
  guestsCount: String!, 
  nameCard: String!, 
  email: String!, 
  notes: String!, 
  paymentMethodId: String!, 
  total: String!, 
  noDuplicatePaymentMethod: Boolean!,
  paymentType: String!
  ): makePaymentType
`;
function validatePaymentInput({ activityIds, lodgingId, locationId, startDate, endDate, guestsCount, nameCard, email, paymentMethodId, total, paymentType }) {
  if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
    throw new Error("At least one activity must be selected.");
  }
  if (!locationId) throw new Error("Location is required.");
  if (!startDate || !endDate) throw new Error("Dates are required.");
  if (!guestsCount || isNaN(Number(guestsCount)) || Number(guestsCount) <= 0) throw new Error("Number of guests must be greater than 0.");
  if (!nameCard) throw new Error("Cardholder name is required.");
  if (!email) throw new Error("Email is required.");
  if (!paymentMethodId) throw new Error("Payment method is required.");
  if (!total || isNaN(Number(total)) || Number(total) <= 0) throw new Error("Total must be greater than 0.");
  if (!paymentType || !["full_payment", "commission_only"].includes(paymentType)) {
    throw new Error("Payment type must be 'full_payment' or 'commission_only'.");
  }
}
function calculateTotalWithCommissions(activities, lodging, guestsCount, paymentType) {
  let total = 0;
  const guests = Number(guestsCount);
  activities.forEach((activity, index) => {
    const breakdown = calculatePaymentBreakdownWithGuests(
      activity.price,
      activity.commission_type,
      activity.commission_value,
      paymentType,
      guests
    );
    total += breakdown.payNow;
  });
  if (lodging) {
    const breakdown = calculatePaymentBreakdownWithGuests(
      lodging.price,
      lodging.commission_type,
      lodging.commission_value,
      paymentType,
      guests
    );
    total += breakdown.payNow;
  }
  return total;
}
async function createStripePaymentIntent({ total, user, paymentMethod, activityNames, activityIds, lodgingId }) {
  const amountInCents = Math.round(Number(total) * 100);
  try {
    const paymentIntent = await stripe_default.paymentIntents.create({
      amount: amountInCents,
      currency: "mxn",
      customer: user.stripeCustomerId,
      payment_method: paymentMethod.stripePaymentMethodId,
      description: `Payment for activities: ${activityNames} (${activityIds})`,
      confirm: false,
      // Don't confirm immediately, keep in processing state
      metadata: {
        paymentMethod: paymentMethod.id,
        activityIds,
        lodgingId
      }
    });
    return paymentIntent;
  } catch (error) {
    throw error;
  }
}
var resolver = {
  makePayment: async (root, {
    activityIds,
    lodgingId,
    locationId,
    startDate,
    endDate,
    guestsCount,
    nameCard,
    email,
    notes,
    paymentMethodId,
    total,
    noDuplicatePaymentMethod,
    paymentType
  }, context) => {
    let paymentIntentId;
    let paymentId;
    let bookingId;
    try {
      validatePaymentInput({ activityIds, lodgingId, locationId, startDate, endDate, guestsCount, nameCard, email, paymentMethodId, total, paymentType });
      const activities = await context.query.Activity.findMany({
        where: { id: { in: activityIds } },
        query: "id name price commission_type commission_value"
      });
      if (!activities || activities.length === 0) throw new Error("No valid activities found.");
      let lodging = void 0;
      if (lodgingId) {
        lodging = await context.query.Lodging.findOne({
          where: { id: lodgingId },
          query: "id name price commission_type commission_value"
        });
        if (!lodging) throw new Error("Selected lodging not found.");
      }
      const totalInBack = calculateTotalWithCommissions(activities, lodging, guestsCount, paymentType);
      const roundedTotalInBack = parseFloat(totalInBack.toFixed(2));
      const roundedFrontendTotal = parseFloat(Number(total).toFixed(2));
      if (roundedFrontendTotal !== roundedTotalInBack) {
        return {
          message: `Communication error, please reload the page and try again.`,
          success: false
        };
      }
      const user = await context.query.User.findOne({
        where: { email },
        query: "id name email stripeCustomerId"
      });
      if (!user) throw new Error("User not found.");
      if (!user.stripeCustomerId) {
        const stripeCustomer = await stripe_default.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id
          }
        });
        await context.sudo().query.User.updateOne({
          where: { id: user.id },
          data: { stripeCustomerId: stripeCustomer.id }
        });
        user.stripeCustomerId = stripeCustomer.id;
      }
      const paymentMethod = await context.query.PaymentMethod.findOne({
        where: { id: paymentMethodId },
        query: "id stripeProcessorId stripePaymentMethodId"
      });
      if (!paymentMethod) throw new Error("Payment method not found.");
      if (noDuplicatePaymentMethod) {
        await stripe_default.paymentMethods.attach(paymentMethod.stripePaymentMethodId, {
          customer: user.stripeCustomerId
        });
        await stripe_default.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.stripePaymentMethodId
          }
        });
      }
      const activityNames = activities.map((activity) => activity.name).join(", ");
      const activityIdsStr = activities.map((activity) => activity.id).join(",");
      const roundedTotal = roundedTotalInBack.toString();
      const stripePaymentIntent = await createStripePaymentIntent({
        total: roundedTotal,
        user,
        paymentMethod,
        activityNames,
        activityIds: activityIdsStr,
        lodgingId
      });
      paymentIntentId = stripePaymentIntent?.id;
      if (stripePaymentIntent?.error) {
        await context.query.Payment.createOne({
          data: {
            paymentMethod: "card",
            amount: roundedTotal,
            status: "failed",
            processorStripeChargeId: stripePaymentIntent?.id || "",
            stripeErrorMessage: stripePaymentIntent?.error?.message,
            user: { connect: { id: user.id } }
          }
        });
        return {
          message: stripePaymentIntent?.error?.message,
          success: false
        };
      }
      let payment = await context.query.Payment.createOne({
        data: {
          paymentMethod: { connect: { id: paymentMethodId } },
          activity: { connect: activities.map((activity) => ({ id: activity.id })) },
          lodging: lodging ? { connect: { id: lodging.id } } : void 0,
          user: { connect: { id: user.id } },
          amount: roundedTotal,
          status: "succeeded",
          processorStripeChargeId: stripePaymentIntent?.id || "",
          notes
        }
      });
      paymentId = payment.id;
      const bookingStatus = paymentType === "full_payment" ? "paid" : "reserved";
      const booking = await context.query.Booking.createOne({
        data: {
          start_date: startDate,
          end_date: endDate,
          guests_adults: Number(guestsCount),
          payment_type: paymentType,
          activity: { connect: activities.map((activity) => ({ id: activity.id })) },
          lodging: lodging ? { connect: { id: lodging.id } } : void 0,
          location: { connect: { id: locationId } },
          user: { connect: { id: user.id } },
          payment: { connect: { id: payment.id } },
          status: bookingStatus,
          code: getBookingCode({ id: payment.id, createdAt: payment.createdAt })
          //this is to prevent the code stay empty
        }
      });
      bookingId = booking.id;
      await stripe_default.paymentIntents.confirm(paymentIntentId, {
        off_session: true
      });
      return {
        message: "Tu pago y reserva han sido creadas exitosamente. En breve te llegara un correo de confirmaci\xF3n. Te estamos redirigiendo a la p\xE1gina de tu reserva...",
        success: true,
        data: { booking: booking.id }
      };
    } catch (e) {
      if (paymentIntentId) {
        try {
          await stripe_default.paymentIntents.cancel(paymentIntentId);
        } catch (_) {
        }
      }
      if (paymentId) {
        await context.sudo().query.Payment.updateOne({
          where: { id: paymentId },
          data: { status: "cancelled", notes: notes + " - Reason for cancellation: Communication error with the server. " + e.message }
        });
      }
      if (bookingId) {
        await context.sudo().query.Booking.updateOne({
          where: { id: bookingId },
          data: { status: "cancelled" }
        });
      }
      return {
        message: e && typeof e === "object" && "message" in e ? e.message : "We had communication problems with the server. Please try again.",
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
if (!process.env.S3_BUCKET_NAME || !process.env.S3_REGION || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
  throw new Error("S3 Configs are not set");
}
var {
  S3_BUCKET_NAME: bucketName = "",
  S3_REGION: region = "",
  S3_ACCESS_KEY_ID: accessKeyId = "",
  S3_SECRET_ACCESS_KEY: secretAccessKey = ""
} = process.env;
var keystone_default = withAuth(
  (0, import_core20.config)({
    db: {
      provider: "postgresql",
      url: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.POSTGRES_DB}`
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
      },
      s3_files: {
        kind: "s3",
        // this storage uses S3
        type: "image",
        // only for files
        bucketName,
        // from your S3_BUCKET_NAME environment variable
        region,
        // from your S3_REGION environment variable
        accessKeyId,
        // from your S3_ACCESS_KEY_ID environment variable
        secretAccessKey,
        // from your S3_SECRET_ACCESS_KEY environment variable
        signed: { expiry: 3600 }
        // (optional) links will be signed with an expiry of 3600 seconds (an hour)
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
