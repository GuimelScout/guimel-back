import { genUniqueLink } from "../../utils/helpers/unike_link";

export const linkHooks = {
  resolveInput: async ({ resolvedData, item, context }: any) => {
    if (item) {
      return item.link;
    }

    let baseLink = genUniqueLink(`${resolvedData.name.toLowerCase()}`);

    let uniqueLink : string = baseLink;

    let existingUser = await context.db.Lodging.findOne({
      where: { link: uniqueLink },
    });

    let counter = 1;
    while (existingUser) {
      uniqueLink = `${baseLink}-${counter}`;
      existingUser = await context.db.Lodging.findOne({
        where: { link: uniqueLink },
      });
      counter++;
    }

    return uniqueLink;
  },
};