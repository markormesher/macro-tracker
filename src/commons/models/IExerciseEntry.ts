import * as Moment from "moment";
import { IBaseModel } from "./IBaseModel";
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

	if (!exerciseEntry.label || exerciseEntry.label.trim() === "") {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				label: "A label must be entered",
			},
		};
	}

	if (!exerciseEntry.caloriesBurned || isNaN(exerciseEntry.caloriesBurned) || exerciseEntry.caloriesBurned < 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				caloriesBurned: "The calories burned must be a positive number",
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
