import { Router, Request, Response } from "express";

const authRouter = Router();

authRouter.get("/current-user", (req: Request, res: Response) => {
  res.json(res.locals.user);
});

export { authRouter };
