import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { cleanString } from "../../commons/utils/strings";
import { getFoodItemsFromNutritionixByUpc } from "../managers/nutritionix-api-manager";
import { requireUser } from "../middleware/auth-middleware";

const nutritionixApiRouter = Express.Router();

nutritionixApiRouter.get("/search-upc/:upc", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const upc: string = cleanString(req.params.upc);
	getFoodItemsFromNutritionixByUpc(upc)
			.then((foodItems) => res.json(foodItems))
			.catch(next);
});

export {
	nutritionixApiRouter,
};
