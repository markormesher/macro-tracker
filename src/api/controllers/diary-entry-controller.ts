import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { mapDiaryEntryFromJson } from "../../commons/models/IDiaryEntry";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { urlStringToMoment } from "../../commons/utils/dates";
import { cleanUuid } from "../../commons/utils/entities";
import { cleanString } from "../../commons/utils/strings";
import {
	deleteDiaryEntry,
	getDiaryEntriesForDate,
	getDiaryEntry,
	saveDiaryEntry,
} from "../managers/diary-entry-manager";

const diaryEntriesRouter = Express.Router();

diaryEntriesRouter.get("/:diaryEntryId", (req: Request, res: Response, next: NextFunction) => {
	const diaryEntryId: string = cleanUuid(req.params.diaryEntryId);
	getDiaryEntry(diaryEntryId)
			.then((diaryEntry) => res.json(diaryEntry))
			.catch(next);
});

diaryEntriesRouter.get("/for-date/:dateStr", (req: Request, res: Response, next: NextFunction) => {
	const date = urlStringToMoment(cleanString(req.params.dateStr));
	getDiaryEntriesForDate(date)
			.then((diaryEntries) => res.json(diaryEntries))
			.catch(next);
});

diaryEntriesRouter.post("/edit/:diaryEntryId?", (req: Request, res: Response, next: NextFunction) => {
	const diaryEntryId: string = cleanUuid(req.params.diaryEntryId, null);
	const properties = mapDiaryEntryFromJson(req.body as IJsonObject);

	saveDiaryEntry(diaryEntryId, properties)
			.then((diaryEntry) => res.json(diaryEntry))
			.catch(next);
});

diaryEntriesRouter.post("/delete/:diaryEntryId", (req: Request, res: Response, next: NextFunction) => {
	const diaryEntryId: string = cleanUuid(req.params.diaryEntryId);

	deleteDiaryEntry(diaryEntryId)
			.then(() => res.sendStatus(200))
			.catch(next);
});

export {
	diaryEntriesRouter,
};
