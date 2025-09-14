import { BaseListTypeInfo, ListAccessControl } from "@keystone-6/core/types";
import { hasRole } from "../../auth/permissions";
import { Role } from "./constants";

const access: ListAccessControl<BaseListTypeInfo> = {
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
    update: ({ session }: any) =>
      hasRole(session, [Role.HOSTER, Role.USER]),
    delete: ({ session }: any) =>
      hasRole(session, [Role.HOSTER, Role.USER]),
  },
};

export default access;
