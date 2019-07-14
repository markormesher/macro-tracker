import * as Moment from "moment";
import { utcMoment } from "../utils/dates";
import { cleanUuid } from "../utils/entities";
import { cleanString } from "../utils/strings";
import { IBaseModel } from "./IBaseModel";
import { IJsonObject } from "./IJsonObject";
import { IValidationResult } from "./IValidationResult";

enum TargetMode {
	PERCENTAGE_OF_CALORIES = "PERCENTAGE_OF_CALORIES",
	PER_KG_OF_BODY_WEIGHT = "PER_KG_OF_BODY_WEIGHT",
	REMAINDER_OF_CALORIES = "REMAINDER_OF_CALORIES",
}

interface ITarget extends IBaseModel {
	readonly startDate: Moment.Moment;
	readonly bodyWeightKg: number;
	readonly maintenanceCalories: number;
	readonly calorieAdjustment: number;

	readonly carbohydratesTargetMode: TargetMode;
	readonly carbohydratesTargetValue: number;

	readonly proteinTargetMode: TargetMode;
	readonly proteinTargetValue: number;

	readonly fatTargetMode: TargetMode;
	readonly fatTargetValue: number;
}

interface ITargetValidationResult extends IValidationResult {
	readonly errors: {
		readonly startDate?: string;
		readonly bodyWeightKg?: string;
		readonly maintenanceCalories?: string;
		readonly calorieAdjustment?: string;
		readonly proportionCarbohydrates?: string;
		readonly proportionProtein?: string;
		readonly proportionFat?: string;
	};
}

function mapTargetFromJson(json?: IJsonObject): ITarget {
	if (!json) {
		return null;
	}

	return {
		id: cleanUuid(json.id as string),
		deleted: json.deleted as boolean,
		startDate: json.startDate ? utcMoment(cleanString(json.startDate as string)) : null,
		bodyWeightKg: parseFloat(json.bodyWeightKg as string),
		maintenanceCalories: parseFloat(json.maintenanceCalories as string),
		calorieAdjustment: parseFloat(json.calorieAdjustment as string),

		carbohydratesTargetMode: cleanString(json.carbohydratesTargetMode as string) as TargetMode,
		carbohydratesTargetValue: parseFloat(json.carbohydratesTargetValue as string),

		proteinTargetMode: cleanString(json.proteinTargetMode as string) as TargetMode,
		proteinTargetValue: parseFloat(json.proteinTargetValue as string),

		fatTargetMode: cleanString(json.fatTargetMode as string) as TargetMode,
		fatTargetValue: parseFloat(json.fatTargetValue as string),
	};
}

function mapTargetToJson(target?: ITarget): IJsonObject {
	if (!target) {
		return null;
	}

	return {
		id: target.id,
		deleted: target.deleted,
		startDate: target.startDate ? target.startDate.toISOString() : null,
		bodyWeightKg: target.bodyWeightKg,
		maintenanceCalories: target.maintenanceCalories,
		calorieAdjustment: target.calorieAdjustment,
		carbohydratesTargetMode: target.carbohydratesTargetMode,
		carbohydratesTargetValue: target.carbohydratesTargetValue,
		proteinTargetMode: target.proteinTargetMode,
		proteinTargetValue: target.proteinTargetValue,
		fatTargetMode: target.fatTargetMode,
		fatTargetValue: target.fatTargetValue,
	};
}

function validateTarget(target: Partial<ITarget>): ITargetValidationResult {
	if (!target) {
		return { isValid: false, errors: {} };
	}

	let result: ITargetValidationResult = { isValid: true, errors: {} };

	if (!target.startDate) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				startDate: "A start date must be selected",
			},
		};
	}

	if (!target.bodyWeightKg && target.bodyWeightKg !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				bodyWeightKg: "The body weight must be entered",
			},
		};
	} else if (isNaN(target.bodyWeightKg)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				bodyWeightKg: "The body weight must be numeric",
			},
		};
	} else if (target.bodyWeightKg <= 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				bodyWeightKg: "The body weight must greater than zero",
			},
		};
	}

	if (!target.maintenanceCalories && target.maintenanceCalories !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				maintenanceCalories: "The maintenance calories must be entered",
			},
		};
	} else if (isNaN(target.maintenanceCalories)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				maintenanceCalories: "The maintenance calories must be numeric",
			},
		};
	} else if (target.maintenanceCalories <= 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				maintenanceCalories: "The maintenance calories must greater than zero",
			},
		};
	}

	if (!target.calorieAdjustment && target.calorieAdjustment !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				calorieAdjustment: "The calorie adjustment must be entered",
			},
		};
	} else if (isNaN(target.calorieAdjustment)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				calorieAdjustment: "The calorie adjustment must be numeric",
			},
		};
	} else if (target.calorieAdjustment <= 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				calorieAdjustment: "The calorie adjustment must greater than zero",
			},
		};
	}

	if (!target.carbohydratesTargetValue && target.carbohydratesTargetValue !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionCarbohydrates: "The carbohydrates target value must be entered",
			},
		};
	} else if (isNaN(target.carbohydratesTargetValue)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionCarbohydrates: "The carbohydrates target value must be numeric",
			},
		};
	} else if (target.carbohydratesTargetValue < 0 || target.carbohydratesTargetValue > 1) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionCarbohydrates: "The carbohydrates target value must be between zero and one",
			},
		};
	}

	if (!target.fatTargetValue && target.fatTargetValue !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionFat: "The fat target value must be entered",
			},
		};
	} else if (isNaN(target.fatTargetValue)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionFat: "The fat target value must be numeric",
			},
		};
	} else if (target.fatTargetValue < 0 || target.fatTargetValue > 1) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionFat: "The fat target value must be between zero and one",
			},
		};
	}

	if (!target.proteinTargetValue && target.proteinTargetValue !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionProtein: "The protein target value must be entered",
			},
		};
	} else if (isNaN(target.proteinTargetValue)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionProtein: "The protein target value must be numeric",
			},
		};
	} else if (target.proteinTargetValue < 0 || target.proteinTargetValue > 1) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionProtein: "The protein target value must be between zero and one",
			},
		};
	}

	if (target.carbohydratesTargetValue + target.fatTargetValue + target.proteinTargetValue !== 1) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionCarbohydrates: "The proportions must add up to one",
				proportionFat: "The proportions must add up to one",
				proportionProtein: "The proportions must add up to one",
			},
		};
	}

	return result;
}

function getDefaultTarget(): ITarget {
	return {
		id: undefined,
		deleted: false,
		startDate: utcMoment().startOf("day"),
		bodyWeightKg: 0,
		maintenanceCalories: 0,
		calorieAdjustment: 1,

		carbohydratesTargetMode: TargetMode.PERCENTAGE_OF_CALORIES,
		carbohydratesTargetValue: 0.4,

		proteinTargetMode: TargetMode.PERCENTAGE_OF_CALORIES,
		proteinTargetValue: 0.3,

		fatTargetMode: TargetMode.PERCENTAGE_OF_CALORIES,
		fatTargetValue: 0.3,
	};
}

export {
	TargetMode,
	ITarget,
	ITargetValidationResult,
	mapTargetFromJson,
	mapTargetToJson,
	validateTarget,
	getDefaultTarget,
};
