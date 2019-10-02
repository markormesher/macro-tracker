import { Router, NextFunction, Request, Response } from "express";
import { cleanString } from "../../commons/utils/strings";
import { getFoodItemsFromTescoByUpc } from "../managers/tesco-api-manager";
import { requireUser } from "../middleware/auth-middleware";

const tescoApiRouter = Router();

tescoApiRouter.get("/search-upc/:upc", requireUser, (req: Request, res: Response, next: NextFunction) => {
  const upc: string = cleanString(req.params.upc);
  getFoodItemsFromTescoByUpc(upc)
    .then((foodItems) => res.json(foodItems))
    .catch(next);
});

export { tescoApiRouter };
