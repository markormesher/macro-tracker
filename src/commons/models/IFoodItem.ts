import { FoodMeasurementUnit } from "../enums";
import { mapEntitiesFromApi } from "../utils/entities";
import { IBaseModel } from "./IBaseModel";
import { IDiaryEntry } from "./IDiaryEntry";
import { IServingSize, mapServingSizeFromApi } from "./IServingSize";
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

function mapFoodItemFromApi(foodItem?: IFoodItem): IFoodItem {
	if (!foodItem) {
		return foodItem;
	}

	return {
		...foodItem,
		servingSizes: mapEntitiesFromApi(mapServingSizeFromApi, foodItem.servingSizes),
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
		const brandCompare = a.brand.localeCompare(b.brand);
		if (brandCompare === 0) {
			return a.name.localeCompare(b.name);
		} else {
			return brandCompare;
		}
	}
}

export {
	IFoodItem,
	IFoodItemValidationResult,
	mapFoodItemFromApi,
	validateFoodItem,
	getDefaultFoodItem,
	foodItemComparator,
};
