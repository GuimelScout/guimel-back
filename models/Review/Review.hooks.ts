
export const reviewHooks = {
  resolveInput: async ({ resolvedData, item, context, operation }:any) => {
    if (operation === "create" && context.session?.itemId) {
      return {
        ...resolvedData,
        createdBy: { connect: { id: context.session.itemId } },
      }
    }

    return resolvedData
  },
};