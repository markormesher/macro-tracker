import * as Moment from "moment";
import * as React from "react";
import { FoodMeasurementUnit, Meal } from "../../commons/enums";

function formatLargeNumber(amount: number): string {
	return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

function formatMeasurement(amount: number, unit: FoodMeasurementUnit): string {
	return formatLargeNumber(amount) + formatMeasurementUnit(unit);
}

function formatDate(date: Date | Moment.Moment | string, format: "user" | "title" | "system" = "user"): string {
	if (!date) {
		return undefined;
	}

	/* istanbul ignore else: protected by type system */
	if (format === "user") {
		return Moment(date).format("DD MMM YYYY");
	} else if (format === "title") {
		const now = Moment();
		if (now.isSame(date, "day")) {
			return "Today";
		} else if (now.subtract(1, "day").isSame(date, "day")) {
			return "Yesterday";
		} else {
			return Moment(date).format("YYYY-MM-DD");
		}
	} else if (format === "system") {
		return Moment(date).format("YYYY-MM-DD");
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

export {
	formatLargeNumber,
	formatPercent,
	formatMeasurementUnit,
	formatMeasurement,
	formatDate,
	getMealTitle,
};
