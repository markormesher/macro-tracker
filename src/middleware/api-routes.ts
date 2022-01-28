import { Express } from "express";
import { authRouter } from "../controllers/auth-controller";
import { cloneMealRouter } from "../controllers/clone-meal-controller";
import { diaryEntriesRouter } from "../controllers/diary-entry-controller";
import { exerciseEntriesRouter } from "../controllers/exercise-entry-controller";
import { foodItemsRouter } from "../controllers/food-item-controller";
import { macroSummaryRouter } from "../controllers/macro-summary-controller";
import { nutritionixApiRouter } from "../controllers/nutritionix-api-controller";
import { targetsRouter } from "../controllers/targets-controller";
import { tescoApiRouter } from "../controllers/tesco-api-controller";

function setupApiRoutes(app: Express): void {
  app.use("/api/auth", authRouter);
  app.use("/api/clone-meal", cloneMealRouter);
  app.use("/api/diary-entries", diaryEntriesRouter);
  app.use("/api/exercise-entries", exerciseEntriesRouter);
  app.use("/api/food-items", foodItemsRouter);
  app.use("/api/macro-summary", macroSummaryRouter);
  app.use("/api/nutritionix-api", nutritionixApiRouter);
  app.use("/api/targets", targetsRouter);
  app.use("/api/tesco-api", tescoApiRouter);
}

export { setupApiRoutes };
