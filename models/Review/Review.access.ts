import { BaseListTypeInfo, ListAccessControl } from "@keystone-6/core/types";
import { hasRole } from "../../auth/permissions";
import { Role } from "../Role/constants";

const access: ListAccessControl<BaseListTypeInfo> = {
  operation: {
    query: ({ session }: any) => true,
    create: ({ session }: any) => true,
    update: ({ session }: any) => !!session,
    delete: ({ session }: any) => !!session,
  },
  filter: {
    query: ({ session }: any) => true,
    update: ({ session }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }
      if (hasRole(session, [Role.USER, Role.HOSTER])) {
        return {
          user: { id: { equals: session?.itemId } }
        };
      }
      return false;
    },
    delete: ({ session }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }
      if (hasRole(session, [Role.USER, Role.HOSTER])) {
        return {
          user: { id: { equals: session?.itemId } }
        };
      }
      return false;
    },
  },
  item: {
    create: ({ session }: any) => true,
    update: ({ session, item }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }
      if (hasRole(session, [Role.USER, Role.HOSTER])) {
        return item.user === session?.itemId;
      }
      return false;
    },
    delete: ({ session, item }: any) => {
      if (hasRole(session, [Role.ADMIN])) {
        return true;
      }
      if (hasRole(session, [Role.USER, Role.HOSTER])) {
        return item.user === session?.itemId;
      }
      return false;
    },
  },
};

export default access;
