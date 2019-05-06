import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { mapExerciseEntryFromJson } from "../../commons/models/IExerciseEntry";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { urlStringToMoment } from "../../commons/utils/dates";
import { cleanUuid } from "../../commons/utils/entities";
import { cleanString } from "../../commons/utils/strings";
import {
	deleteExerciseEntry,
	getAllExerciseLabels,
	getExerciseEntriesForDate,
	getExerciseEntry,
	saveExerciseEntry,
} from "../managers/exercise-entry-manager";
import { requireUser } from "../middleware/auth-middleware";

const exerciseEntriesRouter = Express.Router();

exerciseEntriesRouter.get("/labels", requireUser, (req: Request, res: Response, next: NextFunction) => {
	getAllExerciseLabels()
			.then((labels) => res.json(labels))
			.catch(next);
});

exerciseEntriesRouter.get("/:id", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const exerciseEntryId: string = cleanUuid(req.params.id);
	getExerciseEntry(exerciseEntryId)
			.then((exerciseEntry) => res.json(exerciseEntry))
			.catch(next);
});

exerciseEntriesRouter.get("/for-date/:dateStr", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const date = urlStringToMoment(cleanString(req.params.dateStr));
	getExerciseEntriesForDate(date)
			.then((exerciseEntries) => res.json(exerciseEntries))
			.catch(next);
});

exerciseEntriesRouter.post("/edit/:id?", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const exerciseEntryId: string = cleanUuid(req.params.id, null);
	const properties = mapExerciseEntryFromJson(req.body as IJsonObject);

	saveExerciseEntry(exerciseEntryId, properties)
			.then((exerciseEntry) => res.json(exerciseEntry ))
			.catch(next);
});

exerciseEntriesRouter.post("/delete/:id", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const exerciseEntryId: string = cleanUuid(req.params.id);

	deleteExerciseEntry(exerciseEntryId)
			.then(() => res.sendStatus(200))
			.catch(next);
});

export {
	exerciseEntriesRouter,
};
