// TODO: fix duplicate Express import

import * as BodyParser from "body-parser";
import * as ConnectRedis from "connect-redis";
// eslint-disable-next-line import/no-duplicates
import * as Express from "express";
// eslint-disable-next-line import/no-duplicates
import { Request, Response } from "express";
import * as ExpressSession from "express-session";
import * as Passport from "passport";
import * as Redis from "redis";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { StatusError } from "../commons/StatusError";
import { ensureLogFilesAreCreated, logger } from "../commons/utils/logging";
import { getSecret } from "./config/config-loader";
import { typeormConf } from "./db/db-config";
import { MigrationRunner } from "./db/migrations/MigrationRunner";
import * as PassportConfig from "./helpers/passport-config";
import { setupApiRoutes } from "./middleware/api-routes";

const app = Express();

// logging
ensureLogFilesAreCreated();

// cookies and sessions
const redisClient = Redis.createClient({
  host: "redis",
  port: 6379,
});
const RedisSessionStore = ConnectRedis(ExpressSession);
app.use(
  ExpressSession({
    store: new RedisSessionStore({ client: redisClient }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24h
    },
    secret: getSecret("session.secret"),
    resave: false,
    rolling: true,
    saveUninitialized: false,
  }),
);

// auth
PassportConfig.init(Passport);
app.use(Passport.initialize());
app.use(Passport.session());

// middleware
app.use(BodyParser.json());

// routes
setupApiRoutes(app);

// error handlers
app.use((error: StatusError, req: Request, res: Response) => {
  const status = error.status || 500;
  const name = error.name || "Internal Server Error";
  const message = error.message || undefined;
  logger.error(`Error: ${name} - ${message}`, error);
  res.status(status).json({ status, name, message });
});

async function initDb(): Promise<void> {
  // DB migrations
  logger.info("Starting DB migrations");
  const migrationRunner = new MigrationRunner(typeormConf);
  await migrationRunner.runMigrations().then(() => logger.info("Migrations finished"));

  // DB connection
  return createConnection(typeormConf).then(() => {
    logger.info("Database connection created successfully");
  });
}

initDb()
  .then(() => {
    // server start!
    const port = 3000;
    const server = app.listen(port, () => {
      logger.info(`API server listening on port ${port}`);
    });
    process.on("SIGTERM", () => server.close(() => process.exit(0)));
  })
  .catch((err) => {
    logger.error("Failed to initialise API server", err);
    throw err;
  });
