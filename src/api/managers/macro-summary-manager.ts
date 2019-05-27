import * as Moment from "moment";
import { CALORIES_PER_G_CARBOHYDRATES, CALORIES_PER_G_FAT, CALORIES_PER_G_PROTEIN } from "../../commons/constants";
import { IDiaryEntry } from "../../commons/models/IDiaryEntry";
import { IExerciseEntry } from "../../commons/models/IExerciseEntry";
import { IMacroSummary } from "../../commons/models/IMacroSummary";
import { getDefaultTarget, ITarget } from "../../commons/models/ITarget";
import { getNutritionBaseAmount, getTotalDiaryEntryMeasurement } from "../../commons/utils/helpers";
import { getDiaryEntriesForDate } from "./diary-entry-manager";
import { getExerciseEntriesForDate } from "./exercise-entry-manager";
import { getTargetForDate } from "./targets-manager";

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

async function getMacroSummaryForDate(date: Moment.Moment): Promise<IMacroSummary> {
	const [diaryEntries, exerciseEntries, target] = await Promise.all([
		getDiaryEntriesForDate(date),
		getExerciseEntriesForDate(date),
		getTargetForDate(date),
	]);

	return generateMacroSummary(
			diaryEntries || [],
			exerciseEntries || [],
			target || getDefaultTarget(),
	);
}

export {
	getMacroSummaryForDate,
};
