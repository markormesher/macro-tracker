function isProd(): boolean {
  return process.env.NODE_ENV.toLowerCase() === "production";
}

function isDev(): boolean {
  return process.env.NODE_ENV.toLowerCase() === "development";
}

function isTest(): boolean {
  return process.env.NODE_ENV.toLowerCase() === "test";
}

function isPrimaryServer(): boolean {
  return process.env.IS_PRIMARY_SERVER && process.env.IS_PRIMARY_SERVER.toLowerCase() === "yes";
}

function runningInDocker(): boolean {
  return process.env.RUNNING_IN === "docker";
}

export { runningInDocker, isProd, isDev, isTest, isPrimaryServer };
