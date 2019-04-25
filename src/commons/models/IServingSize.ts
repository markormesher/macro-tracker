import { IBaseModel } from "./IBaseModel";
import { IDiaryEntry } from "./IDiaryEntry";
import { IFoodItem, mapFoodItemFromApi } from "./IFoodItem";
import { IValidationResult } from "./IValidationResult";

interface IServingSize extends IBaseModel {
	readonly label: string;
	readonly measurement: number;

	readonly foodItem: IFoodItem;
	readonly diaryEntries: IDiaryEntry[];
}

interface IServingSizeValidationResult extends IValidationResult {
	readonly errors: {
		readonly label?: string;
		readonly measurement?: string;
	};
}

function mapServingSizeFromApi(servingSize?: IServingSize): IServingSize {
	if (!servingSize) {
		return servingSize;
	}

	return {
		...servingSize,
		foodItem: mapFoodItemFromApi(servingSize.foodItem),
	};
}

function validateServingSize(servingSize?: Partial<IServingSize>): IServingSizeValidationResult {
	if (!servingSize) {
		return { isValid: false, errors: {} };
	}

	let result: IServingSizeValidationResult = { isValid: true, errors: {} };

	if (!servingSize.label || servingSize.label.trim() === "") {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				label: "A label must be entered",
			},
		};
	}

	if (!servingSize.measurement && servingSize.measurement !== 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				measurement: "The measurement must be entered",
			},
		};
	} else if (isNaN(servingSize.measurement)) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				measurement: "The measurement must be numeric",
			},
		};
	} else if (servingSize.measurement <= 0) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				measurement: "The measurement must greater than zero",
			},
		};
	}

	return result;
}

function getDefaultServingSize(newId?: string): IServingSize {
	return {
		id: newId,
		deleted: false,
		label: undefined,
		measurement: undefined,
		foodItem: undefined,
		diaryEntries: undefined,
	};
}

function servingSizeComparator(a: IServingSize, b: IServingSize): number {
	if (!a && !b) {
		return 0;
	} else if (!a) {
		return -1;
	} else if (!b) {
		return 1;
	} else {
		return a.label.localeCompare(b.label);
	}
}

export {
	IServingSize,
	IServingSizeValidationResult,
	mapServingSizeFromApi,
	validateServingSize,
	getDefaultServingSize,
	servingSizeComparator,
};
