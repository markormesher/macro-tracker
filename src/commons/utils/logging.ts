import { format } from "logform";
import * as Winston from "winston";
import { isDev, isTest } from "./env";

const consoleLogFormat = format.combine(
		format.colorize({
			colors: {
				error: "red",
				warning: "yellow",
				warn: "yellow",
				info: "green",
				verbose: "cyan",
				debug: "magenta",
				silly: "white",
			},
		}),
		format.padLevels(),
		format.timestamp(),
		format.simple(),
);

const fileLogFormat = format.combine(
		format.timestamp(),
		format.json(),
);

const logger = Winston.createLogger({
	format: fileLogFormat,
	transports: [
		new Winston.transports.File({ filename: "logs/error.log", level: "error" }),
		new Winston.transports.File({ filename: "logs/all.log", level: "silly" }),
	],
});

/* istanbul ignore else: tests never run in prod mode */
if (isDev() || isTest()) {
	logger.add(new Winston.transports.Console({
		format: consoleLogFormat,
		level: "silly",
	}));
}

export {
	logger,
};
