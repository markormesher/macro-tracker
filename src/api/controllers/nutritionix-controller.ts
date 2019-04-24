import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { cleanString } from "../../commons/utils/strings";
import { getFoodItemsFromNutritionixByUpc } from "../managers/nutritionix-manager";

const nutritionixRouter = Express.Router();

nutritionixRouter.get("/search-upc/:upc", (req: Request, res: Response, next: NextFunction) => {
	const upc: string = cleanString(req.params.upc);
	getFoodItemsFromNutritionixByUpc(upc)
			.then((foodItems) => res.json(foodItems))
			.catch(next);
});

export {
	nutritionixRouter,
};
