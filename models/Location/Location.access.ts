import { hasRole } from "../../auth/permissions";
import { Role } from "../Role/constants";

const access = {
  operation: {
    query: ({ session }: any) => true,
    create: ({ session }: any) =>
      hasRole(session, []),
    update: ({ session }: any) =>
      hasRole(session, []),
    delete: ({ session }: any) =>
      hasRole(session, []),
  },
  filter: {
    query: ({ session }: any) => true,
    update: ({ session }: any)=>
      hasRole(session, []),
    delete: ({ session }: any)=>
      hasRole(session, []),
  },
  item: {
    create: ({ session }: any) =>
      hasRole(session, []),
    update: ({ session }: any) =>
      hasRole(session, []),
    delete: ({ session }: any) =>
      hasRole(session, []),
  },
};
export default access;
