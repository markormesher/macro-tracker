import { Request } from "express";
import { PassportStatic as Passport } from "passport";
import { IOAuth2StrategyOptionWithRequest, OAuth2Strategy, Profile } from "passport-google-oauth";
import { IUser } from "../../commons/models/IUser";
import { StatusError } from "../../commons/StatusError";
import { getConstants, getSecret } from "../config/config-loader";
import { getUser, getUserWithGoogleProfile } from "../managers/user-manager";

function init(passport: Passport): void {
	const googleConfig: IOAuth2StrategyOptionWithRequest = {
		clientID: getSecret("google.client.id"),
		clientSecret: getSecret("google.client.secret"),
		callbackURL: getConstants().host + "/api/auth/google/callback",
		userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
		passReqToCallback: true,
	};

	passport.serializeUser((user: IUser, callback) => {
		callback(null, user.id);
	});

	passport.deserializeUser((userId: string, callback: (error: any, user?: IUser) => void) => {
		if (!userId) {
			return callback(null, null);
		}

		getUser(userId)
				.then((user) => {
					if (!user) {
						throw new StatusError(401, "Could not find user");
					} else {
						callback(null, user);
					}
				})
				.catch(callback);
	});

	passport.use(new OAuth2Strategy(googleConfig, (
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			callback: (error: any, user?: any) => void,
	) => {
		getUserWithGoogleProfile(profile)
				.then((user) => callback(null, user))
				.catch(callback);
	}));
}

export {
	init,
};
