import { faArrowLeft, faCalendarDay, faCircleNotch, faSave } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { v4 } from "uuid";
import { FoodMeasurementUnit } from "../../../commons/enums";
import {
	getDefaultFoodItem,
	IFoodItem,
	IFoodItemValidationResult,
	validateFoodItem,
} from "../../../commons/models/IFoodItem";
import { getDefaultServingSize, IServingSize } from "../../../commons/models/IServingSize";
import * as bs from "../../global-styles/Bootstrap.scss";
import { formatMeasurement, formatMeasurementUnit } from "../../helpers/formatters";
import { combine } from "../../helpers/style-helpers";
import { setEditorResult, startLoadAllFoodItems, startLoadFoodItem, startSaveFoodItem } from "../../redux/food-items";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledForm } from "../_ui/ControlledForm/ControlledForm";
import { ControlledRadioInput } from "../_ui/ControlledInputs/ControlledRadioInput";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import { SuggestionTextInput } from "../_ui/SuggestionTextInput/SuggestionTextInput";

interface IEditFoodItemPageProps {
	readonly editorBusy?: boolean;
	readonly editorResult?: ActionResult;
	readonly loadedFoodItem?: IFoodItem;
	readonly lastFoodItemSaved?: IFoodItem;
	readonly allBrands?: string[];
	readonly actions?: {
		readonly resetEditorResult: () => PayloadAction;
		readonly startLoadFoodItem: () => PayloadAction;
		readonly startLoadAllFoodItems: () => PayloadAction;
		readonly startSaveFoodItem: (foodItem: IFoodItem) => PayloadAction;
	};

	// added by connected react router
	readonly match?: Match<{ readonly foodItemId: string }>;
}

interface IEditFoodItemPageState {
	readonly currentValue: IFoodItem;
	readonly validationResult: IFoodItemValidationResult;
}

