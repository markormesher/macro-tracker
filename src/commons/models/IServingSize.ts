import { IBaseModel } from "./IBaseModel";
import { IDiaryEntry } from "./IDiaryEntry";
import { IFoodItem, mapFoodItemFromApi } from "./IFoodItem";
import { IValidationResult } from "./validation";

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

	// TODO: actually validate
	if (!servingSize.label) {
		result = {
			isValid: false,
			errors: {
				...result.errors,
				label: "No label entered",
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
