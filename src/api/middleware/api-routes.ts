import { Express } from "express";
import { authRouter } from "../controllers/auth-controller";
import { diaryEntriesRouter } from "../controllers/diary-entry-controller";
import { exerciseEntriesRouter } from "../controllers/exercise-entry-controller";
import { foodItemsRouter } from "../controllers/food-item-controller";
import { macroSummaryRouter } from "../controllers/macro-summary-controller";
import { nutritionixRouter } from "../controllers/nutritionix-controller";
import { targetsRouter } from "../controllers/targets-controller";

function setupApiRoutes(app: Express): void {
	app.use("/api/auth", authRouter);
	app.use("/api/diary-entries", diaryEntriesRouter);
	app.use("/api/exercise-entries", exerciseEntriesRouter);
	app.use("/api/food-items", foodItemsRouter);
	app.use("/api/macro-summary", macroSummaryRouter);
	app.use("/api/nutritionix", nutritionixRouter);
	app.use("/api/targets", targetsRouter);
}

export {
	setupApiRoutes,
};
