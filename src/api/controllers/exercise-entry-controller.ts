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

const exerciseEntriesRouter = Express.Router();

exerciseEntriesRouter.get("/labels", (req: Request, res: Response, next: NextFunction) => {
	getAllExerciseLabels()
			.then((labels) => res.json(labels))
			.catch(next);
});

exerciseEntriesRouter.get("/:exerciseEntryId", (req: Request, res: Response, next: NextFunction) => {
	const exerciseEntryId: string = cleanUuid(req.params.exerciseEntryId);
	getExerciseEntry(exerciseEntryId)
			.then((exerciseEntry) => res.json(exerciseEntry))
			.catch(next);
});

exerciseEntriesRouter.get("/for-date/:dateStr", (req: Request, res: Response, next: NextFunction) => {
	const date = urlStringToMoment(cleanString(req.params.dateStr));
	getExerciseEntriesForDate(date)
			.then((exerciseEntries) => res.json(exerciseEntries))
			.catch(next);
});

exerciseEntriesRouter.post("/edit/:exerciseEntryId?", (req: Request, res: Response, next: NextFunction) => {
	const exerciseEntryId: string = cleanUuid(req.params.exerciseEntryId, null);
	const properties = mapExerciseEntryFromJson(req.body as IJsonObject);

	saveExerciseEntry(exerciseEntryId, properties)
			.then(() => res.sendStatus(200))
			.catch(next);
});

exerciseEntriesRouter.post("/delete/:exerciseEntryId", (req: Request, res: Response, next: NextFunction) => {
	const exerciseEntryId: string = cleanUuid(req.params.exerciseEntryId);

	deleteExerciseEntry(exerciseEntryId)
			.then(() => res.sendStatus(200))
			.catch(next);
});

export {
	exerciseEntriesRouter,
};
