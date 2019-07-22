import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { mapCloneMealRequestFromJson } from "../../commons/models/ICloneMealRequest";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { cloneMeal } from "../managers/clone-meal-manager";
import { requireUser } from "../middleware/auth-middleware";

const cloneMealRouter = Express.Router();

cloneMealRouter.post("/", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const request = mapCloneMealRequestFromJson(req.body as IJsonObject);

	cloneMeal(request)
			.then(() => res.sendStatus(200))
			.catch(next);
});

export {
	cloneMealRouter,
};
