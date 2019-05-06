import { CALORIES_PER_G_CARBOHYDRATES, CALORIES_PER_G_FAT, CALORIES_PER_G_PROTEIN } from "../constants";
import { IDiaryEntry } from "./IDiaryEntry";
import { IExerciseEntry } from "./IExerciseEntry";
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

function generateMacroSummary(
		diaryEntries: IDiaryEntry[],
		exerciseEntries: IExerciseEntry[],
		target: ITarget,
): IMacroSummary {

	const totalCaloriesBurned = exerciseEntries.map((ee) => ee.caloriesBurned).reduce((a, b) => a + b, 0);
	const targetCalories = target.baselineCaloriesPerDay + totalCaloriesBurned;
	const targetCarbohydrates = targetCalories * target.proportionCarbohydrates / CALORIES_PER_G_CARBOHYDRATES;
	const targetFat = targetCalories * target.proportionFat / CALORIES_PER_G_FAT;
	const targetProtein = targetCalories * target.proportionProtein / CALORIES_PER_G_PROTEIN;

	const totalCalories = diaryEntries
			.map((e) => e.foodItem.caloriesPer100 * e.servingQty * (e.servingSize ? e.servingSize.measurement : 1) / 100)
			.reduce((a, b) => a + b, 0);
	const totalCarbohydrates = diaryEntries
			.map((e) => e.foodItem.carbohydratePer100 * e.servingQty * (e.servingSize ? e.servingSize.measurement : 1) / 100)
			.reduce((a, b) => a + b, 0);
	const totalFat = diaryEntries
			.map((e) => e.foodItem.fatPer100 * e.servingQty * (e.servingSize ? e.servingSize.measurement : 1) / 100)
			.reduce((a, b) => a + b, 0);
	const totalProtein = diaryEntries
			.map((e) => e.foodItem.proteinPer100 * e.servingQty * (e.servingSize ? e.servingSize.measurement : 1) / 100)
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
		totalCalories += summary.totalCalories;
		targetCalories += summary.targetCalories;
		totalCarbohydrates += summary.totalCarbohydrates;
		targetCarbohydrates += summary.targetCarbohydrates;
		totalFat += summary.totalFat;
		targetFat += summary.targetFat;
		totalProtein += summary.totalProtein;
		targetProtein += summary.targetProtein;
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
	generateMacroSummary,
	calculateTotalMacroSummary,
};
