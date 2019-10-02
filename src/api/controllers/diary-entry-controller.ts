import { Router, NextFunction, Request, Response } from "express";
import { mapDiaryEntryFromJson } from "../../commons/models/IDiaryEntry";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { urlStringToDate } from "../../commons/utils/dates";
import { cleanUuid } from "../../commons/utils/entities";
import { cleanString } from "../../commons/utils/strings";
import {
  deleteDiaryEntry,
  getDiaryEntriesForDate,
  getDiaryEntry,
  saveDiaryEntry,
} from "../managers/diary-entry-manager";
import { requireUser } from "../middleware/auth-middleware";

const diaryEntriesRouter = Router();

diaryEntriesRouter.get("/:id", requireUser, (req: Request, res: Response, next: NextFunction) => {
  const diaryEntryId: string = cleanUuid(req.params.id);
  getDiaryEntry(diaryEntryId)
    .then((diaryEntry) => res.json(diaryEntry))
    .catch(next);
});

diaryEntriesRouter.get("/for-date/:dateStr", requireUser, (req: Request, res: Response, next: NextFunction) => {
  const date = urlStringToDate(cleanString(req.params.dateStr));
  getDiaryEntriesForDate(date)
    .then((diaryEntries) => res.json(diaryEntries))
    .catch(next);
});

diaryEntriesRouter.post("/edit/:id?", requireUser, (req: Request, res: Response, next: NextFunction) => {
  const diaryEntryId: string = cleanUuid(req.params.id, null);
  const properties = mapDiaryEntryFromJson(req.body as IJsonObject);

  saveDiaryEntry(diaryEntryId, properties)
    .then((diaryEntry) => res.json(diaryEntry))
    .catch(next);
});

diaryEntriesRouter.post("/delete/:id", requireUser, (req: Request, res: Response, next: NextFunction) => {
  const diaryEntryId: string = cleanUuid(req.params.id);

  deleteDiaryEntry(diaryEntryId)
    .then(() => res.sendStatus(200))
    .catch(next);
});

export { diaryEntriesRouter };
