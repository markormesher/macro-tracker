import { IJsonObject } from "./IJsonObject";

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

function mapMacroSummaryFromJson(json?: IJsonObject): IMacroSummary {
	if (!json) {
		return null;
	}

	return {
		totalCalories: parseFloat(json.totalCalories as string),
		targetCalories: parseFloat(json.targetCalories as string),
		totalCarbohydrates: parseFloat(json.totalCarbohydrates as string),
		targetCarbohydrates: parseFloat(json.targetCarbohydrates as string),
		totalFat: parseFloat(json.totalFat as string),
		targetFat: parseFloat(json.targetFat as string),
		totalProtein: parseFloat(json.totalProtein as string),
		targetProtein: parseFloat(json.targetProtein as string),
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
		if (summary.totalCalories > 0) {
			totalCalories += summary.totalCalories;
			targetCalories += summary.targetCalories;
			totalCarbohydrates += summary.totalCarbohydrates;
			targetCarbohydrates += summary.targetCarbohydrates;
			totalFat += summary.totalFat;
			targetFat += summary.targetFat;
			totalProtein += summary.totalProtein;
			targetProtein += summary.targetProtein;
		}
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
	mapMacroSummaryFromJson,
	calculateTotalMacroSummary,
};
