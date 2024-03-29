import { SelectQueryBuilder } from "typeorm";
import { ITarget, validateTarget } from "../models/ITarget";
import { StatusError } from "../utils/StatusError";
import { DateTransformer } from "../db/DateTransformer";
import { DbTarget } from "../db/models/DbTarget";

function getTargetQueryBuilder(): SelectQueryBuilder<DbTarget> {
  return DbTarget.createQueryBuilder("target");
}

async function getTarget(id: string): Promise<DbTarget> {
  return getTargetQueryBuilder()
    .where("target.deleted = FALSE")
    .andWhere("target.id = :id")
    .setParameter("id", id)
    .getOne();
}

async function getTargetForDate(date: Date): Promise<DbTarget> {
  return getTargetQueryBuilder()
    .where("target.deleted = FALSE")
    .andWhere("target.startDate <= :date")
    .setParameter("date", DateTransformer.toDbFormat(date))
    .orderBy("target.startDate", "DESC")
    .getOne();
}

async function getAllTargets(): Promise<DbTarget[]> {
  return getTargetQueryBuilder().where("target.deleted = FALSE").getMany();
}

async function saveTarget(targetId: string, values: ITarget): Promise<DbTarget> {
  if (!validateTarget(values).isValid) {
    throw new StatusError(400, "The target was not valid");
  }

  const creatingNewEntity = !targetId;
  return getTarget(targetId).then((target) => {
    if (!target && !creatingNewEntity) {
      throw new StatusError(404, "That target doesn't exist");
    }

    target = DbTarget.getRepository().merge(target || new DbTarget(), values);
    return target.save();
  });
}

async function deleteTarget(targetId: string): Promise<void> {
  return getTarget(targetId)
    .then((target) => {
      if (!target) {
        throw new StatusError(404, "That target doesn't exist");
      }

      target.deleted = true;
      return target.save();
    })
    .then(() => undefined);
}

export { getTargetQueryBuilder, getTarget, getTargetForDate, getAllTargets, saveTarget, deleteTarget };
