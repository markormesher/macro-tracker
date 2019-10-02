// TODO: fix duplicate Express import

import { resolve } from "path";
import * as Compression from "compression";
// eslint-disable-next-line import/no-duplicates
import * as Express from "express";
// eslint-disable-next-line import/no-duplicates
import { Request, Response, static as expressStatic } from "express";
import * as Webpack from "webpack";
import * as webpackDevMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import { isDev } from "../commons/utils/env";
import { logger } from "../commons/utils/logging";

const app = Express();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpackConfig: Webpack.Configuration = require(resolve(__dirname, "..", "..", "webpack.config.js"));
const compiler = Webpack(webpackConfig);

if (isDev()) {
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      logLevel: "warn",
    }),
  );
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use(Compression());
  app.use("/", expressStatic(__dirname));
}

// all other requests be handled by UI
app.get("*", (req: Request, res: Response) => {
  res.sendFile(resolve(__dirname, "index.html"));
});

// go!
const port = 3001;
const server = app.listen(port, () => logger.info(`Client server listening on port ${port}`));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
