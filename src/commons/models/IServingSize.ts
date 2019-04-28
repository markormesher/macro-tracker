import { cleanUuid, safeMapEntities } from "../utils/entities";
import { cleanString } from "../utils/strings";
import { IBaseModel } from "./IBaseModel";
import { IDiaryEntry, mapDiaryEntryFromJson } from "./IDiaryEntry";
import { IFoodItem, mapFoodItemFromJson, mapFoodItemToJson } from "./IFoodItem";
import { IJsonArray } from "./IJsonArray";
import { IJsonObject } from "./IJsonObject";
import { IValidationResult } from "./IValidationResult";

interface IServingSize extends IBaseModel {
	readonly label: string;
	readonly measurement: number;

	readonly foodItem: IFoodItem;
	readonly diaryEntries: IDiaryEntry[];
}

interface IServingSizeValidationResult extends IValidationResult {
	readonly errors: {
		readonly label?: string;
		readonly measurement?: string;
	};
}

function mapServingSizeFromJson(json?: IJsonObject): IServingSize {
	if (!json) {
		return null;
	}

	return {
		id: cleanUuid(json.id as string),
		deleted: json.deleted as boolean,
		label: cleanString(json.label as string),
		measurement: parseFloat(json.measurement as string),
		foodItem: mapFoodItemFromJson(json.foodItem as IJsonObject),
		diaryEntries: safeMapEntities(mapDiaryEntryFromJson, json.diaryEntries as IJsonArray),
	};
}

function mapServingSizeToJson(servingSize?: IServingSize): IJsonObject {
	if (!servingSize) {
		return null;
	}

	return {
		id: servingSize.id,
		deleted: servingSize.deleted,
		label: servingSize.label,
		measurement: servingSize.measurement,
		foodItem: mapFoodItemToJson(servingSize.foodItem),
	};
}

function validateServingSize(servingSize?: Partial<IServingSize>): IServingSizeValidationResult {
	if (!servingSize) {
		return { isValid: false, errors: {} };
	}

	let result: IServingSizeValidationResult = { isValid: true, errors: {} };

	if (servingSize.deleted) {
		return result;
	}

	if (!servingSize.label || servingSize.label.trim() === "") {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				label: "A label must be entered",
			},
		};
	}

	if (!servingSize.measurement && servingSize.measurement !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				measurement: "The measurement must be entered",
			},
		};
	} else if (isNaN(servingSize.measurement)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				measurement: "The measurement must be numeric",
			},
		};
	} else if (servingSize.measurement <= 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				measurement: "The measurement must greater than zero",
			},
		};
	}

	return result;
}

function getDefaultServingSize(newId?: string): IServingSize {
	return {
		id: newId,
		deleted: false,
		label: undefined,
		measurement: undefined,
		foodItem: undefined,
		diaryEntries: undefined,
	};
}

function servingSizeComparator(a: IServingSize, b: IServingSize): number {
	if (!a && !b) {
		return 0;
	} else if (!a) {
		return -1;
	} else if (!b) {
		return 1;
	} else {
		return a.label.localeCompare(b.label);
	}
}

export {
	IServingSize,
	IServingSizeValidationResult,
	mapServingSizeFromJson,
	mapServingSizeToJson,
	validateServingSize,
	getDefaultServingSize,
	servingSizeComparator,
};
