import { SelectQueryBuilder } from "typeorm";
import { cleanUuid } from "../utils/entities";
import { DbUser } from "../db/models/DbUser";
import { logger } from "../utils/logging";

function getUserQueryBuilder(): SelectQueryBuilder<DbUser> {
  return DbUser.createQueryBuilder("user");
}

function getUser(userId: string): Promise<DbUser> {
  return getUserQueryBuilder()
    .where("user.id = :userId")
    .andWhere("user.deleted = FALSE")
    .setParameter("userId", cleanUuid(userId))
    .getOne();
}

async function getOrCreateUserWithExternalUsername(externalUsername: string, displayName?: string): Promise<DbUser> {
  const user = await getUserQueryBuilder()
    .where("user.externalUsername = :externalUsername")
    .andWhere("user.deleted = FALSE")
    .setParameter("externalUsername", externalUsername)
    .getOne();

  if (user) {
    return user;
  }

  logger.info(`Creating new user ${externalUsername}`);
  return DbUser.getRepository()
    .create({
      externalUsername,
      displayName: displayName || externalUsername,
      deleted: false,
    })
    .save();
}

export { getUserQueryBuilder, getUser, getOrCreateUserWithExternalUsername };
