import { Router, NextFunction, Request, Response } from "express";
import { mapDiaryEntryFromJson } from "../models/IDiaryEntry";
import { IJsonObject } from "../models/IJsonObject";
import { urlStringToDate } from "../utils/dates";
import { cleanUuid } from "../utils/entities";
import { cleanString } from "../utils/strings";
import {
  deleteDiaryEntry,
  getDiaryEntriesForDate,
  getDiaryEntry,
  saveDiaryEntry,
} from "../managers/diary-entry-manager";

const diaryEntriesRouter = Router();

diaryEntriesRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  const diaryEntryId: string = cleanUuid(req.params.id);
  getDiaryEntry(diaryEntryId)
    .then((diaryEntry) => res.json(diaryEntry))
    .catch(next);
});

diaryEntriesRouter.get("/for-date/:dateStr", (req: Request, res: Response, next: NextFunction) => {
  const date = urlStringToDate(cleanString(req.params.dateStr));
  getDiaryEntriesForDate(date)
    .then((diaryEntries) => res.json(diaryEntries))
    .catch(next);
});

diaryEntriesRouter.post("/edit/:id?", (req: Request, res: Response, next: NextFunction) => {
  const diaryEntryId: string = cleanUuid(req.params.id, null);
  const properties = mapDiaryEntryFromJson(req.body as IJsonObject);

  saveDiaryEntry(diaryEntryId, properties)
    .then((diaryEntry) => res.json(diaryEntry))
    .catch(next);
});

diaryEntriesRouter.post("/delete/:id", (req: Request, res: Response, next: NextFunction) => {
  const diaryEntryId: string = cleanUuid(req.params.id);

  deleteDiaryEntry(diaryEntryId)
    .then(() => res.sendStatus(200))
    .catch(next);
});

export { diaryEntriesRouter };
