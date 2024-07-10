import { EntityTarget, FindManyOptions, ObjectLiteral } from "typeorm";
import { AppDataSource } from "..";

export const getObject = <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  id: number
): Promise<T | null> => {
  const options: any = {
    where: [{ id: id }],
  };
  return AppDataSource.manager
    .find(entity, options)
    .then((obj) => (obj.length > 0 ? obj[0] : null))
    .catch((error) => {
      console.error("Error finding wallet:", error);
      return null;
    });
};

export const getObjects = <T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  options?: FindManyOptions<T> | undefined
): Promise<T[] | null> => {
  return AppDataSource.manager.find(entity, options);
};
