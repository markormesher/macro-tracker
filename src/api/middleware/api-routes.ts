import { Express } from "express";
import { diaryEntriesRouter } from "../controllers/diary-entry-controller";
import { foodItemRouter } from "../controllers/food-item-controller";

function setupApiRoutes(app: Express): void {
	app.use("/api/diary-entries", diaryEntriesRouter);
	app.use("/api/food-items", foodItemRouter);
}

export {
	setupApiRoutes,
};
