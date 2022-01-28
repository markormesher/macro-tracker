import { Router, NextFunction, Request, Response } from "express";
import { mapExerciseEntryFromJson } from "../models/IExerciseEntry";
import { IJsonObject } from "../models/IJsonObject";
import { urlStringToDate } from "../utils/dates";
import { cleanUuid } from "../utils/entities";
import { cleanString } from "../utils/strings";
import {
  deleteExerciseEntry,
  getAllExerciseLabels,
  getExerciseEntriesForDate,
  getExerciseEntry,
  saveExerciseEntry,
} from "../managers/exercise-entry-manager";

const exerciseEntriesRouter = Router();

exerciseEntriesRouter.get("/labels", (req: Request, res: Response, next: NextFunction) => {
  getAllExerciseLabels()
    .then((labels) => res.json(labels))
    .catch(next);
});

exerciseEntriesRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  const exerciseEntryId: string = cleanUuid(req.params.id);
  getExerciseEntry(exerciseEntryId)
    .then((exerciseEntry) => res.json(exerciseEntry))
    .catch(next);
});

exerciseEntriesRouter.get("/for-date/:dateStr", (req: Request, res: Response, next: NextFunction) => {
  const date = urlStringToDate(cleanString(req.params.dateStr));
  getExerciseEntriesForDate(date)
    .then((exerciseEntries) => res.json(exerciseEntries))
    .catch(next);
});

exerciseEntriesRouter.post("/edit/:id?", (req: Request, res: Response, next: NextFunction) => {
  const exerciseEntryId: string = cleanUuid(req.params.id, null);
  const properties = mapExerciseEntryFromJson(req.body as IJsonObject);

  saveExerciseEntry(exerciseEntryId, properties)
    .then((exerciseEntry) => res.json(exerciseEntry))
    .catch(next);
});

exerciseEntriesRouter.post("/delete/:id", (req: Request, res: Response, next: NextFunction) => {
  const exerciseEntryId: string = cleanUuid(req.params.id);

  deleteExerciseEntry(exerciseEntryId)
    .then(() => res.sendStatus(200))
    .catch(next);
});

export { exerciseEntriesRouter };
