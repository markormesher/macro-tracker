import * as Moment from "moment";
import * as React from "react";
import { ReactNode } from "react";
import { FoodMeasurementUnit, Meal } from "../../commons/enums";
import { IFoodItem } from "../../commons/models/IFoodItem";
import { utcMoment } from "../../commons/utils/dates";
import * as bs from "../global-styles/Bootstrap.scss";
import { combine } from "./style-helpers";

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

function formatDate(date: Moment.Moment, format: "user" | "title" | "system" = "user"): string {
	if (!date) {
		return undefined;
	}

	/* istanbul ignore else: protected by type system */
	if (format === "user") {
		return date.format("DD MMM YYYY");
	} else if (format === "title") {
		const now = utcMoment();
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

function renderFoodItemSummary(
		foodItem: IFoodItem,
		pClass?: string,
		nameFormatter?: (name: string) => string | ReactNode,
): ReactNode {
	const infoChunks: ReactNode[] = [];

	infoChunks.push((
			<span key={`info-chunk-calories`}>
				{formatLargeNumber(foodItem.caloriesPer100)} kcal
			</span>
	));

	infoChunks.push((
			<span key={`info-chunk-fat`}>
				{formatMeasurement(foodItem.fatPer100, "g")} fat
			</span>
	));

	infoChunks.push((
			<span key={`info-chunk-carbohydrates`}>
				{formatMeasurement(foodItem.carbohydratePer100, "g")} carbs
			</span>
	));

	infoChunks.push((
			<span key={`info-chunk-protein`}>
				{formatMeasurement(foodItem.proteinPer100, "g")} protein
			</span>
	));

	for (let i = 1; i < infoChunks.length; i += 2) {
		infoChunks.splice(i, 0, (
				<span key={`spacer-${i}`} className={bs.mx1}>
					&bull;
				</span>
		));
	}

	return (
			<p className={pClass}>
				{nameFormatter ? nameFormatter(foodItem.name) : foodItem.name}
				<br/>
				<span className={combine(bs.textMuted, bs.small)}>
					{foodItem.brand}
				</span>
				<br/>
				<span className={combine(bs.textMuted, bs.small)}>
					Per {formatMeasurement(100, foodItem.measurementUnit)}: {infoChunks}
				</span>
			</p>
	);
}

export {
	formatLargeNumber,
	formatPercent,
	formatMeasurementUnit,
	formatMeasurement,
	formatDate,
	getMealTitle,
	renderFoodItemSummary,
};
