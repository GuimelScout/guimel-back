import { hasRole } from "../../auth/permissions";
import { Role } from "../Role/constants";

const access = {
  operation: {
    query: ({ session }: any) => true,
    create: ({ session }: any) => true,
    update: ({ session }: any) =>
      hasRole(session, [Role.HOSTER, Role.USER]),
    delete: ({ session }: any) =>
      hasRole(session, [Role.HOSTER, Role.USER]),
  },
  filter: {
    query: ({ session }: any) => true,
    update: ({ session }: any) =>
      hasRole(session, [Role.HOSTER, Role.USER]),
    delete: ({ session }: any) =>
      hasRole(session, [Role.HOSTER, Role.USER]),
  },
  item: {
    create: ({ session }: any) => true,
    update: ({ session, item }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }

      if (hasRole(session, [Role.HOSTER, Role.USER])) {
        return session?.itemId === item?.id;
      }

      return false;
    },
    delete: ({ session, item }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }

      if (hasRole(session, [Role.HOSTER, Role.USER])) {
        return session?.itemId === item?.id;
      }

      return false;
    },
  },
};

export default access;
