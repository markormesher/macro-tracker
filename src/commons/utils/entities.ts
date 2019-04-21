import { StatusError } from "../StatusError";

const NULL_UUID = "00000000-0000-0000-0000-000000000000";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapEntitiesFromApi<T>(mapper: (entity: T) => T, entities?: T[]): T[] {
	if (!entities && entities !== []) {
		return undefined;
	} else {
		return entities.map(mapper);
	}
}

function cleanUuid(uuid: string, defaultValue: string = NULL_UUID): string {
	if (!uuid || uuid.trim() === "") {
		return defaultValue;
	}

	if (uuid === NULL_UUID) {
		return uuid;
	}

	if (!UUID_REGEX.test(uuid)) {
		throw new StatusError(400, `UUID was not valid: ${uuid}`);
	} else {
		return uuid;
	}
}

export {
	NULL_UUID,
	mapEntitiesFromApi,
	cleanUuid,
};