function mapStateToProps(state: IRootState, props: IEditFoodItemPageProps): IEditFoodItemPageProps {
	const foodItemId = props.match.params.foodItemId;
	return {
		...props,
		editorBusy: state.foodItems.editorBusy,
		editorResult: state.foodItems.editorResult,
		loadedFoodItem: state.foodItems.loadedFoodItems[foodItemId],
		lastFoodItemSaved: state.foodItems.lastFoodItemSaved,
		allBrands: state.foodItems.allFoodItems
				.map((fi) => fi.brand)
				.sort((a, b) => a.localeCompare(b))
				.filter((v, i, a) => i === a.indexOf(v)),
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IEditFoodItemPageProps): IEditFoodItemPageProps {
	const foodItemId = props.match.params.foodItemId;
	return {
		...props,
		actions: {
			resetEditorResult: () => dispatch(setEditorResult(undefined)),
			startLoadFoodItem: () => dispatch(startLoadFoodItem(foodItemId)),
			startLoadAllFoodItems: () => dispatch(startLoadAllFoodItems()),
			startSaveFoodItem: (foodItem) => dispatch(startSaveFoodItem(foodItem)),
		},
	};
}

class UCEditFoodItemPage extends PureComponent<IEditFoodItemPageProps, IEditFoodItemPageState> {

	constructor(props: IEditFoodItemPageProps, context: any) {
		super(props, context);

		const defaultFoodItem = {
			...(getDefaultFoodItem()),
		};

		this.state = {
			currentValue: defaultFoodItem,
			validationResult: validateFoodItem(defaultFoodItem),
		};

		this.renderServingSizeInputs = this.renderServingSizeInputs.bind(this);
		this.handleBrandChange = this.handleBrandChange.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleMeasurementUnitChange = this.handleMeasurementUnitChange.bind(this);
		this.handleCaloriesPer100Change = this.handleCaloriesPer100Change.bind(this);
		this.handleCarbohydratePer100Change = this.handleCarbohydratePer100Change.bind(this);
		this.handleSugarPer100Change = this.handleSugarPer100Change.bind(this);
		this.handleFatPer100Change = this.handleFatPer100Change.bind(this);
		this.handleSatFatPer100Change = this.handleSatFatPer100Change.bind(this);
		this.handleProteinPer100Change = this.handleProteinPer100Change.bind(this);
		this.handleFibrePer100Change = this.handleFibrePer100Change.bind(this);
		this.handleSaltPer100Change = this.handleSaltPer100Change.bind(this);
		this.handleServingSizeLabelChange = this.handleServingSizeLabelChange.bind(this);
		this.handleServingSizeMeasurementChange = this.handleServingSizeMeasurementChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.updateModel = this.updateModel.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.resetEditorResult();
		this.props.actions.startLoadAllFoodItems();

		const foodItemId = this.props.match.params.foodItemId;
		if (foodItemId) {
			this.props.actions.startLoadFoodItem();
		}
	}

	public componentDidUpdate(
			prevProps: Readonly<IEditFoodItemPageProps>,
			prevState: Readonly<IEditFoodItemPageState>,
			snapshot?: any,
	): void {
		const loadedFoodItem = this.props.loadedFoodItem;
		if (loadedFoodItem !== prevProps.loadedFoodItem || loadedFoodItem && !prevState.currentValue.id) {
			this.updateModel(loadedFoodItem);
		}
	}

	public render(): ReactNode {
		const { match, editorBusy, editorResult, allBrands } = this.props;
		const { currentValue, validationResult } = this.state;
		const errors = validationResult.errors || {};

		const foodItemId = match.params.foodItemId;
		const creatingNew = !foodItemId;

		if (!creatingNew && !currentValue.id) {
			// still loading
			return <LoadingSpinner centre={true}/>;
		}

		let statusMsg: ReactNode = null;
		if (editorResult === "success") {
			const { lastFoodItemSaved } = this.props;
			return (
					<ContentWrapper>
						<div className={bs.row}>
							<div className={bs.col}>
								<h1>Done!</h1>
								<p>{lastFoodItemSaved.name} has been saved.</p>
							</div>
						</div>
						<div className={bs.row}>
							<div className={bs.col6}>
								<Link to={"/food-items"}>
									<IconBtn
											icon={faArrowLeft}
											text={"All Food Items"}
											btnProps={{
												className: bs.btnOutlineDark,
												style: {
													width: "100%",
												},
											}}
									/>
								</Link>
							</div>
							<div className={bs.col6}>
								<Link to={`/diary-entries/edit?initFood=${lastFoodItemSaved.id}`}>
									<IconBtn
											icon={faCalendarDay}
											text={"Add to Diary Entry"}
											btnProps={{
												className: bs.btnOutlineDark,
												style: {
													width: "100%",
												},
											}}
									/>
								</Link>
							</div>
						</div>
					</ContentWrapper>
			);
		} else if (editorResult) {
			statusMsg = (
					<div className={combine(bs.alert, bs.alertDanger)}>
						<h5>Failed!</h5>
						<p>{editorResult.message}</p>
					</div>
			);
		}

		return (
				<ContentWrapper>
					{statusMsg}
					<div className={bs.row}>
						<div className={bs.col}>
							<h1>{creatingNew ? "Create" : "Edit"} Food Item</h1>
							<ControlledForm
									onSubmit={this.handleSubmit}
							>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<SuggestionTextInput
												id={"brand"}
												label={"Brand"}
												placeholder={"Brand"}
												value={currentValue.brand || ""}
												disabled={editorBusy}
												error={errors.brand}
												onValueChange={this.handleBrandChange}
												suggestionOptions={allBrands}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"name"}
												label={"Name"}
												placeholder={"Name"}
												value={currentValue.name || ""}
												onValueChange={this.handleNameChange}
												disabled={editorBusy}
												error={errors.name}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<label>Measurement Unit</label>
										<div className={bs.row}>
											<div className={bs.col6}>
												<ControlledRadioInput
														id={"measurementUnit_g"}
														name={"measurementUnit"}
														label={"g"}
														checked={currentValue.measurementUnit === "g"}
														value={"g"}
														onValueChange={this.handleMeasurementUnitChange}
														disabled={editorBusy}
												/>
											</div>
											<div className={bs.col6}>
												<ControlledRadioInput
														id={"measurementUnit_ml"}
														name={"measurementUnit"}
														label={"ml"}
														checked={currentValue.measurementUnit === "ml"}
														value={"ml"}
														onValueChange={this.handleMeasurementUnitChange}
														disabled={editorBusy}
												/>
											</div>
										</div>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"caloriesPer100"}
												label={`Calories per ${formatMeasurement(100, currentValue.measurementUnit)}`}
												placeholder={"Calories"}
												value={ControlledTextInput.safeNumericValue(currentValue.caloriesPer100)}
												onValueChange={this.handleCaloriesPer100Change}
												disabled={editorBusy}
												error={errors.caloriesPer100}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"carbohydratesPer100"}
												label={`Carbohydrates per ${formatMeasurement(100, currentValue.measurementUnit)}`}
												placeholder={"Carbohydrates"}
												value={ControlledTextInput.safeNumericValue(currentValue.carbohydratePer100)}
												onValueChange={this.handleCarbohydratePer100Change}
												disabled={editorBusy}
												error={errors.carbohydratePer100}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"sugarPer100"}
												label={`Sugar per ${formatMeasurement(100, currentValue.measurementUnit)}`}
												placeholder={"Sugar"}
												value={ControlledTextInput.safeNumericValue(currentValue.sugarPer100)}
												onValueChange={this.handleSugarPer100Change}
												disabled={editorBusy}
												error={errors.sugarPer100}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"fatPer100"}
												label={`Fat per ${formatMeasurement(100, currentValue.measurementUnit)}`}
												placeholder={"Fat"}
												value={ControlledTextInput.safeNumericValue(currentValue.fatPer100)}
												onValueChange={this.handleFatPer100Change}
												disabled={editorBusy}
												error={errors.fatPer100}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"satFatPer100"}
												label={`Sat. Fat per ${formatMeasurement(100, currentValue.measurementUnit)}`}
												placeholder={"Sat. Fat"}
												value={ControlledTextInput.safeNumericValue(currentValue.satFatPer100)}
												onValueChange={this.handleSatFatPer100Change}
												disabled={editorBusy}
												error={errors.satFatPer100}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"proteinPer100"}
												label={`Protein per ${formatMeasurement(100, currentValue.measurementUnit)}`}
												placeholder={"Protein"}
												value={ControlledTextInput.safeNumericValue(currentValue.proteinPer100)}
												onValueChange={this.handleProteinPer100Change}
												disabled={editorBusy}
												error={errors.proteinPer100}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"fibrePer100"}
												label={`Fibre per ${formatMeasurement(100, currentValue.measurementUnit)}`}
												placeholder={"Fibre"}
												value={ControlledTextInput.safeNumericValue(currentValue.fibrePer100)}
												onValueChange={this.handleFibrePer100Change}
												disabled={editorBusy}
												error={errors.fibrePer100}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"saltPer100"}
												label={`Salt per ${formatMeasurement(100, currentValue.measurementUnit)}`}
												placeholder={"Salt"}
												value={ControlledTextInput.safeNumericValue(currentValue.saltPer100)}
												onValueChange={this.handleSaltPer100Change}
												disabled={editorBusy}
												error={errors.saltPer100}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
									<div className={combine(bs.col12, bs.formGroup)}>
										<label>Serving Sizes</label>
										{this.renderServingSizeInputs()}
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<IconBtn
												icon={editorBusy ? faCircleNotch : faSave}
												text={"Save"}
												onClick={this.handleSubmit}
												btnProps={{
													className: bs.btnOutlinePrimary,
													disabled: editorBusy || !validationResult.isValid,
												}}
												iconProps={{
													spin: editorBusy,
												}}
										/>
									</div>
								</div>
							</ControlledForm>
						</div>
					</div>
				</ContentWrapper>
		);
	}

	private renderServingSizeInputs(): ReactNode {
		const { editorBusy } = this.props;
		const { currentValue } = this.state;

		// show all valid sizes plus one blank input
		const servingSizesToShow = currentValue.servingSizes
				.filter((ss) => !ss.deleted)
				.filter((ss) => ss.label || (!isNaN(ss.measurement) && ss.measurement !== null));
		servingSizesToShow.push(getDefaultServingSize(v4()));

		return servingSizesToShow.map((ss, idx) => (
				<div className={combine(bs.dFlex, idx > 0 && bs.mt2)} key={`serving_size_${ss.id}`}>
					<div className={combine(bs.flexGrow0, bs.pr1, bs.mAuto)}>
						1
					</div>
					<div className={bs.flexGrow1}>
						<ControlledTextInput
								id={`serving_size_label_${ss.id}`}
								label={null}
								value={ss.label || ""}
								disabled={editorBusy}
								onValueChange={this.handleServingSizeLabelChange}
						/>
					</div>
					<div className={combine(bs.flexGrow0, bs.px1, bs.mAuto)}>
						=
					</div>
					<div className={bs.flexGrow1}>
						<ControlledTextInput
								id={`serving_size_measurement_${ss.id}`}
								label={null}
								value={isNaN(ss.measurement) || ss.measurement === null ? "" : ss.measurement}
								disabled={editorBusy}
								onValueChange={this.handleServingSizeMeasurementChange}
						/>
					</div>
					<div className={combine(bs.flexGrow0, bs.pl1, bs.mAuto)}>
						{formatMeasurementUnit(currentValue.measurementUnit)}
					</div>
				</div>
		));
	}

	private handleBrandChange(brand: string): void {
		this.updateModel({ brand });
	}

	private handleNameChange(name: string): void {
		this.updateModel({ name });
	}

	private handleMeasurementUnitChange(measurementUnit: FoodMeasurementUnit): void {
		this.updateModel({ measurementUnit });
	}

	private handleCaloriesPer100Change(value: string): void {
		this.updateModel({ caloriesPer100: value === "" ? null : parseFloat(value) });
	}

	private handleCarbohydratePer100Change(value: string): void {
		this.updateModel({ carbohydratePer100: value === "" ? null : parseFloat(value) });
	}

	private handleSugarPer100Change(value: string): void {
		this.updateModel({ sugarPer100: value === "" ? null : parseFloat(value) });
	}

	private handleFatPer100Change(value: string): void {
		this.updateModel({ fatPer100: value === "" ? null : parseFloat(value) });
	}

	private handleSatFatPer100Change(value: string): void {
		this.updateModel({ satFatPer100: value === "" ? null : parseFloat(value) });
	}

	private handleProteinPer100Change(value: string): void {
		this.updateModel({ proteinPer100: value === "" ? null : parseFloat(value) });
	}

	private handleFibrePer100Change(value: string): void {
		this.updateModel({ fibrePer100: value === "" ? null : parseFloat(value) });
	}

	private handleSaltPer100Change(value: string): void {
		this.updateModel({ saltPer100: value === "" ? null : parseFloat(value) });
	}

	private handleServingSizeLabelChange(value: string, inputId: string): void {
		const ssId = inputId.replace("serving_size_label_", "");
		const originalServingSizes = this.state.currentValue.servingSizes || [];
		let servingSizes: IServingSize[];

		if (originalServingSizes.some((ss) => ss.id === ssId)) {
			// editing an existing one
			servingSizes = originalServingSizes.map((oss) => {
				if (oss.id === ssId) {
					return {
						...oss,
						label: value,
					};
				} else {
					return oss;
				}
			});
		} else {
			// creating a new one
			servingSizes = [...originalServingSizes, { ...(getDefaultServingSize(ssId)), label: value }];
		}

		this.updateModel({ servingSizes });
	}

	private handleServingSizeMeasurementChange(value: string, inputId: string): void {
		const cleanValue = value === "" ? null : parseFloat(value);
		const ssId = inputId.replace("serving_size_measurement_", "");
		const originalServingSizes = this.state.currentValue.servingSizes || [];
		let servingSizes: IServingSize[];

		if (originalServingSizes.some((ss) => ss.id === ssId)) {
			// editing an existing one
			servingSizes = originalServingSizes.map((oss) => {
				if (oss.id === ssId) {
					return {
						...oss,
						measurement: cleanValue,
					};
				} else {
					return oss;
				}
			});
		} else {
			// creating a new one
			servingSizes = [...originalServingSizes, { ...(getDefaultServingSize(ssId)), label: value }];
		}

		this.updateModel({ servingSizes });
	}

	private handleSubmit(): void {
		this.props.actions.startSaveFoodItem(this.state.currentValue);
	}

	private updateModel(foodItem: Partial<IFoodItem>): void {
		const updatedFoodItem = {
			...this.state.currentValue,
			...foodItem,
		};
		this.setState({
			currentValue: updatedFoodItem,
			validationResult: validateFoodItem(updatedFoodItem),
		});
	}
}

export const EditFoodItemPage = connect(mapStateToProps, mapDispatchToProps)(UCEditFoodItemPage);
