import { Express } from "express";
import { diaryEntriesRouter } from "../controllers/diary-entry-controller";
import { foodItemsRouter } from "../controllers/food-item-controller";
import { targetsRouter } from "../controllers/targets-controller";

function setupApiRoutes(app: Express): void {
	app.use("/api/diary-entries", diaryEntriesRouter);
	app.use("/api/food-items", foodItemsRouter);
	app.use("/api/targets", targetsRouter);
}

export {
	setupApiRoutes,
};
