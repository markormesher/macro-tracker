import * as fs from "fs";

function isDev(): boolean {
  return process.env.NODE_ENV.toLowerCase() === "development";
}

function runningInDocker(): boolean {
  return fs.existsSync("/.dockerenv");
}

export { runningInDocker, isDev };
