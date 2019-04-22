import * as Moment from "moment";
import { Meal } from "../enums";
import { IBaseModel } from "./IBaseModel";
import { IFoodItem, mapFoodItemFromApi } from "./IFoodItem";
import { IServingSize, mapServingSizeFromApi } from "./IServingSize";
import { IValidationResult } from "./validation";

interface IExerciseEntry extends IBaseModel {
	readonly date: Moment.Moment;
	readonly lastEdit: Moment.Moment;
	readonly label: string;
	readonly caloriesBurned: number;
}

interface IExerciseEntryValidationResult extends IValidationResult {
	readonly errors: {
		readonly date?: string;
		readonly label?: string;
		readonly caloriesBurned?: string;
	};
}

function mapExerciseEntryFromApi(exerciseEntry?: IExerciseEntry): IExerciseEntry {
	if (!exerciseEntry) {
		return exerciseEntry;
	}

	return {
		...exerciseEntry,
		date: Moment(exerciseEntry.date),
		lastEdit: Moment(exerciseEntry.lastEdit),
	};
}

function validateExerciseEntry(exerciseEntry?: Partial<IExerciseEntry>): IExerciseEntryValidationResult {
	if (!exerciseEntry) {
		return { isValid: false, errors: {} };
	}

	let result: IExerciseEntryValidationResult = { isValid: true, errors: {} };

	// TODO: actually validate
	if (!exerciseEntry.label) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				label: "Invalid label",
			},
		};
	}

	return result;
}

function getDefaultExerciseEntry(): IExerciseEntry {
	return {
		id: undefined,
		deleted: false,

		date: undefined,
		lastEdit: undefined,
		label: undefined,
		caloriesBurned: undefined,
	};
}

export {
	IExerciseEntry,
	IExerciseEntryValidationResult,
	mapExerciseEntryFromApi,
	validateExerciseEntry,
	getDefaultExerciseEntry,
};
