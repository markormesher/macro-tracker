import { NextFunction, Request, RequestHandler, Response } from "express";
import { getOrCreateUserWithExternalUsername } from "../managers/user-manager";
import { logger } from "../utils/logging";
import { StatusError } from "../utils/StatusError";

const loadUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const username = req.header("remote-user");
  const name = req.header("remote-name");
  if (!username || !name) {
    logger.error("Username or name was missing from request", { headers: req.headers });
    throw new StatusError(401);
  }

  getOrCreateUserWithExternalUsername(username, name).then((user) => {
    res.locals.user = user;
    next();
  });
};

export { loadUser };
