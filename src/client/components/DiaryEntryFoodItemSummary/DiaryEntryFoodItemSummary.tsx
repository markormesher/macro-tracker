import React, { PureComponent, ReactNode } from "react";
import { IDiaryEntry } from "../../../models/IDiaryEntry";
import { formatLargeNumber, formatMeasurement } from "../../../utils/formatters";
import { getNutritionBaseAmount, getTotalDiaryEntryMeasurement } from "../../../utils/helpers";
import * as bs from "../../global-styles/Bootstrap.scss";
import { combine } from "../../helpers/style-helpers";

interface IFoodItemSummaryProps {
  readonly diaryEntry: IDiaryEntry;
}

class DiaryEntryFoodItemSummary extends PureComponent<IFoodItemSummaryProps> {
  public render(): ReactNode {
    const { diaryEntry } = this.props;
    const { foodItem, servingSize } = diaryEntry;

    const totalMeasurement = getTotalDiaryEntryMeasurement(diaryEntry);
    const infoChunks: ReactNode[] = [];

    infoChunks.push(
      <span key={`info-chunk-brand`} className={combine(bs.textMuted, bs.small)}>
        {foodItem.brand}
      </span>,
    );

    if (foodItem.measurementUnit === "single_serving") {
      infoChunks.push(
        <span key={`info-chunk-serving-size`} className={combine(bs.textMuted, bs.small)}>
          {diaryEntry.servingQty} serving
        </span>,
      );
    } else if (servingSize) {
      infoChunks.push(
        <span key={`info-chunk-serving-size`} className={combine(bs.textMuted, bs.small)}>
          {diaryEntry.servingQty} {servingSize.label}
        </span>,
      );
    } else {
      infoChunks.push(
        <span key={`info-chunk-serving-measurement`} className={combine(bs.textMuted, bs.small)}>
          {formatMeasurement(totalMeasurement, foodItem.measurementUnit)}
        </span>,
      );
    }

    infoChunks.push(
      <span key={`info-chunk-calories`} className={combine(bs.textMuted, bs.small)}>
        {formatLargeNumber((totalMeasurement * foodItem.caloriesPerBaseAmount) / getNutritionBaseAmount(foodItem))} kcal
      </span>,
    );

    for (let i = 1; i < infoChunks.length; i += 2) {
      infoChunks.splice(
        i,
        0,
        <span key={`spacer-${i}`} className={combine(bs.textMuted, bs.small, bs.mx1)}>
          &bull;
        </span>,
      );
    }

    return (
      <>
        {foodItem.name}
        <br />
        {infoChunks}
      </>
    );
  }
}

export { DiaryEntryFoodItemSummary };
