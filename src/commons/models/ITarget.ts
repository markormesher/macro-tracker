import * as Moment from "moment";
import { NULL_UUID } from "../utils/entities";
import { IBaseModel } from "./IBaseModel";
import { IValidationResult } from "./IValidationResult";

interface ITarget extends IBaseModel {
	readonly baselineCaloriesPerDay: number;
	readonly proportionCarbohydrates: number;
	readonly proportionProtein: number;
	readonly proportionFat: number;
	readonly startDate: Moment.Moment;
}

interface ITargetValidationResult extends IValidationResult {
	readonly errors: {
		readonly baselineCaloriesPerDay?: string;
		readonly proportionCarbohydrates?: string;
		readonly proportionProtein?: string;
		readonly proportionFat?: string;
		readonly startDate?: string;
	};
}

function mapTargetFromApi(target?: ITarget): ITarget {
	if (!target) {
		return target;
	}

	return {
		...target,
		startDate: Moment(target.startDate),
	};
}

function validateTarget(target: Partial<ITarget>): ITargetValidationResult {
	if (!target) {
		return { isValid: false, errors: {} };
	}

	let result: ITargetValidationResult = { isValid: true, errors: {} };

	if (!target.baselineCaloriesPerDay && target.baselineCaloriesPerDay !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				baselineCaloriesPerDay: "The baseline calories must be entered",
			},
		};
	} else if (isNaN(target.baselineCaloriesPerDay)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				baselineCaloriesPerDay: "The baseline calories must be numeric",
			},
		};
	} else if (target.baselineCaloriesPerDay <= 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				baselineCaloriesPerDay: "The baseline calories must greater than zero",
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
		baselineCaloriesPerDay: 0,
		proportionCarbohydrates: 0.4,
		proportionProtein: 0.3,
		proportionFat: 0.3,
		startDate: undefined,
	};
}

// TODO: replace with DB-stored, editable target
function getStaticTarget(): ITarget {
	return {
		id: NULL_UUID,
		deleted: null,
		baselineCaloriesPerDay: 2800,
		proportionCarbohydrates: 0.4,
		proportionProtein: 0.4,
		proportionFat: 0.2,
		startDate: Moment("2019-04-20"),
	};
}

export {
	ITarget,
	ITargetValidationResult,
	mapTargetFromApi,
	validateTarget,
	getDefaultTarget,
	getStaticTarget,
};
