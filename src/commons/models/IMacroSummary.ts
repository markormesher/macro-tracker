import { CALORIES_PER_G_CARBOHYDRATES, CALORIES_PER_G_FAT, CALORIES_PER_G_PROTEIN } from "../constants";
import { getNutritionBaseAmount, getTotalDiaryEntryMeasurement } from "../utils/helpers";
import { IDiaryEntry } from "./IDiaryEntry";
import { IExerciseEntry } from "./IExerciseEntry";
import { IJsonObject } from "./IJsonObject";
import { ITarget, TargetMode } from "./ITarget";

interface IMacroSummary {
  readonly totalCalories: number;
  readonly totalCaloriesFromCarbohydrates: number;
  readonly totalCaloriesFromFat: number;
  readonly totalCaloriesFromProtein: number;

  readonly targetCalories: number;
  readonly targetCaloriesFromCarbohydrates: number;
  readonly targetCaloriesFromFat: number;
  readonly targetCaloriesFromProtein: number;

  readonly totalCarbohydrates: number;
  readonly totalProtein: number;
  readonly totalFat: number;

  readonly targetCarbohydrates: number;
  readonly targetFat: number;
  readonly targetProtein: number;
}

function mapMacroSummaryFromJson(json?: IJsonObject): IMacroSummary {
  if (!json) {
    return null;
  }

  return {
    totalCalories: parseFloat(json.totalCalories as string),
    totalCaloriesFromCarbohydrates: parseFloat(json.totalCaloriesFromCarbohydrates as string),
    totalCaloriesFromFat: parseFloat(json.totalCaloriesFromFat as string),
    totalCaloriesFromProtein: parseFloat(json.totalCaloriesFromProtein as string),

    targetCalories: parseFloat(json.targetCalories as string),
    targetCaloriesFromCarbohydrates: parseFloat(json.targetCaloriesFromCarbohydrates as string),
    targetCaloriesFromFat: parseFloat(json.targetCaloriesFromFat as string),
    targetCaloriesFromProtein: parseFloat(json.targetCaloriesFromProtein as string),

    totalCarbohydrates: parseFloat(json.totalCarbohydrates as string),
    totalFat: parseFloat(json.totalFat as string),
    totalProtein: parseFloat(json.totalProtein as string),

    targetCarbohydrates: parseFloat(json.targetCarbohydrates as string),
    targetFat: parseFloat(json.targetFat as string),
    targetProtein: parseFloat(json.targetProtein as string),
  };
}

function generateMacroSummary(
  diaryEntries: IDiaryEntry[],
  exerciseEntries: IExerciseEntry[],
  target: ITarget,
): IMacroSummary {
  // top-line calorie requirements
  const caloriesBurned = exerciseEntries.map((ee) => ee.caloriesBurned).reduce((a, b) => a + b, 0);
  const targetCalories = Math.round(target.maintenanceCalories * target.calorieAdjustment + caloriesBurned);

  // calorie requirements for each macro
  let targetCaloriesFromCarbohydrates = calculateTargetCalories(
    targetCalories,
    target.carbohydratesTargetMode,
    target.carbohydratesTargetValue,
    CALORIES_PER_G_CARBOHYDRATES,
    target.bodyWeightKg,
  );
  let targetCaloriesFromFat = calculateTargetCalories(
    targetCalories,
    target.fatTargetMode,
    target.fatTargetValue,
    CALORIES_PER_G_FAT,
    target.bodyWeightKg,
  );
  let targetCaloriesFromProtein = calculateTargetCalories(
    targetCalories,
    target.proteinTargetMode,
    target.proteinTargetValue,
    CALORIES_PER_G_PROTEIN,
    target.bodyWeightKg,
  );

  // fill in the blanks for "REMAINDER_OF_CALORIES" macros
  const totalTargetCaloriesFromMacros =
    targetCaloriesFromCarbohydrates + targetCaloriesFromFat + targetCaloriesFromProtein;
  if (target.carbohydratesTargetMode === TargetMode.REMAINDER_OF_CALORIES) {
    targetCaloriesFromCarbohydrates = targetCalories - totalTargetCaloriesFromMacros;
  }
  if (target.fatTargetMode === TargetMode.REMAINDER_OF_CALORIES) {
    targetCaloriesFromFat = targetCalories - totalTargetCaloriesFromMacros;
  }
  if (target.proteinTargetMode === TargetMode.REMAINDER_OF_CALORIES) {
    targetCaloriesFromProtein = targetCalories - totalTargetCaloriesFromMacros;
  }

  // absolute weight requirements for each macro
  const targetCarbohydrates = targetCaloriesFromCarbohydrates / CALORIES_PER_G_CARBOHYDRATES;
  const targetFat = targetCaloriesFromFat / CALORIES_PER_G_FAT;
  const targetProtein = targetCaloriesFromProtein / CALORIES_PER_G_PROTEIN;

  // reduce each diary entry to an array of macros
  const nutritionAmounts = diaryEntries.map((e) => {
    const totalMeasurement = getTotalDiaryEntryMeasurement(e);
    const baseAmount = getNutritionBaseAmount(e.foodItem);

    return {
      calories: (e.foodItem.caloriesPerBaseAmount * totalMeasurement) / baseAmount,
      carbohydrates: (e.foodItem.carbohydratePerBaseAmount * totalMeasurement) / baseAmount,
      fat: (e.foodItem.fatPerBaseAmount * totalMeasurement) / baseAmount,
      protein: (e.foodItem.proteinPerBaseAmount * totalMeasurement) / baseAmount,
    };
  });

  // sum up the total amounts and calories from each macro
  const reduceSum = (a: number, b: number): number => a + b;
  const totalCalories = nutritionAmounts.map((a) => a.calories).reduce(reduceSum, 0);
  const totalCaloriesFromCarbohydrates = nutritionAmounts
    .map((a) => a.carbohydrates * CALORIES_PER_G_CARBOHYDRATES)
    .reduce(reduceSum, 0);
  const totalCaloriesFromFat = nutritionAmounts.map((a) => a.fat * CALORIES_PER_G_FAT).reduce(reduceSum, 0);
  const totalCaloriesFromProtein = nutritionAmounts.map((a) => a.protein * CALORIES_PER_G_PROTEIN).reduce(reduceSum, 0);
  const totalCarbohydrates = nutritionAmounts.map((a) => a.carbohydrates).reduce((a, b) => a + b, 0);
  const totalFat = nutritionAmounts.map((a) => a.fat).reduce((a, b) => a + b, 0);
  const totalProtein = nutritionAmounts.map((a) => a.protein).reduce((a, b) => a + b, 0);

  return {
    totalCalories,
    totalCaloriesFromCarbohydrates,
    totalCaloriesFromFat,
    totalCaloriesFromProtein,

    targetCalories,
    targetCaloriesFromCarbohydrates,
    targetCaloriesFromFat,
    targetCaloriesFromProtein,

    totalCarbohydrates,
    totalFat,
    totalProtein,

    targetCarbohydrates,
    targetFat,
    targetProtein,
  };
}

