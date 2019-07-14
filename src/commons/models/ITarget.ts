import * as Moment from "moment";
import { utcMoment } from "../utils/dates";
import { cleanUuid } from "../utils/entities";
import { cleanString } from "../utils/strings";
import { IBaseModel } from "./IBaseModel";
import { IJsonObject } from "./IJsonObject";
import { IValidationResult } from "./IValidationResult";

interface ITarget extends IBaseModel {
	readonly maintenanceCalories: number;
	readonly calorieAdjustment: number;
	readonly proportionCarbohydrates: number;
	readonly proportionProtein: number;
	readonly proportionFat: number;
	readonly startDate: Moment.Moment;
}

interface ITargetValidationResult extends IValidationResult {
	readonly errors: {
		readonly maintenanceCalories?: string;
		readonly calorieAdjustment?: string;
		readonly proportionCarbohydrates?: string;
		readonly proportionProtein?: string;
		readonly proportionFat?: string;
		readonly startDate?: string;
	};
}

function mapTargetFromJson(json?: IJsonObject): ITarget {
	if (!json) {
		return null;
	}

	return {
		id: cleanUuid(json.id as string),
		deleted: json.deleted as boolean,
		maintenanceCalories: parseFloat(json.maintenanceCalories as string),
		calorieAdjustment: parseFloat(json.calorieAdjustment as string),
		proportionCarbohydrates: parseFloat(json.proportionCarbohydrates as string),
		proportionFat: parseFloat(json.proportionFat as string),
		proportionProtein: parseFloat(json.proportionProtein as string),
		startDate: json.startDate ? utcMoment(cleanString(json.startDate as string)) : null,
	};
}

function mapTargetToJson(target?: ITarget): IJsonObject {
	if (!target) {
		return null;
	}

	return {
		id: target.id,
		deleted: target.deleted,
		maintenanceCalories: target.maintenanceCalories,
		calorieAdjustment: target.calorieAdjustment,
		proportionCarbohydrates: target.proportionCarbohydrates,
		proportionFat: target.proportionFat,
		proportionProtein: target.proportionProtein,
		startDate: target.startDate ? target.startDate.toISOString() : null,
	};
}

function validateTarget(target: Partial<ITarget>): ITargetValidationResult {
	if (!target) {
		return { isValid: false, errors: {} };
	}

	let result: ITargetValidationResult = { isValid: true, errors: {} };

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

	if (!target.proportionCarbohydrates && target.proportionCarbohydrates !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionCarbohydrates: "The proportion of carbohydrates must be entered",
			},
		};
	} else if (isNaN(target.proportionCarbohydrates)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionCarbohydrates: "The proportion of carbohydrates must be numeric",
			},
		};
	} else if (target.proportionCarbohydrates < 0 || target.proportionCarbohydrates > 1) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionCarbohydrates: "The proportion of carbohydrates must be between zero and one",
			},
		};
	}

	if (!target.proportionFat && target.proportionFat !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionFat: "The proportion of fat must be entered",
			},
		};
	} else if (isNaN(target.proportionFat)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionFat: "The proportion of fat must be numeric",
			},
		};
	} else if (target.proportionFat < 0 || target.proportionFat > 1) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionFat: "The proportion of fat must be between zero and one",
			},
		};
	}

	if (!target.proportionProtein && target.proportionProtein !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionProtein: "The proportion of protein must be entered",
			},
		};
	} else if (isNaN(target.proportionProtein)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionProtein: "The proportion of protein must be numeric",
			},
		};
	} else if (target.proportionProtein < 0 || target.proportionProtein > 1) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				proportionProtein: "The proportion of protein must be between zero and one",
			},
		};
	}

	if (target.proportionCarbohydrates + target.proportionFat + target.proportionProtein !== 1) {
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

	if (!target.startDate) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				startDate: "A start date must be selected",
			},
		};
	}

	return result;
}

function getDefaultTarget(): ITarget {
	return {
		id: undefined,
		deleted: false,
		maintenanceCalories: 0,
		calorieAdjustment: 1,
		proportionCarbohydrates: 0.4,
		proportionProtein: 0.3,
		proportionFat: 0.3,
		startDate: utcMoment().startOf("day"),
	};
}

export {
	ITarget,
	ITargetValidationResult,
	mapTargetFromJson,
	mapTargetToJson,
	validateTarget,
	getDefaultTarget,
};
