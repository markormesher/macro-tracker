import * as Dayjs from "dayjs";
import * as React from "react";
import { FoodMeasurementUnit, Meal } from "../enums";
import { IFoodItem } from "../models/IFoodItem";
import { utcDayjs } from "./dates";
import { getNutritionBaseAmount } from "./helpers";

function formatLargeNumber(amount: number, places: number = 0): string {
	const safeAmount = isNaN(amount) || amount === null ? 0 : amount;
	return safeAmount.toFixed(places).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPercent(amount: number): string {
	return amount.toFixed(1) + "%";
}

function formatMeasurementUnit(unit: FoodMeasurementUnit): string {
	if (unit === "g") {
		return "g";
	} else if (unit === "ml") {
		return "ml";
	}

	throw new Error(`Unrecognised unit: ${unit}`);
}

function formatMeasurement(amount: number, unit: FoodMeasurementUnit, places: number = 0): string {
	return formatLargeNumber(amount, places) + formatMeasurementUnit(unit);
}

function formatDate(date: Dayjs.Dayjs, format: "short" | "user" | "title" | "system" = "user"): string {
	if (!date) {
		return undefined;
	}

	/* istanbul ignore else: protected by type system */
	if (format === "short") {
		return date.format("DD/MM");
	} else if (format === "user") {
		return date.format("DD MMM YYYY");
	} else if (format === "title") {
		const now = utcDayjs();
		if (now.isSame(date, "day")) {
			return "Today";
		} else if (now.subtract(1, "day").isSame(date, "day")) {
			return "Yesterday";
		} else {
			return date.format("YYYY-MM-DD");
		}
	} else if (format === "system") {
		return date.format("YYYY-MM-DD");
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
