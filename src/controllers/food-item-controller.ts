import { Router, NextFunction, Request, Response } from "express";
import { Brackets, WhereExpression } from "typeorm";
import { mapFoodItemFromJson } from "../models/IFoodItem";
import { IJsonObject } from "../models/IJsonObject";
import { cleanUuid } from "../utils/entities";
import { cleanString } from "../utils/strings";
import { DbFoodItem } from "../db/models/DbFoodItem";
import { getDataForTable, OrderStatement } from "../helpers/datatable-helper";
import {
  deleteFoodItem,
  getAllFoodItems,
  getFoodItem,
  getFoodItemByUpc,
  getFoodItemQueryBuilder,
  getFoodItemsByKeyword,
  saveFoodItem,
} from "../managers/food-item-manager";

const foodItemsRouter = Router();

foodItemsRouter.get("/table", (req: Request, res: Response, next: NextFunction) => {
  const searchTerm = req.query.searchTerm || "";

  const totalQuery = getFoodItemQueryBuilder().where("food_item.deleted = FALSE");

  const filteredQuery = getFoodItemQueryBuilder({ includeServingSizes: true })
    .where("food_item.deleted = FALSE")
    .andWhere(
      new Brackets(
        (qb): WhereExpression => qb.where("food_item.brand ILIKE :searchTerm OR food_item.name ILIKE :searchTerm"),
      ),
    )
    .setParameters({
      searchTerm: `%${searchTerm}%`,
    });

  const postOrder: OrderStatement = [["food_item.brand", "ASC"]];

  getDataForTable(DbFoodItem, req, totalQuery, filteredQuery, [], postOrder)
    .then((response) => res.json(response))
    .catch(next);
});

foodItemsRouter.get("/all", (req: Request, res: Response, next: NextFunction) => {
  getAllFoodItems()
    .then((foodItems) => res.json(foodItems))
    .catch(next);
});

foodItemsRouter.get("/by-upc/:upc", (req: Request, res: Response, next: NextFunction) => {
  const upc: string = cleanString(req.params.upc);
  getFoodItemByUpc(upc, { includeServingSizes: true })
    .then((foodItem) => res.json(foodItem))
    .catch(next);
});

foodItemsRouter.get("/by-keyword/:keyword", (req: Request, res: Response, next: NextFunction) => {
  const keyword: string = cleanString(req.params.keyword);
  getFoodItemsByKeyword(keyword, { includeServingSizes: true })
    .then((foodItems) => res.json(foodItems))
    .catch(next);
});

foodItemsRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  const foodItemId: string = cleanUuid(req.params.id);
  getFoodItem(foodItemId, { includeServingSizes: true })
    .then((foodItem) => res.json(foodItem))
    .catch(next);
});

foodItemsRouter.post("/edit/:id?", (req: Request, res: Response, next: NextFunction) => {
  const foodItemId: string = cleanUuid(req.params.id, null);
  const properties = mapFoodItemFromJson(req.body as IJsonObject);

  saveFoodItem(foodItemId, properties)
    .then((foodItem) => res.json(foodItem))
    .catch(next);
});

foodItemsRouter.post("/delete/:id", (req: Request, res: Response, next: NextFunction) => {
  const foodItemId: string = cleanUuid(req.params.id);

  deleteFoodItem(foodItemId)
    .then(() => res.sendStatus(200))
    .catch(next);
});

export { foodItemsRouter };
