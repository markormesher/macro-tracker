import { IDiaryEntry } from "../models/IDiaryEntry";
import { IFoodItem } from "../models/IFoodItem";

function getTotalDiaryEntryMeasurement(diaryEntry: IDiaryEntry): number {
	if (diaryEntry.foodItem.measurementUnit === "single_serving" || !diaryEntry.servingSize) {
		return diaryEntry.servingQty;
	} else {
		return diaryEntry.servingQty * diaryEntry.servingSize.measurement;
	}
}

function getNutritionBaseAmount(foodItem: IFoodItem): number {
	if (foodItem.measurementUnit === "single_serving") {
		return 1;
	} else {
		return 100;
	}
}

export {
	getTotalDiaryEntryMeasurement,
	getNutritionBaseAmount,
};
