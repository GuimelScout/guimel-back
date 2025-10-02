import { BaseListTypeInfo, ListAccessControl } from "@keystone-6/core/types";
import { hasRole } from "../../auth/permissions";
import { Role } from "../Role/constants";

const access: ListAccessControl<BaseListTypeInfo> = {
  operation: {
    query: ({ session }: any) => hasRole(session, [Role.ADMIN]),
    create: ({ session }: any) => true,
    update: ({ session }: any) => hasRole(session, [Role.ADMIN])  ,
    delete: ({ session }: any) => hasRole(session, [Role.ADMIN]),
  },
  filter: {
    query: ({ session }: any) => hasRole(session, [Role.ADMIN]),
    update: ({ session }: any) => hasRole(session, [Role.ADMIN]),
    delete: ({ session }: any) => hasRole(session, [Role.ADMIN]),
  },
  item: {
    create: ({ session }: any) => true,
    update: ({ session, item }: any) => hasRole(session, [Role.ADMIN]),
    delete: ({ session, item }: any) => hasRole(session, [Role.ADMIN]),
  },
};

export default access;
