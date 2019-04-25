import * as Moment from "moment";
import { Meal } from "../enums";
import { IBaseModel } from "./IBaseModel";
import { IFoodItem, mapFoodItemFromApi } from "./IFoodItem";
import { IServingSize, mapServingSizeFromApi } from "./IServingSize";
import { IValidationResult } from "./IValidationResult";

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

	const now = Moment();
	if (!diaryEntry.date) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				date: "A date must be selected",
			},
		};
	} else if (diaryEntry.date.isAfter(now, "day")) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				date: "The date must not be in the future",
			},
		};
	}

	if (!diaryEntry.meal) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				meal: "A meal must be selected",
			},
		};
	}

	if (!diaryEntry.servingQty && diaryEntry.servingQty !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				servingQty: "The serving quantity must be entered",
			},
		};
	} else if (isNaN(diaryEntry.servingQty)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				servingQty: "The serving quantity must be numeric",
			},
		};
	} else if (diaryEntry.servingQty <= 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				servingQty: "The serving quantity must greater than zero",
			},
		};
	}

	if (!diaryEntry.foodItem) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				foodItem: "A food item must be selected",
			},
		};
	}

	// note: serving size can be null

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
