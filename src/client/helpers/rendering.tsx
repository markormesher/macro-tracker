import * as React from "react";
import { ReactNode } from "react";
import { IMacroSummary } from "../../commons/models/IMacroSummary";
import { ProgressBar } from "../components/_ui/ProgressBar/ProgressBar";
import * as bs from "../global-styles/Bootstrap.scss";

function getClassesForProgressBar(percent: number): string {
	if (percent < 0.6) {
		return bs.bgWarning;
	} else if (percent <= 1.05) {
		return bs.bgSuccess;
	} else if (percent <= 1.15) {
		return bs.bgWarning;
	} else {
		return bs.bgDanger;
	}
}

function renderMacroSummary(summary: IMacroSummary): ReactNode {
	const {
		targetCalories, totalCalories, targetCarbohydrates, totalCarbohydrates,
		targetFat, totalFat, targetProtein, totalProtein,
	} = summary;

	const percentCalories = totalCalories / targetCalories;
	const percentCarbohydrates = totalCarbohydrates / targetCarbohydrates;
	const percentFat = totalFat / targetFat;
	const percentProtein = totalProtein / targetProtein;

	return (
			<div className={bs.row}>
				<div className={bs.col}>
					<ProgressBar
							label={"Calories"}
							value={totalCalories}
							total={targetCalories}
							showPercent={true}
							wrapperClasses={bs.mb1}
							barClasses={getClassesForProgressBar(percentCalories)}
					/>
					<ProgressBar
							label={"Carbohydrates"}
							value={totalCarbohydrates}
							total={targetCarbohydrates}
							unit={"g"}
							showPercent={true}
							wrapperClasses={bs.mb1}
							barClasses={getClassesForProgressBar(percentCarbohydrates)}
					/>
					<ProgressBar
							label={"Fat"}
							value={totalFat}
							total={targetFat}
							unit={"g"}
							showPercent={true}
							wrapperClasses={bs.mb1}
							barClasses={getClassesForProgressBar(percentFat)}
					/>
					<ProgressBar
							label={"Protein"}
							value={totalProtein}
							total={targetProtein}
							unit={"g"}
							showPercent={true}
							barClasses={getClassesForProgressBar(percentProtein)}
					/>
				</div>
			</div>
	);
}

export {
	getClassesForProgressBar,
	renderMacroSummary,
};
