import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { urlStringToMoment } from "../../commons/utils/dates";
import { cleanString } from "../../commons/utils/strings";
import { getMacroSummaryForDate } from "../managers/macro-summary-manager";
import { requireUser } from "../middleware/auth-middleware";

const macroSummaryRouter = Express.Router();

macroSummaryRouter.get("/for-date/:dateStr", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const date = urlStringToMoment(cleanString(req.params.dateStr));
	getMacroSummaryForDate(date)
			.then((summary) => res.json(summary))
			.catch(next);
});

export {
	macroSummaryRouter,
};
