import * as Express from "express";
import { Request, Response } from "express";
import * as Passport from "passport";
import { loadUser } from "../middleware/auth-middleware";

const authRouter = Express.Router();

authRouter.get("/google/login", Passport.authenticate("google", {
	scope: ["https://www.googleapis.com/auth/plus.login"],
}));

authRouter.get("/google/callback", Passport.authenticate("google", {
	successRedirect: "/",
	failureRedirect: "/auth/login",
}));

authRouter.get("/current-user", loadUser, (req: Request, res: Response) => {
	res.json(req.user); // may be undefined
});

authRouter.post("/logout", (req: Request, res: Response) => {
	req.logout();
	res.sendStatus(200);
});

export {
	authRouter,
};
