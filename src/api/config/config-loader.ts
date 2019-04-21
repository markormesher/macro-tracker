import { readFileSync } from "fs";
import { resolve } from "path";
import { isProd, runningInDocker } from "../../commons/utils/env";

export class Constants {
	public env: string;
	public host: string;
}

let loadedConstants: Constants;
let loadedSecrets: { readonly [key: string]: string } = {};

const configDir = resolve(__dirname);

function clearConstantsCache(): void {
	loadedConstants = undefined;
}

function getConstants(): Constants {
	if (!loadedConstants) {
		let configFile: string;
		if (isProd()) {
			configFile = `${configDir}/constants.prod.json`;
		} else {
			configFile = `${configDir}/constants.dev.json`;
		}
		loadedConstants = JSON.parse(readFileSync(configFile).toString().trim()) as Constants;
	}
	return loadedConstants;
}

function clearSecretsCache(): void {
	loadedSecrets = {};
}

function getSecret(key: string): string {
	if (loadedSecrets[key] === undefined) {
		if (runningInDocker()) {
			loadedSecrets = {
				...loadedSecrets,
				[key]: readFileSync(`/run/secrets/${key}`).toString().trim(),
			};
		} else {
			loadedSecrets = {
				...loadedSecrets,
				[key]: readFileSync(`${configDir}/secrets/${key}`).toString().trim(),
			};
		}
	}
	return loadedSecrets[key];
}

export {
	clearConstantsCache,
	getConstants,
	clearSecretsCache,
	getSecret,
};
