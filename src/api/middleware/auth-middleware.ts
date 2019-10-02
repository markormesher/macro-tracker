import { NextFunction, Request, RequestHandler, Response } from "express";
import { IUser } from "../../commons/models/IUser";
import { StatusError } from "../../commons/StatusError";

const loadUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser;
  if (user) {
    res.locals.user = user;
  } else {
    res.locals.user = undefined;
  }
  next();
};

const requireUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    loadUser(req, res, next);
  } else {
    throw new StatusError(401);
  }
};

export { loadUser, requireUser };
