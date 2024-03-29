import React, { PureComponent, ReactNode } from "react";
import { IFoodItem } from "../../../models/IFoodItem";
import { IServingSize, servingSizeComparator } from "../../../models/IServingSize";
import { formatMeasurement, formatMeasurementUnit } from "../../../utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { ControlledSelectInput } from "../_ui/ControlledInputs/ControlledSelectInput";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";

interface IServingPickerProps<Payload = unknown> {
  readonly foodItem?: IFoodItem;
  readonly servingQty?: number;
  readonly servingSize?: IServingSize;
  readonly disabled?: boolean;
  readonly payload?: Payload;
  readonly onServingQtyChange?: (servingQty?: number, payload?: Payload) => void;
  readonly onServingSizeChange?: (servingSize?: IServingSize, payload?: Payload) => void;
}

class ServingPicker<Payload = unknown> extends PureComponent<IServingPickerProps<Payload>> {
  constructor(props: IServingPickerProps<Payload>) {
    super(props);

    this.renderServingSizeSelector = this.renderServingSizeSelector.bind(this);
    this.handleServingQtyChange = this.handleServingQtyChange.bind(this);
    this.handleServingSizeChange = this.handleServingSizeChange.bind(this);
  }

  public render(): ReactNode {
    const { foodItem, servingQty, disabled } = this.props;

    return (
      <div className={bs.row}>
        <div className={bs.col6}>
          <ControlledTextInput
            id={"servingQty"}
            label={null}
            value={isNaN(servingQty) || servingQty === null ? "" : servingQty}
            disabled={disabled || !foodItem}
            onValueChange={this.handleServingQtyChange}
            inputProps={{
              type: "number",
              step: "0.01",
              min: "0",
            }}
          />
        </div>
        <div className={bs.col6}>{this.renderServingSizeSelector()}</div>
      </div>
    );
  }

  private renderServingSizeSelector(): ReactNode {
    const { foodItem, servingSize, disabled } = this.props;

    if (!foodItem) {
      return null;
    }

    if (foodItem.measurementUnit === "single_serving") {
      return (
        <ControlledSelectInput id={"servingSize"} label={null} value={""} disabled={true}>
          <option>serving</option>
        </ControlledSelectInput>
      );
    } else {
      return (
        <ControlledSelectInput
          id={"servingSize"}
          label={null}
          value={servingSize ? servingSize.id : ""}
          onValueChange={this.handleServingSizeChange}
          disabled={disabled || !foodItem}
        >
          {foodItem &&
            foodItem.servingSizes
              .filter((s) => !s.deleted)
              .sort(servingSizeComparator)
              .map((ss) => (
                <option value={ss.id} key={ss.id}>
                  {ss.label} ({formatMeasurement(ss.measurement, foodItem.measurementUnit)})
                </option>
              ))}
          {foodItem && <option value={""}>{formatMeasurementUnit(foodItem.measurementUnit)}</option>}
        </ControlledSelectInput>
      );
    }
  }

  private handleServingQtyChange(value: string): void {
    const { onServingQtyChange, payload } = this.props;
    if (onServingQtyChange) {
      onServingQtyChange(value === "" ? null : parseFloat(value), payload);
    }
  }

  private handleServingSizeChange(servingSizeId: string): void {
    const { onServingSizeChange, foodItem, payload } = this.props;
    if (foodItem) {
      const allServingSizes = foodItem.servingSizes;
      const servingSize = allServingSizes.find((ss) => ss.id === servingSizeId) || null;
      if (onServingSizeChange) {
        onServingSizeChange(servingSize, payload);
      }
    }
  }
}

export { ServingPicker };
