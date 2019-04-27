import { FoodMeasurementUnit } from "../enums";
import { cleanUuid, safeMapEntities } from "../utils/entities";
import { cleanString } from "../utils/strings";
import { IBaseModel } from "./IBaseModel";
import { IDiaryEntry, mapDiaryEntryFromJson, mapDiaryEntryToJson } from "./IDiaryEntry";
import { IJsonArray } from "./IJsonArray";
import { IJsonObject } from "./IJsonObject";
import { IServingSize, mapServingSizeFromJson, mapServingSizeToJson } from "./IServingSize";
import { IValidationResult } from "./IValidationResult";

interface IFoodItem extends IBaseModel {
	readonly brand: string;
	readonly name: string;
	readonly upc: string;
	readonly measurementUnit: FoodMeasurementUnit;
	readonly caloriesPer100: number;
	readonly fatPer100: number;
	readonly satFatPer100: number;
	readonly carbohydratePer100: number;
	readonly sugarPer100: number;
	readonly fibrePer100: number;
	readonly proteinPer100: number;
	readonly saltPer100: number;

	readonly servingSizes: IServingSize[];
	readonly diaryEntries: IDiaryEntry[];
}

interface IFoodItemValidationResult extends IValidationResult {
	readonly errors: IFoodItemValidationResultErrors;
}

// pulled into its own interface to help with validation type safety
interface IFoodItemValidationResultErrors {
	readonly brand?: string;
	readonly name?: string;
	readonly upc?: string;
	readonly measurementUnit?: string;
	readonly caloriesPer100?: string;
	readonly fatPer100?: string;
	readonly satFatPer100?: string;
	readonly carbohydratePer100?: string;
	readonly sugarPer100?: string;
	readonly fibrePer100?: string;
	readonly proteinPer100?: string;
	readonly saltPer100?: string;
}

function mapFoodItemFromJson(json?: IJsonObject): IFoodItem {
	if (!json) {
		return null;
	}

	return {
		id: cleanUuid(json.id as string),
		deleted: json.deleted as boolean,
		brand: cleanString(json.brand as string),
		name: cleanString(json.name as string),
		upc: cleanString(json.upc as string),
		measurementUnit: cleanString(json.measurementUnit as string) as FoodMeasurementUnit,
		caloriesPer100: parseFloat(json.caloriesPer100 as string),
		fatPer100: parseFloat(json.fatPer100 as string),
		satFatPer100: parseFloat(json.satFatPer100 as string),
		carbohydratePer100: parseFloat(json.carbohydratePer100 as string),
		sugarPer100: parseFloat(json.sugarPer100 as string),
		fibrePer100: parseFloat(json.fibrePer100 as string),
		proteinPer100: parseFloat(json.proteinPer100 as string),
		saltPer100: parseFloat(json.saltPer100 as string),
		servingSizes: safeMapEntities(mapServingSizeFromJson, json.servingSizes as IJsonArray),
		diaryEntries: safeMapEntities(mapDiaryEntryFromJson, json.diaryEntries as IJsonArray),
	};
}

function mapFoodItemToJson(foodItem?: IFoodItem): IJsonObject {
	if (!foodItem) {
		return null;
	}

	return {
		id: foodItem.id,
		deleted: foodItem.deleted,
		brand: foodItem.brand,
		name: foodItem.name,
		upc: foodItem.upc,
		measurementUnit: foodItem.measurementUnit,
		caloriesPer100: foodItem.caloriesPer100,
		fatPer100: foodItem.fatPer100,
		satFatPer100: foodItem.satFatPer100,
		carbohydratePer100: foodItem.carbohydratePer100,
		sugarPer100: foodItem.sugarPer100,
		fibrePer100: foodItem.fibrePer100,
		proteinPer100: foodItem.proteinPer100,
		saltPer100: foodItem.saltPer100,
		servingSizes: safeMapEntities(mapServingSizeToJson, foodItem.servingSizes),
		diaryEntries: safeMapEntities(mapDiaryEntryToJson, foodItem.diaryEntries),
	};
}

function validateFoodItem(foodItem?: Partial<IFoodItem>): IFoodItemValidationResult {
	if (!foodItem) {
		return { isValid: false, errors: {} };
	}

	let result: IFoodItemValidationResult = { isValid: true, errors: {} };

	if (!foodItem.brand || foodItem.brand.trim() === "") {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				brand: "A brand must be entered",
			},
		};
	}

	if (!foodItem.name || foodItem.name.trim() === "") {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				name: "A name must be entered",
			},
		};
	}

	if (foodItem.upc && !(/[0-9]+/).test(foodItem.upc)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				upc: "The UPC must contain numbers only",
			},
		};
	}

	if (!foodItem.measurementUnit) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				measurementUnit: "A measurement unit must be entered",
			},
		};
	}

	const nutritionProperties: Array<[string, keyof IFoodItem & keyof IFoodItemValidationResultErrors]> = [
		["calories", "caloriesPer100"],
		["fat", "fatPer100"],
		["sat. fat", "satFatPer100"],
		["carbohydrates", "carbohydratePer100"],
		["sugar", "sugarPer100"],
		["fibre", "fibrePer100"],
		["protein", "proteinPer100"],
		["salt", "saltPer100"],
	];

	nutritionProperties.forEach((property) => {
		const propertyValue = foodItem[property[1]] as number;

		if (isNaN(propertyValue) || propertyValue === null) {
			result = {
				isValid: false,
				errors: {
					...result.errors,
					[property[1]]: `The ${property[0]} must be a valid number`,
				},
			};
		} else if (propertyValue < 0) {
			result = {
				isValid: false,
				errors: {
					...result.errors,
					[property[1]]: `The ${property[0]} must be greater than or equal to zero`,
				},
			};
		}
	});

	return result;
}

function getDefaultFoodItem(): IFoodItem {
	return {
		id: undefined,
		deleted: false,

		brand: null,
		name: null,
		upc: null,
		measurementUnit: "g",
		caloriesPer100: 0,
		fatPer100: 0,
		satFatPer100: 0,
		carbohydratePer100: 0,
		sugarPer100: 0,
		fibrePer100: 0,
		proteinPer100: 0,
		saltPer100: 0,

		servingSizes: [],
		diaryEntries: [],
	};
}

function foodItemComparator(a: IFoodItem, b: IFoodItem): number {
	if (!a && !b) {
		return 0;
	} else if (!a) {
		return -1;
	} else if (!b) {
		return 1;
	} else {
		const nameCompare = a.name.localeCompare(b.name);
		if (nameCompare === 0) {
			return a.brand.localeCompare(b.brand);
		} else {
			return nameCompare;
		}
	}
}

export {
	IFoodItem,
	IFoodItemValidationResult,
	mapFoodItemFromJson,
	mapFoodItemToJson,
	validateFoodItem,
	getDefaultFoodItem,
	foodItemComparator,
};
