import { hasRole } from "../../auth/permissions";
import { Role } from "../Role/constants";

const access = {
  operation: {
    query: ({ session }: any) => true,
    create: ({ session }: any) =>
      hasRole(session, [Role.HOSTER]),
    update: ({ session }: any) =>
      hasRole(session, [Role.HOSTER]),
    delete: ({ session }: any) =>
      hasRole(session, [Role.HOSTER]),
  },
  filter: {
    query: ({ session }: any) => true,
    update: ({ session }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }

      if (hasRole(session, [Role.HOSTER])) {
        return { hostBy: { id: { equals: session.itemId } } };
      }

      return false;
    },
    delete: ({ session }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }

      if (hasRole(session, [Role.HOSTER])) {
        return { hostBy: { id: { equals: session.itemId } } };
      }

      return false;
    },
  },
  item: {
    create: ({ session }: any) =>
      hasRole(session, [Role.HOSTER]),
    update: ({ session }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }

      if (hasRole(session, [Role.HOSTER])) {
        return true; // Allow update, but filter will restrict to own items
      }

      return false;
    },
    delete: ({ session }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }

      if (hasRole(session, [Role.HOSTER])) {
        return true; // Allow delete, but filter will restrict to own items
      }

      return false;
    },
  },
};
export default access;