function calculateTargetCalories(
  totalCalories: number,
  targetMode: TargetMode,
  targetValue: number,
  caloriesPerG: number,
  bodyWeight: number,
): number {
  switch (targetMode) {
    case TargetMode.PERCENTAGE_OF_CALORIES:
      return Math.round(totalCalories * targetValue);

    case TargetMode.G_PER_KG_OF_BODY_WEIGHT:
      return Math.round(bodyWeight * targetValue * caloriesPerG);

    case TargetMode.ABSOLUTE:
      return Math.round(targetValue * caloriesPerG);

    case TargetMode.REMAINDER_OF_CALORIES:
    default:
      // return 0 for REMAINDER_OF_CALORIES because this gets worked out later
      return 0;
  }
}

function calculateTotalMacroSummary(summaries: IMacroSummary[]): IMacroSummary {
  let totalCalories = 0;
  let totalCaloriesFromCarbohydrates = 0;
  let totalCaloriesFromFat = 0;
  let totalCaloriesFromProtein = 0;

  let totalCarbohydrates = 0;
  let totalFat = 0;
  let totalProtein = 0;

  let targetCalories = 0;
  let targetCaloriesFromCarbohydrates = 0;
  let targetCaloriesFromFat = 0;
  let targetCaloriesFromProtein = 0;

  let targetCarbohydrates = 0;
  let targetFat = 0;
  let targetProtein = 0;

  summaries.forEach((summary) => {
    if (summary.totalCalories > 0) {
      totalCalories += summary.totalCalories;
      totalCaloriesFromCarbohydrates += summary.totalCaloriesFromCarbohydrates;
      totalCaloriesFromFat += summary.totalCaloriesFromFat;
      totalCaloriesFromProtein += summary.totalCaloriesFromProtein;

      totalCarbohydrates += summary.totalCarbohydrates;
      totalFat += summary.totalFat;
      totalProtein += summary.totalProtein;

      targetCalories += summary.targetCalories;
      targetCaloriesFromCarbohydrates += summary.targetCaloriesFromCarbohydrates;
      targetCaloriesFromFat += summary.targetCaloriesFromFat;
      targetCaloriesFromProtein += summary.targetCaloriesFromProtein;

      targetCarbohydrates += summary.targetCarbohydrates;
      targetFat += summary.targetFat;
      targetProtein += summary.targetProtein;
    }
  });

  return {
    totalCalories,
    totalCaloriesFromCarbohydrates,
    totalCaloriesFromFat,
    totalCaloriesFromProtein,

    totalCarbohydrates,
    totalFat,
    totalProtein,

    targetCalories,
    targetCaloriesFromCarbohydrates,
    targetCaloriesFromFat,
    targetCaloriesFromProtein,

    targetCarbohydrates,
    targetFat,
    targetProtein,
  };
}

export { IMacroSummary, mapMacroSummaryFromJson, generateMacroSummary, calculateTotalMacroSummary };
