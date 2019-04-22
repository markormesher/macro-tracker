import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { Brackets } from "typeorm";
import { FoodMeasurementUnit } from "../../commons/enums";
import { IFoodItem } from "../../commons/models/IFoodItem";
import { cleanUuid } from "../../commons/utils/entities";
import { cleanString } from "../../commons/utils/strings";
import { DbFoodItem } from "../db/models/DbFoodItem";
import { getDataForTable, OrderStatement } from "../helpers/datatable-helper";
import {
	deleteFoodItem,
	getAllFoodItems,
	getFoodItem,
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

foodItemsRouter.get("/:foodItemId", (req: Request, res: Response, next: NextFunction) => {
	const foodItemId: string = cleanUuid(req.params.foodItemId);
	getFoodItem(foodItemId, { includeServingSizes: true })
			.then((foodItem) => res.json(foodItem))
			.catch(next);
});

foodItemsRouter.post("/edit/:foodItemId?", (req: Request, res: Response, next: NextFunction) => {
	const foodItemId: string = cleanUuid(req.params.foodItemId, null);
	const properties: Partial<IFoodItem> = {
		brand: cleanString(req.body.brand),
		name: cleanString(req.body.name),
		measurementUnit: cleanString(req.body.measurementUnit) as FoodMeasurementUnit,
		caloriesPer100: req.body.caloriesPer100 ? parseFloat(req.body.caloriesPer100) : 0,
		carbohydratePer100: req.body.carbohydratePer100 ? parseFloat(req.body.carbohydratePer100) : 0,
		sugarPer100: req.body.sugarPer100 ? parseFloat(req.body.sugarPer100) : 0,
		fatPer100: req.body.fatPer100 ? parseFloat(req.body.fatPer100) : 0,
		satFatPer100: req.body.satFatPer100 ? parseFloat(req.body.satFatPer100) : 0,
		proteinPer100: req.body.proteinPer100 ? parseFloat(req.body.proteinPer100) : 0,
		fibrePer100: req.body.fibrePer100 ? parseFloat(req.body.fibrePer100) : 0,
		saltPer100: req.body.saltPer100 ? parseFloat(req.body.saltPer100) : 0,
		servingSizes: req.body.servingSizes,
	};

	saveFoodItem(foodItemId, properties)
			.then(() => res.sendStatus(200))
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
