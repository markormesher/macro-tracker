import * as Moment from "moment";
import { NULL_UUID } from "../utils/entities";
import { IBaseModel } from "./IBaseModel";
import { IValidationResult } from "./validation";

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

	// TODO: actually validate
	if (isNaN(target.baselineCaloriesPerDay) || target.baselineCaloriesPerDay < 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				baselineCaloriesPerDay: "Invalid calorie target",
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
