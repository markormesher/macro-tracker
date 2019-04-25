import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { foodItemComparator, IFoodItem } from "../../../commons/models/IFoodItem";
import { startLoadAllFoodItems } from "../../redux/food-items";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ControlledSelectInput, IControlledSelectInputProps } from "../_ui/ControlledInputs/ControlledSelectInput";

interface IFoodItemPickerProps {
	// from props
	readonly value?: IFoodItem;
	readonly preSelectedId?: string;
	readonly inputProps?: Partial<IControlledSelectInputProps>;
	readonly onValueChange?: (foodItem?: IFoodItem) => void;

	// from redux
	readonly allFoodItems?: IFoodItem[];
	readonly actions?: {
		readonly startLoadAllFoodItems: () => PayloadAction;
	};
}

function mapStateToProps(state: IRootState, props: IFoodItemPickerProps): IFoodItemPickerProps {
	return {
		...props,
		allFoodItems: state.foodItems.allFoodItems,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IFoodItemPickerProps): IFoodItemPickerProps {
	return {
		...props,
		actions: {
			startLoadAllFoodItems: () => dispatch(startLoadAllFoodItems()),
		},
	};
}

class UCFoodItemPicker extends PureComponent<IFoodItemPickerProps> {

	constructor(props: IFoodItemPickerProps, context: any) {
		super(props, context);

		this.handleFoodItemChange = this.handleFoodItemChange.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.startLoadAllFoodItems();
	}

	public componentDidUpdate(
			prevProps: Readonly<IFoodItemPickerProps>,
			prevState: Readonly<{}>,
			snapshot?: any,
	): void {
		const props = this.props;
		const foodItems = props.allFoodItems;
		const prevFoodItems = prevProps.allFoodItems;
		if (foodItems && foodItems.length > 0 && (!prevFoodItems || prevFoodItems.length === 0)) {
			// loaded food items for the first time

			if (props.preSelectedId) {
				this.handleFoodItemChange(props.preSelectedId);
			}
		}
	}

	public render(): ReactNode {
		const { value, inputProps, allFoodItems } = this.props;

		return (
				<ControlledSelectInput
						id={"foodItem"}
						label={"Food Item"}
						value={value ? value.id : ""}
						onValueChange={this.handleFoodItemChange}
						{...inputProps}
				>
					<option value={"default"}>Select</option>
					{allFoodItems && allFoodItems.sort(foodItemComparator).map((fi) => (
							<option value={fi.id} key={fi.id}>
								{fi.brand} {fi.name}
							</option>
					))}
				</ControlledSelectInput>
		);
	}

	private handleFoodItemChange(foodItemId: string): void {
		const { allFoodItems, onValueChange } = this.props;
		const foodItem = allFoodItems.find((fi) => fi.id === foodItemId) || undefined;
		if (onValueChange) {
			onValueChange(foodItem);
		}
	}
}

export const FoodItemPicker = connect(mapStateToProps, mapDispatchToProps)(UCFoodItemPicker);
