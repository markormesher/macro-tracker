import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import * as Moment from "moment";
import { ITarget } from "../../commons/models/ITarget";
import { cleanUuid } from "../../commons/utils/entities";
import { DbTarget } from "../db/models/DbTarget";
import { getDataForTable } from "../helpers/datatable-helper";
import {
	deleteTarget,
	getAllTargets,
	getTarget,
	getTargetQueryBuilder,
	saveTarget,
} from "../managers/targets-manager";

const targetsRouter = Express.Router();

targetsRouter.get("/table", (req: Request, res: Response, next: NextFunction) => {
	const totalQuery = getTargetQueryBuilder()
			.where("food_item.deleted = FALSE");

	const filteredQuery = getTargetQueryBuilder()
			.where("food_item.deleted = FALSE");

	getDataForTable(DbTarget, req, totalQuery, filteredQuery)
			.then((response) => res.json(response))
			.catch(next);
});

targetsRouter.get("/all", (req: Request, res: Response, next: NextFunction) => {
	getAllTargets()
			.then((targets) => res.json(targets))
			.catch(next);
});

targetsRouter.get("/:targetId", (req: Request, res: Response, next: NextFunction) => {
	const targetId: string = cleanUuid(req.params.targetId);
	getTarget(targetId)
			.then((target) => res.json(target))
			.catch(next);
});

targetsRouter.post("/edit/:targetId?", (req: Request, res: Response, next: NextFunction) => {
	const targetId: string = cleanUuid(req.params.targetId, null);
	const properties: Partial<ITarget> = {
		baselineCaloriesPerDay: req.body.baselineCaloriesPerDay ? parseFloat(req.body.baselineCaloriesPerDay) : 0,
		proportionCarbohydrates: req.body.proportionCarbohydrates ? parseFloat(req.body.proportionCarbohydrates) : 0,
		proportionProtein: req.body.proportionProtein ? parseFloat(req.body.proportionProtein) : 0,
		proportionFat: req.body.proportionFat ? parseFloat(req.body.proportionFat) : 0,
		startDate: Moment(req.body.startDate),
	};

	saveTarget(targetId, properties)
			.then(() => res.sendStatus(200))
			.catch(next);
});

targetsRouter.post("/delete/:targetId", (req: Request, res: Response, next: NextFunction) => {
	const targetId: string = cleanUuid(req.params.targetId);

	deleteTarget(targetId)
			.then(() => res.sendStatus(200))
			.catch(next);
});

export {
	targetsRouter,
};
