import * as Moment from "moment";
import { utcMoment } from "../utils/dates";
import { cleanUuid } from "../utils/entities";
import { cleanString } from "../utils/strings";
import { IBaseModel } from "./IBaseModel";
import { IJsonObject } from "./IJsonObject";
import { IValidationResult } from "./IValidationResult";

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

function mapExerciseEntryFromJson(json?: IJsonObject): IExerciseEntry {
	if (!json) {
		return null;
	}

	return {
		id: cleanUuid(json.id as string),
		deleted: json.deleted as boolean,
		date: json.date ? utcMoment(cleanString(json.date as string)) : null,
		lastEdit: json.lastEdit ? utcMoment(cleanString(json.lastEdit as string)) : null,
		label: cleanString(json.label as string),
		caloriesBurned: parseFloat(json.caloriesBurned as string),
	};
}

function mapExerciseEntryToJson(exerciseEntry?: IExerciseEntry): IJsonObject {
	if (!exerciseEntry) {
		return null;
	}

	return {
		id: exerciseEntry.id,
		deleted: exerciseEntry.deleted,
		date: exerciseEntry.date ? exerciseEntry.date.toISOString() : null,
		lastEdit: exerciseEntry.lastEdit ? exerciseEntry.lastEdit.toISOString() : null,
		label: exerciseEntry.label,
		caloriesBurned: exerciseEntry.caloriesBurned,
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

	if (!exerciseEntry.caloriesBurned && exerciseEntry.caloriesBurned !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				caloriesBurned: "The calories burned must be entered",
			},
		};
	} else if (isNaN(exerciseEntry.caloriesBurned)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				caloriesBurned: "The calories burned must be numeric",
			},
		};
	} else if (exerciseEntry.caloriesBurned <= 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				caloriesBurned: "The calories burned must greater than zero",
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
	mapExerciseEntryFromJson,
	mapExerciseEntryToJson,
	validateExerciseEntry,
	getDefaultExerciseEntry,
};
