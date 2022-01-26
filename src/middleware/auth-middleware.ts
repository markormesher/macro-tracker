import { NextFunction, Request, RequestHandler, Response } from "express";
import { getOrCreateUserWithExternalUsername } from "../managers/user-manager";
import { StatusError } from "../utils/StatusError";

const loadUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const username = req.header("remote-user");
  const name = req.header("remote-name");
  if (!username || !name) {
    throw new StatusError(401);
  }

  getOrCreateUserWithExternalUsername(username, name).then((user) => {
    res.locals.user = user;
    next();
  });
};

export { loadUser };
