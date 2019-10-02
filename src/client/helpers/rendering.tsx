import React, { ReactNode } from "react";
import { IMacroSummary } from "../../commons/models/IMacroSummary";
import { ProgressBar } from "../components/_ui/ProgressBar/ProgressBar";
import * as bs from "../global-styles/Bootstrap.scss";

function getClassesForProgressBar(percent: number): string {
  if (percent < 0.6) {
    return bs.bgInfo;
  } else if (percent <= 1.1) {
    return bs.bgSuccess;
  } else if (percent <= 1.2) {
    return bs.bgWarning;
  } else {
    return bs.bgDanger;
  }
}

function renderMacroSummary(summary: IMacroSummary): ReactNode {
  const {
    targetCalories,
    totalCalories,
    targetCarbohydrates,
    totalCarbohydrates,
    targetFat,
    totalFat,
    targetProtein,
    totalProtein,
  } = summary;

  const percentCalories = targetCalories > 0 ? totalCalories / targetCalories : 0;
  const percentCarbohydrates = targetCarbohydrates > 0 ? totalCarbohydrates / targetCarbohydrates : 0;
  const percentFat = targetFat > 0 ? totalFat / targetFat : 0;
  const percentProtein = targetProtein > 0 ? totalProtein / targetProtein : 0;

  return (
    <>
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
    </>
  );
}

export { getClassesForProgressBar, renderMacroSummary };
