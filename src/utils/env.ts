function isDev(): boolean {
  return process.env.NODE_ENV.toLowerCase() === "development";
}

export { isDev };
