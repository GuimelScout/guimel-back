import "./env";
import lists from "./models/schema";
import { config } from "@keystone-6/core";
import { session, withAuth } from "./auth/auth";
import extendGraphqlSchema from "./graphql/extendedSchema";


// Setup environment variables
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), "config", ".env.dev") });

if (process.env.NODE_ENV !== "test" && !process.env.IS_BUILDING) {
  // if (
  //   !process.env.S3_BUCKET_NAME ||
  //   !process.env.S3_REGION ||
  //   !process.env.S3_ACCESS_KEY_ID ||
  //   !process.env.S3_SECRET_ACCESS_KEY
  // ) {
  //   throw new Error("S3 Configs are not set");
  // }

  if (!process.env.ALLOW_ORIGINS) {
    throw new Error("Allow Origins are not set");
  }
}

export default withAuth(
  config({
    db: {
      provider: "postgresql",
      url: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.POSTGRES_DB}`,
    },
    server: {
      cors: true,
      maxFileSize: 200 * 1024 * 1024,
    },
    storage: {
      local_images: {
        kind: "local",
        type: "image",
        generateUrl: (path) =>
          `http://${process.env.PGHOST}:3001/images${path}`,
        serverRoute: {
          path: "/images",
        },
        storagePath: "public/images",
      },
    },
    graphql:{
      extendGraphqlSchema,
      path: '/api/graphql',
    },
    lists,
    session,
    
  })
);
