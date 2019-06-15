import * as React from "react";
import { ReactNode } from "react";
import { IFoodItem } from "../../commons/models/IFoodItem";
import renderNutritionBaseSize, { formatLargeNumber, formatMeasurement } from "../../commons/utils/formatters";
import * as bs from "../global-styles/Bootstrap.scss";
import { combine } from "./style-helpers";

function renderFoodItemSummary(
		foodItem: IFoodItem,
		pClass?: string,
		nameFormatter?: (name: string) => string | ReactNode,
): ReactNode {
	const infoChunks: ReactNode[] = [];

	infoChunks.push((
			<span key={`info-chunk-calories`}>
				{formatLargeNumber(foodItem.caloriesPerBaseAmount)} kcal
			</span>
	));

	infoChunks.push((
			<span key={`info-chunk-fat`}>
				{formatMeasurement(foodItem.fatPerBaseAmount, "g")} fat
			</span>
	));

	infoChunks.push((
			<span key={`info-chunk-carbohydrates`}>
				{formatMeasurement(foodItem.carbohydratePerBaseAmount, "g")} carbs
			</span>
	));

	infoChunks.push((
			<span key={`info-chunk-protein`}>
				{formatMeasurement(foodItem.proteinPerBaseAmount, "g")} protein
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
					Per {renderNutritionBaseSize(foodItem)}: {infoChunks}
				</span>
			</p>
	);
}

export {
	renderFoodItemSummary,
	};
