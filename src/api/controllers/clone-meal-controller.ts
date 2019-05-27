import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { mapCloneMealRequestFromJson } from "../../commons/models/ICloneMealRequest";
import { mapDiaryEntryFromJson } from "../../commons/models/IDiaryEntry";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { urlStringToMoment } from "../../commons/utils/dates";
import { cleanUuid } from "../../commons/utils/entities";
import { cleanString } from "../../commons/utils/strings";
import { cloneMeal } from "../managers/clone-meal-manager";
import {
	deleteDiaryEntry,
	getDiaryEntriesForDate,
	getDiaryEntry,
	saveDiaryEntry,
} from "../managers/diary-entry-manager";
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
