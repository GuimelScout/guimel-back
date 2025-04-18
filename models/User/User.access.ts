import { hasRole } from "../../auth/permissions";
import { Role } from "../Role/constants";

const access = {
  operation: {
    query: ({ session }: any) => true,
    create: ({ session }: any) => true,
    update: ({ session }: any) => true,
    delete: ({ session }: any) => true,
  },
  filter: {
    query: ({ session }: any) => true,
    update: ({ session }: any) => true,
    delete: ({ session }: any) => true,
  },
  item: {
    create: ({ session }: any) => true,
    update: ({ session }: any) => true,
    delete: ({ session }: any) => true,
  },
};

export default access;
