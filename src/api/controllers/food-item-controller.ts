import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { Brackets } from "typeorm";
import { mapFoodItemFromJson } from "../../commons/models/IFoodItem";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { cleanUuid } from "../../commons/utils/entities";
import { cleanString } from "../../commons/utils/strings";
import { DbFoodItem } from "../db/models/DbFoodItem";
import { getDataForTable, OrderStatement } from "../helpers/datatable-helper";
import {
	deleteFoodItem,
	getAllFoodItems,
	getFoodItem,
	getFoodItemByUpc,
	getFoodItemQueryBuilder,
	saveFoodItem,
} from "../managers/food-item-manager";

const foodItemsRouter = Express.Router();

foodItemsRouter.get("/table", (req: Request, res: Response, next: NextFunction) => {
	const searchTerm = req.query.searchTerm || "";

	const totalQuery = getFoodItemQueryBuilder()
			.where("food_item.deleted = FALSE");

	const filteredQuery = getFoodItemQueryBuilder()
			.where("food_item.deleted = FALSE")
			.andWhere(new Brackets((qb) => qb.where(
					"food_item.brand ILIKE :searchTerm" +
					" OR food_item.name ILIKE :searchTerm",
			)))
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

foodItemsRouter.get("/:foodItemId", (req: Request, res: Response, next: NextFunction) => {
	const foodItemId: string = cleanUuid(req.params.foodItemId);
	getFoodItem(foodItemId, { includeServingSizes: true })
			.then((foodItem) => res.json(foodItem))
			.catch(next);
});

foodItemsRouter.post("/edit/:foodItemId?", (req: Request, res: Response, next: NextFunction) => {
	const foodItemId: string = cleanUuid(req.params.foodItemId, null);
	const properties = mapFoodItemFromJson(req.body as IJsonObject);

	saveFoodItem(foodItemId, properties)
			.then((foodItem) => res.json(foodItem))
			.catch(next);
});

foodItemsRouter.post("/delete/:foodItemId", (req: Request, res: Response, next: NextFunction) => {
	const foodItemId: string = cleanUuid(req.params.foodItemId);

	deleteFoodItem(foodItemId)
			.then(() => res.sendStatus(200))
			.catch(next);
});

export {
	foodItemsRouter,
};
