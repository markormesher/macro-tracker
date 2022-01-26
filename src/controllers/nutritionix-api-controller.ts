import { Router, NextFunction, Request, Response } from "express";
import { cleanString } from "../utils/strings";
import {
  getFoodItemsFromNutritionixByUpc,
  getFoodItemSuggestionsFromNutritionixByKeyword,
} from "../managers/nutritionix-api-manager";

const nutritionixApiRouter = Router();

nutritionixApiRouter.get("/search-upc/:upc", (req: Request, res: Response, next: NextFunction) => {
  const upc: string = cleanString(req.params.upc);
  getFoodItemsFromNutritionixByUpc(upc)
    .then((foodItems) => res.json(foodItems))
    .catch(next);
});

nutritionixApiRouter.get("/search-keyword/:keyword", (req: Request, res: Response, next: NextFunction) => {
  const keyword: string = cleanString(req.params.keyword);
  getFoodItemSuggestionsFromNutritionixByKeyword(keyword)
    .then((foodItems) => res.json(foodItems))
    .catch(next);
});

export { nutritionixApiRouter };
