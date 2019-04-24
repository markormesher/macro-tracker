import * as Moment from "moment";
import { Meal } from "../enums";
import { IBaseModel } from "./IBaseModel";
import { IFoodItem, mapFoodItemFromApi } from "./IFoodItem";
import { IServingSize, mapServingSizeFromApi } from "./IServingSize";
import { IValidationResult } from "./validation";

interface IDiaryEntry extends IBaseModel {
	readonly date: Moment.Moment;
	readonly lastEdit: Moment.Moment;
	readonly meal: Meal;
	readonly servingQty: number;

	readonly foodItem: IFoodItem;
	readonly servingSize: IServingSize;
}

interface IDiaryEntryValidationResult extends IValidationResult {
	readonly errors: {
		readonly date?: string;
		readonly meal?: string;
		readonly servingQty?: string;
		readonly foodItem?: string;
		readonly servingSize?: string;
	};
}

function mapDiaryEntryFromApi(diaryEntry?: IDiaryEntry): IDiaryEntry {
	if (!diaryEntry) {
		return diaryEntry;
	}

	return {
		...diaryEntry,
		date: Moment(diaryEntry.date),
		lastEdit: Moment(diaryEntry.lastEdit),
		foodItem: mapFoodItemFromApi(diaryEntry.foodItem),
		servingSize: mapServingSizeFromApi(diaryEntry.servingSize),
	};
}

function validateDiaryEntry(diaryEntry?: Partial<IDiaryEntry>): IDiaryEntryValidationResult {
	if (!diaryEntry) {
		return { isValid: false, errors: {} };
	}

	let result: IDiaryEntryValidationResult = { isValid: true, errors: {} };

	// TODO: actually validate
	if (!diaryEntry.foodItem) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				foodItem: "No food item selected",
			},
		};
	}

	return result;
}

function getDefaultDiaryEntry(): IDiaryEntry {
	return {
		id: undefined,
		deleted: false,

		date: Moment(),
		lastEdit: undefined,
		meal: undefined,
		servingQty: 1,

		foodItem: undefined,
		servingSize: undefined,
	};
}

export {
	IDiaryEntry,
	IDiaryEntryValidationResult,
	mapDiaryEntryFromApi,
	validateDiaryEntry,
	getDefaultDiaryEntry,
};
