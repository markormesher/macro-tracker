import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { IFoodItem } from "../../../commons/models/IFoodItem";
import { IServingSize, servingSizeComparator } from "../../../commons/models/IServingSize";
import * as bs from "../../global-styles/Bootstrap.scss";
import { formatMeasurement, formatMeasurementUnit } from "../../helpers/formatters";
import { ControlledSelectInput } from "../_ui/ControlledInputs/ControlledSelectInput";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";

interface IServingPickerProps {
	readonly foodItem?: IFoodItem;
	readonly servingQty?: number;
	readonly servingSize?: IServingSize;
	readonly disabled?: boolean;
	readonly onServingQtyChange?: (servingQty?: number) => void;
	readonly onServingSizeChange?: (servingSize?: IServingSize) => void;
}

class ServingPicker extends PureComponent<IServingPickerProps> {

	constructor(props: IServingPickerProps, context: any) {
		super(props, context);

		this.handleServingQtyChange = this.handleServingQtyChange.bind(this);
		this.handleServingSizeChange = this.handleServingSizeChange.bind(this);
	}

	public render(): ReactNode {
		const { foodItem, servingQty, servingSize, disabled } = this.props;

		return (
				<div className={bs.row}>
					<div className={bs.col6}>
						<ControlledTextInput
								id={"servingQty"}
								label={null}
								value={servingQty}
								disabled={disabled || !foodItem}
								onValueChange={this.handleServingQtyChange}
						/>
					</div>
					<div className={bs.col6}>
						<ControlledSelectInput
								id={"servingSize"}
								label={null}
								value={servingSize ? servingSize.id : ""}
								onValueChange={this.handleServingSizeChange}
								disabled={disabled || !foodItem}
						>
							{foodItem && foodItem.servingSizes.sort(servingSizeComparator).map((ss) => (
									<option value={ss.id} key={ss.id}>
										{ss.label} ({formatMeasurement(ss.measurement, foodItem.measurementUnit)})
									</option>
							))}
							{foodItem && (
									<option value={""}>
										{formatMeasurementUnit(foodItem.measurementUnit)}
									</option>
							)}
						</ControlledSelectInput>
					</div>
				</div>
		);
	}

	private handleServingQtyChange(value: string): void {
		const { onServingQtyChange } = this.props;
		if (onServingQtyChange) {
			onServingQtyChange(value === "" ? null : parseFloat(value));
		}
	}

	private handleServingSizeChange(servingSizeId: string): void {
		const { onServingSizeChange, foodItem } = this.props;
		if (foodItem) {
			const allServingSizes = foodItem.servingSizes;
			const servingSize = allServingSizes.find((ss) => ss.id === servingSizeId) || null;
			if (onServingSizeChange) {
				onServingSizeChange(servingSize);
			}
		}
	}
}

export {
	ServingPicker,
};
