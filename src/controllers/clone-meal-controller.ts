import { Router, NextFunction, Request, Response } from "express";
import { mapCloneMealRequestFromJson } from "../models/ICloneMealRequest";
import { IJsonObject } from "../models/IJsonObject";
import { cloneMeal } from "../managers/clone-meal-manager";

const cloneMealRouter = Router();

cloneMealRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  const request = mapCloneMealRequestFromJson(req.body as IJsonObject);

  cloneMeal(request)
    .then(() => res.sendStatus(200))
    .catch(next);
});

export { cloneMealRouter };
