import { CALORIES_PER_G_CARBOHYDRATES, CALORIES_PER_G_FAT, CALORIES_PER_G_PROTEIN } from "../constants";
import { getNutritionBaseAmount, getTotalDiaryEntryMeasurement } from "../utils/helpers";
import { IDiaryEntry } from "./IDiaryEntry";
import { IExerciseEntry } from "./IExerciseEntry";
import { IJsonObject } from "./IJsonObject";
import { ITarget } from "./ITarget";

interface IMacroSummary {
	readonly totalCalories: number;
	readonly targetCalories: number;
	readonly totalCarbohydrates: number;
	readonly targetCarbohydrates: number;
	readonly totalFat: number;
	readonly targetFat: number;
	readonly totalProtein: number;
	readonly targetProtein: number;
}

function mapMacroSummaryFromJson(json?: IJsonObject): IMacroSummary {
	if (!json) {
		return null;
	}

	return {
		totalCalories: parseFloat(json.totalCalories as string),
		targetCalories: parseFloat(json.targetCalories as string),
		totalCarbohydrates: parseFloat(json.totalCarbohydrates as string),
		targetCarbohydrates: parseFloat(json.targetCarbohydrates as string),
		totalFat: parseFloat(json.totalFat as string),
		targetFat: parseFloat(json.targetFat as string),
		totalProtein: parseFloat(json.totalProtein as string),
		targetProtein: parseFloat(json.targetProtein as string),
	};
}

function generateMacroSummary(
		diaryEntries: IDiaryEntry[],
		exerciseEntries: IExerciseEntry[],
		target: ITarget,
): IMacroSummary {

	const totalCaloriesBurned = exerciseEntries.map((ee) => ee.caloriesBurned).reduce((a, b) => a + b, 0);
	const targetCalories = (target.maintenanceCalories * target.calorieAdjustment) + totalCaloriesBurned;
	const targetCarbohydrates = targetCalories * target.carbohydratesTargetValue / CALORIES_PER_G_CARBOHYDRATES;
	const targetFat = targetCalories * target.fatTargetValue / CALORIES_PER_G_FAT;
	const targetProtein = targetCalories * target.proteinTargetValue / CALORIES_PER_G_PROTEIN;

	// reduce each entry to an array of macros
	const nutritionAmounts = diaryEntries
			.map((e) => {
				const totalMeasurement = getTotalDiaryEntryMeasurement(e);
				const baseAmount = getNutritionBaseAmount(e.foodItem);

				return [
					e.foodItem.caloriesPerBaseAmount * totalMeasurement / baseAmount,
					e.foodItem.carbohydratePerBaseAmount * totalMeasurement / baseAmount,
					e.foodItem.fatPerBaseAmount * totalMeasurement / baseAmount,
					e.foodItem.proteinPerBaseAmount * totalMeasurement / baseAmount,
				];
			});

	const totalCalories = nutritionAmounts
			.map((a) => a[0])
			.reduce((a, b) => a + b, 0);
	const totalCarbohydrates = nutritionAmounts
			.map((a) => a[1])
			.reduce((a, b) => a + b, 0);
	const totalFat = nutritionAmounts
			.map((a) => a[2])
			.reduce((a, b) => a + b, 0);
	const totalProtein = nutritionAmounts
			.map((a) => a[3])
			.reduce((a, b) => a + b, 0);

	return {
		totalCalories, targetCalories,
		totalCarbohydrates, targetCarbohydrates,
		totalFat, targetFat,
		totalProtein, targetProtein,
	};
}

function calculateTotalMacroSummary(summaries: IMacroSummary[]): IMacroSummary {
	let totalCalories = 0;
	let targetCalories = 0;
	let totalCarbohydrates = 0;
	let targetCarbohydrates = 0;
	let totalFat = 0;
	let targetFat = 0;
	let totalProtein = 0;
	let targetProtein = 0;

	summaries.forEach((summary) => {
		if (summary.totalCalories > 0) {
			totalCalories += summary.totalCalories;
			targetCalories += summary.targetCalories;
			totalCarbohydrates += summary.totalCarbohydrates;
			targetCarbohydrates += summary.targetCarbohydrates;
			totalFat += summary.totalFat;
			targetFat += summary.targetFat;
			totalProtein += summary.totalProtein;
			targetProtein += summary.targetProtein;
		}
	});

	return {
		totalCalories, targetCalories,
		totalCarbohydrates, targetCarbohydrates,
		totalFat, targetFat,
		totalProtein, targetProtein,
	};
}

export {
	IMacroSummary,
	mapMacroSummaryFromJson,
	generateMacroSummary,
	calculateTotalMacroSummary,
};
