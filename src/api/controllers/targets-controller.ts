import * as Express from "express";
import { NextFunction, Request, Response } from "express";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { mapTargetFromJson } from "../../commons/models/ITarget";
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
import { requireUser } from "../middleware/auth-middleware";

const targetsRouter = Express.Router();

targetsRouter.get("/table", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const totalQuery = getTargetQueryBuilder()
			.where("target.deleted = FALSE");

	const filteredQuery = getTargetQueryBuilder()
			.where("target.deleted = FALSE");

	getDataForTable(DbTarget, req, totalQuery, filteredQuery)
			.then((response) => res.json(response))
			.catch(next);
});

targetsRouter.get("/all", requireUser, (req: Request, res: Response, next: NextFunction) => {
	getAllTargets()
			.then((targets) => res.json(targets))
			.catch(next);
});

targetsRouter.get("/:id", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const targetId: string = cleanUuid(req.params.id);
	getTarget(targetId)
			.then((target) => res.json(target))
			.catch(next);
});

targetsRouter.post("/edit/:id?", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const targetId: string = cleanUuid(req.params.id, null);
	const properties = mapTargetFromJson(req.body as IJsonObject);

	saveTarget(targetId, properties)
			.then(() => res.sendStatus(200))
			.catch(next);
});

targetsRouter.post("/delete/:id", requireUser, (req: Request, res: Response, next: NextFunction) => {
	const targetId: string = cleanUuid(req.params.id);

	deleteTarget(targetId)
			.then(() => res.sendStatus(200))
			.catch(next);
});

export {
	targetsRouter,
};
