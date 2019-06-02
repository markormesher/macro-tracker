import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { cleanString } from "../../commons/utils/strings";
import { getFoodItemsFromNutritionixByUpc } from "../managers/nutritionix-api-manager";
import { getFoodItemsFromTescoByUpc } from "../managers/tesco-api-manager";
import { requireUser } from "../middleware/auth-middleware";

const tescoApiRouter = Express.Router();

tescoApiRouter.get("/search-upc/:upc", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const upc: string = cleanString(req.params.upc);
	getFoodItemsFromTescoByUpc(upc)
			.then((foodItems) => res.json(foodItems))
			.catch(next);
});

export {
	tescoApiRouter,
};
