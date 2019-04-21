import { FoodMeasurementUnit } from "../enums";
import { mapEntitiesFromApi } from "../utils/entities";
import { IBaseModel } from "./IBaseModel";
import { IDiaryEntry } from "./IDiaryEntry";
import { IServingSize, mapServingSizeFromApi } from "./IServingSize";
import { IValidationResult } from "./validation";

interface IFoodItem extends IBaseModel {
	readonly brand: string;
	readonly name: string;
	readonly measurementUnit: FoodMeasurementUnit;
	readonly caloriesPer100: number;
	readonly carbohydratePer100: number;
	readonly sugarPer100: number;
	readonly fatPer100: number;
	readonly satFatPer100: number;
	readonly proteinPer100: number;
	readonly fibrePer100: number;
	readonly saltPer100: number;

	readonly servingSizes: IServingSize[];
	readonly diaryEntries: IDiaryEntry[];
}

interface IFoodItemValidationResult extends IValidationResult {
	readonly errors: {
		readonly brand?: string;
		readonly name?: string;
		readonly measurementUnit?: string;
		readonly caloriesPer100?: string;
		readonly carbohydratePer100?: string;
		readonly sugarPer100?: string;
		readonly fatPer100?: string;
		readonly satFatPer100?: string;
		readonly proteinPer100?: string;
		readonly fibrePer100?: string;
		readonly saltPer100?: string;
	};
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

	// TODO: actually validate
	if (!foodItem.name) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				name: "Invalid name",
			},
		};
	}

	return result;
}

function getDefaultFoodItem(): IFoodItem {
	return {
		id: undefined,
		deleted: false,

		brand: "",
		name: "",
		measurementUnit: "g",
		caloriesPer100: 0,
		carbohydratePer100: 0,
		sugarPer100: 0,
		fatPer100: 0,
		satFatPer100: 0,
		proteinPer100: 0,
		fibrePer100: 0,
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
