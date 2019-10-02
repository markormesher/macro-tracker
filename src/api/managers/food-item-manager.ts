import { SelectQueryBuilder } from "typeorm";
import { IFoodItem, validateFoodItem } from "../../commons/models/IFoodItem";
import { validateServingSize } from "../../commons/models/IServingSize";
import { StatusError } from "../../commons/StatusError";
import { logger } from "../../commons/utils/logging";
import { DbFoodItem } from "../db/models/DbFoodItem";
import { saveServingSize } from "./serving-size-manager";

interface IFoodItemQueryBuilderOptions {
  readonly includeServingSizes?: boolean;
}

function getFoodItemQueryBuilder(options: IFoodItemQueryBuilderOptions = {}): SelectQueryBuilder<DbFoodItem> {
  let qb = DbFoodItem.createQueryBuilder("food_item");

  if (options.includeServingSizes) {
    qb = qb.leftJoinAndSelect("food_item.servingSizes", "serving_size");
  }

  return qb;
}

async function getFoodItem(id: string, options: IFoodItemQueryBuilderOptions = {}): Promise<DbFoodItem> {
  return getFoodItemQueryBuilder(options)
    .where("food_item.deleted = FALSE")
    .andWhere("food_item.id = :id")
    .setParameter("id", id)
    .getOne();
}

async function getFoodItemByUpc(upc: string, options: IFoodItemQueryBuilderOptions = {}): Promise<DbFoodItem> {
  return getFoodItemQueryBuilder(options)
    .where("food_item.deleted = FALSE")
    .andWhere(":upc = ANY(food_item.upcs)")
    .setParameter("upc", upc)
    .getOne();
}

async function getFoodItemsByKeyword(
  keyword: string,
  options: IFoodItemQueryBuilderOptions = {},
): Promise<DbFoodItem[]> {
  return getFoodItemQueryBuilder(options)
    .where("food_item.deleted = FALSE")
    .andWhere("food_item.brand % :keyword OR food_item.name % :keyword")
    .setParameter("keyword", keyword)
    .getMany();
}

async function getAllFoodItems(): Promise<DbFoodItem[]> {
  return getFoodItemQueryBuilder({ includeServingSizes: true })
    .where("food_item.deleted = FALSE")
    .getMany();
}

async function saveFoodItem(foodItemId: string, values: IFoodItem): Promise<DbFoodItem> {
  const validationResult = validateFoodItem(values);
  if (!validationResult.isValid) {
    logger.error("Failed to save invalid food item", {
      validationResult,
      values,
    });
    throw new StatusError(400, "The food item was not valid");
  }

  const creatingNewEntity = !foodItemId;
  return getFoodItem(foodItemId, { includeServingSizes: true }).then(async (foodItem) => {
    if (!foodItem && !creatingNewEntity) {
      throw new StatusError(404, "That food item doesn't exist");
    }

    foodItem = DbFoodItem.getRepository().merge(foodItem || new DbFoodItem(), values);
    const savedFoodItem = await foodItem.save();

    // mark invalid serving sizes as deleted
    const inputServingSizes = values.servingSizes || [];
    const servingSizeSaveTasks = inputServingSizes.map((ss) => {
      const isValid = validateServingSize(ss).isValid;
      const updatedSs = {
        ...ss,
        label: ss.label || "",
        measurement: ss.measurement || 0,
        foodItem: savedFoodItem,
        deleted: ss.deleted || !isValid,
      };
      return saveServingSize(updatedSs, true);
    });

    await Promise.all(servingSizeSaveTasks);

    return savedFoodItem;
  });
}

async function deleteFoodItem(foodItemId: string): Promise<void> {
  return getFoodItem(foodItemId)
    .then((foodItem) => {
      if (!foodItem) {
        throw new StatusError(404, "That food item doesn't exist");
      }

      foodItem.deleted = true;
      return foodItem.save();
    })
    .then(() => undefined);
}

export {
  getFoodItemQueryBuilder,
  getFoodItem,
  getFoodItemByUpc,
  getFoodItemsByKeyword,
  getAllFoodItems,
  saveFoodItem,
  deleteFoodItem,
};
