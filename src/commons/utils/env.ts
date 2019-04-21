function isProd(): boolean {
	return process.env.NODE_ENV.toLowerCase() === "production";
}

function isDev(): boolean {
	return process.env.NODE_ENV.toLowerCase() === "development";
}

function isTest(): boolean {
	return process.env.NODE_ENV.toLowerCase() === "test";
}

function runningInDocker(): boolean {
	return process.env.RUNNING_IN === "docker";
}

export {
	runningInDocker,
	isTest,
	isDev,
	isProd,
};
