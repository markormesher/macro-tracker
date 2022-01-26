import { Router, NextFunction, Request, Response } from "express";
import { IJsonObject } from "../models/IJsonObject";
import { mapTargetFromJson } from "../models/ITarget";
import { cleanUuid } from "../utils/entities";
import { DbTarget } from "../db/models/DbTarget";
import { getDataForTable } from "../helpers/datatable-helper";
import { deleteTarget, getAllTargets, getTarget, getTargetQueryBuilder, saveTarget } from "../managers/targets-manager";

const targetsRouter = Router();

targetsRouter.get("/table", (req: Request, res: Response, next: NextFunction) => {
  const totalQuery = getTargetQueryBuilder().where("target.deleted = FALSE");

  const filteredQuery = getTargetQueryBuilder().where("target.deleted = FALSE");

  getDataForTable(DbTarget, req, totalQuery, filteredQuery)
    .then((response) => res.json(response))
    .catch(next);
});

targetsRouter.get("/all", (req: Request, res: Response, next: NextFunction) => {
  getAllTargets()
    .then((targets) => res.json(targets))
    .catch(next);
});

targetsRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  const targetId: string = cleanUuid(req.params.id);
  getTarget(targetId)
    .then((target) => res.json(target))
    .catch(next);
});

targetsRouter.post("/edit/:id?", (req: Request, res: Response, next: NextFunction) => {
  const targetId: string = cleanUuid(req.params.id, null);
  const properties = mapTargetFromJson(req.body as IJsonObject);

  saveTarget(targetId, properties)
    .then(() => res.sendStatus(200))
    .catch(next);
});

targetsRouter.post("/delete/:id", (req: Request, res: Response, next: NextFunction) => {
  const targetId: string = cleanUuid(req.params.id);

  deleteTarget(targetId)
    .then(() => res.sendStatus(200))
    .catch(next);
});

export { targetsRouter };
