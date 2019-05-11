import * as Moment from "moment";
import { CALORIES_PER_G_CARBOHYDRATES, CALORIES_PER_G_FAT, CALORIES_PER_G_PROTEIN } from "../../commons/constants";
import { IDiaryEntry } from "../../commons/models/IDiaryEntry";
import { IExerciseEntry } from "../../commons/models/IExerciseEntry";
import { IMacroSummary } from "../../commons/models/IMacroSummary";
import { getDefaultTarget, ITarget } from "../../commons/models/ITarget";
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
