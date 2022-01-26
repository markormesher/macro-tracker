import { IDiaryEntry } from "../models/IDiaryEntry";
import { IFoodItem } from "../models/IFoodItem";
import { CALORIES_PER_G_CARBOHYDRATES, CALORIES_PER_G_FAT, CALORIES_PER_G_PROTEIN } from "./constants";
import { formatLargeNumber, formatMeasurement, formatNutritionBaseSize } from "./formatters";

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

function getExpectedCalories(foodItem: IFoodItem): number {
  return (
    foodItem.carbohydratePerBaseAmount * CALORIES_PER_G_CARBOHYDRATES +
    foodItem.fatPerBaseAmount * CALORIES_PER_G_FAT +
    foodItem.proteinPerBaseAmount * CALORIES_PER_G_PROTEIN
  );
}

function getFoodItemDataWarnings(foodItem: IFoodItem): string[] {
  const warnings: string[] = [];

  const expectedCalories = getExpectedCalories(foodItem);
  const actualCalories = foodItem.caloriesPerBaseAmount;

  if (expectedCalories > 1 && actualCalories === 0) {
    warnings.push(`
    This food has zero calories but it should have approx.
    ${formatLargeNumber(expectedCalories)} according to the macros entered.
    `);
  }

  const calorieErrorMargin = actualCalories > 0 ? Math.abs((expectedCalories - actualCalories) / actualCalories) : 0;
  if (expectedCalories > 1 && calorieErrorMargin >= 0.2) {
    warnings.push(`
    This food has ${formatLargeNumber(actualCalories)} calories per ${formatNutritionBaseSize(foodItem)},
    but it should have approx. ${formatLargeNumber(expectedCalories)} according to the macros entered.
    `);
  }

  if (foodItem.satFatPerBaseAmount > foodItem.fatPerBaseAmount) {
    warnings.push(`
    This food has ${formatMeasurement(foodItem.satFatPerBaseAmount, "g")} of sat. fat per
    ${formatNutritionBaseSize(foodItem)} but only
    ${formatMeasurement(foodItem.fatPerBaseAmount, "g")} total fat.
    `);
  }

  if (foodItem.sugarPerBaseAmount > foodItem.carbohydratePerBaseAmount) {
    warnings.push(`
    This food has ${formatMeasurement(foodItem.sugarPerBaseAmount, "g")} of sugar per
    ${formatNutritionBaseSize(foodItem)} but only
    ${formatMeasurement(foodItem.carbohydratePerBaseAmount, "g")} total carbohydrates.
    `);
  }

  return warnings;
}

export { getTotalDiaryEntryMeasurement, getNutritionBaseAmount, getExpectedCalories, getFoodItemDataWarnings };
