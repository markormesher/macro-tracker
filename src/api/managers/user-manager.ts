import { Profile } from "passport-google-oauth";
import { SelectQueryBuilder } from "typeorm";
import { cleanUuid } from "../../commons/utils/entities";
import { DbUser } from "../db/models/DbUser";

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

function getUserWithGoogleProfile(googleProfile: Profile): Promise<DbUser> {
	const googleId = googleProfile.id;
	return getUserQueryBuilder()
			.where("user.googleId = :googleId")
			.andWhere("user.deleted = FALSE")
			.setParameter("googleId", googleId)
			.getOne();
}

export {
	getUserQueryBuilder,
	getUser,
	getUserWithGoogleProfile,
};
