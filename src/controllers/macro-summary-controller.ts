import { Router, NextFunction, Request, Response } from "express";
import { urlStringToDate } from "../utils/dates";
import { cleanString } from "../utils/strings";
import { getMacroSummaryForDate } from "../managers/macro-summary-manager";

const macroSummaryRouter = Router();

macroSummaryRouter.get("/for-date/:dateStr", (req: Request, res: Response, next: NextFunction) => {
  const date = urlStringToDate(cleanString(req.params.dateStr));
  getMacroSummaryForDate(date)
    .then((summary) => res.json(summary))
    .catch(next);
});

export { macroSummaryRouter };
