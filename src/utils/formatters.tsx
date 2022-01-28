import { format as dateFnsFormat, isSameDay, subDays } from "date-fns";
import { IFoodItem } from "../models/IFoodItem";
import { FoodMeasurementUnit, Meal } from "./enums";
import { fixedDate } from "./dates";
import { getNutritionBaseAmount } from "./helpers";

function formatLargeNumber(amount: number, places = 0): string {
  const safeAmount = isNaN(amount) || amount === null ? 0 : amount;
  return safeAmount.toFixed(places).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPercent(amount: number, places = 1): string {
  return amount.toFixed(places) + "%";
}

function formatMeasurementUnit(unit: FoodMeasurementUnit): string {
  if (unit === "g") {
    return "g";
  } else if (unit === "ml") {
    return "ml";
  }

  throw new Error(`Unrecognised unit: ${unit}`);
}

function formatMeasurement(amount: number, unit: FoodMeasurementUnit, places = 0): string {
  return formatLargeNumber(amount, places) + formatMeasurementUnit(unit);
}

function formatDate(date: Date, format: "short" | "user" | "title" | "system" = "user"): string {
  if (!date) {
    return undefined;
  }

  const adjustedDate = fixedDate(date);

  if (format === "short") {
    return dateFnsFormat(adjustedDate, "DD/MM");
  } else if (format === "user") {
    return dateFnsFormat(adjustedDate, "DD MMM YYYY");
  } else if (format === "title") {
    const now = fixedDate();
    if (isSameDay(adjustedDate, now)) {
      return "Today";
    } else if (isSameDay(adjustedDate, subDays(now, 1))) {
      return "Yesterday";
    } else {
      return dateFnsFormat(adjustedDate, "YYYY-MM-DD");
    }
  } else if (format === "system") {
    return dateFnsFormat(adjustedDate, "YYYY-MM-DD");
  }
}

function formatNutritionBaseSize(foodItem: IFoodItem): string {
  if (foodItem.measurementUnit === "single_serving") {
    return "serving";
  } else {
    return formatMeasurement(getNutritionBaseAmount(foodItem), foodItem.measurementUnit);
  }
}

function getMealTitle(meal: Meal): string {
  switch (meal) {
    case "snacks_1":
      return "Early-Morning Snacks";

    case "breakfast":
      return "Breakfast";

    case "snacks_2":
      return "Morning Snacks";

    case "lunch":
      return "Lunch";

    case "snacks_3":
      return "Afternoon Snacks";

    case "dinner":
      return "Dinner";

    case "snacks_4":
      return "Evening Snacks";
  }

  return "";
}

function uniqueArray<T>(arr: T[]): T[] {
  if (!arr) {
    return arr;
  }

  return arr.filter((v, i, a) => i === a.indexOf(v));
}

export {
  formatLargeNumber,
  formatPercent,
  formatMeasurementUnit,
  formatMeasurement,
  formatDate,
  formatNutritionBaseSize,
  getMealTitle,
  uniqueArray,
};
