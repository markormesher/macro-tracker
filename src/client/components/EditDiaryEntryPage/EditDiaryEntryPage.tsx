import { faCalendarDay, faCircleNotch, faRedoAlt, faSave } from "@fortawesome/pro-light-svg-icons";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { ALL_MEAL_VALUES, Meal } from "../../../commons/enums";
import {
	getDefaultDiaryEntry,
	IDiaryEntry,
	IDiaryEntryValidationResult,
	validateDiaryEntry,
} from "../../../commons/models/IDiaryEntry";
import { IFoodItem } from "../../../commons/models/IFoodItem";
import { IServingSize, servingSizeComparator } from "../../../commons/models/IServingSize";
import { momentToUrlString, urlStringToMoment } from "../../../commons/utils/dates";
import * as bs from "../../global-styles/Bootstrap.scss";
import { getMealTitle } from "../../helpers/formatters";
import { combine } from "../../helpers/style-helpers";
import { setEditorResult, startLoadDiaryEntry, startSaveDiaryEntry } from "../../redux/diary-entries";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledForm } from "../_ui/ControlledForm/ControlledForm";
import { ControlledSelectInput } from "../_ui/ControlledInputs/ControlledSelectInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import { FoodItemPicker } from "../FoodItemPicker/FoodItemPicker";
import { ServingPicker } from "../ServingPicker/ServingPicker";

interface IEditDiaryEntryPageProps {
	readonly editorBusy?: boolean;
	readonly editorResult?: ActionResult;
	readonly loadedDiaryEntry?: IDiaryEntry;
	readonly actions?: {
		readonly resetEditorResult: () => PayloadAction;
		readonly startLoadDiaryEntry: () => PayloadAction;
		readonly startSaveDiaryEntry: (diaryEntry: IDiaryEntry) => PayloadAction;
	};

	// derived from query string
	readonly initialDate?: Moment.Moment;
	readonly initialMeal?: Meal;
	readonly initialFoodItemId?: string;

	// added by connected react router
	readonly match?: Match<{ readonly diaryEntryId: string }>;
}

interface IEditDiaryEntryPageState {
	readonly currentValue: IDiaryEntry;
	readonly validationResult: IDiaryEntryValidationResult;
}

function mapStateToProps(state: IRootState, props: IEditDiaryEntryPageProps): IEditDiaryEntryPageProps {
	const diaryEntryId = props.match.params.diaryEntryId;
	const urlParams = new URLSearchParams(state.router.location.search);
	return {
		...props,
		editorBusy: state.diaryEntries.editorBusy,
		editorResult: state.diaryEntries.editorResult,
		loadedDiaryEntry: state.diaryEntries.loadedDiaryEntries[diaryEntryId],

		initialDate: urlParams.has("initDate") ? urlStringToMoment(urlParams.get("initDate")) : undefined,
		initialMeal: urlParams.has("initMeal") ? urlParams.get("initMeal") as Meal : undefined,
		initialFoodItemId: urlParams.has("initFood") ? urlParams.get("initFood") : undefined,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IEditDiaryEntryPageProps): IEditDiaryEntryPageProps {
	const diaryEntryId = props.match.params.diaryEntryId;
	return {
		...props,
		actions: {
			resetEditorResult: () => dispatch(setEditorResult(undefined)),
			startLoadDiaryEntry: () => dispatch(startLoadDiaryEntry(diaryEntryId)),
			startSaveDiaryEntry: (diaryEntry) => dispatch(startSaveDiaryEntry(diaryEntry)),
		},
	};
}

class UCEditDiaryEntryPage extends PureComponent<IEditDiaryEntryPageProps, IEditDiaryEntryPageState> {

	constructor(props: IEditDiaryEntryPageProps, context: any) {
		super(props, context);

		this.resetEditor(true);

		this.resetEditor = this.resetEditor.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleMealChange = this.handleMealChange.bind(this);
		this.handleFoodItemChange = this.handleFoodItemChange.bind(this);
		this.handleServingQtyChange = this.handleServingQtyChange.bind(this);
		this.handleServingSizeChange = this.handleServingSizeChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.updateModel = this.updateModel.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.resetEditorResult();

		const diaryEntryId = this.props.match.params.diaryEntryId;
		if (diaryEntryId) {
			this.props.actions.startLoadDiaryEntry();
		}
	}

	public componentDidUpdate(
			prevProps: Readonly<IEditDiaryEntryPageProps>,
			prevState: Readonly<IEditDiaryEntryPageState>,
			snapshot?: any,
	): void {
		const loadedDiaryEntry = this.props.loadedDiaryEntry;
		if (loadedDiaryEntry !== prevProps.loadedDiaryEntry || loadedDiaryEntry && !prevState.currentValue.id) {
			this.updateModel(loadedDiaryEntry);
		}
	}

	public render(): ReactNode {
		const { match, editorBusy, editorResult } = this.props;
		const { currentValue, validationResult } = this.state;
		const errors = validationResult.errors || {};

		const diaryEntryId = match.params.diaryEntryId;
		const creatingNew = !diaryEntryId;

		if (!creatingNew && !currentValue.id) {
			// still loading
			return <LoadingSpinner centre={true}/>;
		}

		let statusMsg: ReactNode = null;
		if (editorResult === "success") {
			return (
					<ContentWrapper>
						<div className={bs.row}>
							<div className={bs.col}>
								<h1>Done!</h1>
								<p>The entry has been saved.</p>
							</div>
						</div>
						<div className={bs.row}>
							<div className={bs.col6}>
								<Link to={`/diary-entries/${momentToUrlString(currentValue.date)}`}>
									<IconBtn
											icon={faCalendarDay}
											text={"Back to the Diary"}
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
								<IconBtn
										icon={faRedoAlt}
										text={"Add Another"}
										onClick={this.resetEditor}
										btnProps={{
											className: bs.btnOutlineDark,
											style: {
												width: "100%",
											},
										}}
								/>
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
							<h1>{creatingNew ? "Create" : "Edit"} Diary Entry</h1>
							<ControlledForm
									onSubmit={this.handleSubmit}
							>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledSelectInput
												id={"meal"}
												label={"Meal"}
												value={currentValue.meal || ""}
												onValueChange={this.handleMealChange}
												disabled={editorBusy}
												error={errors.meal}
										>
											{ALL_MEAL_VALUES.map((m) => (
													<option value={m} key={m}>
														{getMealTitle(m)}
													</option>
											))}
										</ControlledSelectInput>
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<FoodItemPicker
												value={currentValue.foodItem}
												onValueChange={this.handleFoodItemChange}
												inputProps={{
													label: "Food",
													disabled: editorBusy,
													error: errors.foodItem,
												}}
										/>
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<label>How Much?</label>
										<ServingPicker
												foodItem={currentValue.foodItem}
												servingQty={currentValue.servingQty}
												servingSize={currentValue.servingSize}
												disabled={editorBusy}
												onServingQtyChange={this.handleServingQtyChange}
												onServingSizeChange={this.handleServingSizeChange}
										/>
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

	private resetEditor(init: boolean = false): void {
		this.props.actions.resetEditorResult();

		const defaultDiaryEntry = {
			...(getDefaultDiaryEntry()),
			date: init ? this.props.initialDate : this.state.currentValue.date,
			meal: init ? this.props.initialMeal : this.state.currentValue.meal,
			// TODO: use initialFoodItemId
		};

		if (init) {
			this.state = {
				currentValue: defaultDiaryEntry,
				validationResult: validateDiaryEntry(defaultDiaryEntry),
			};
		} else {
			this.setState({
				currentValue: defaultDiaryEntry,
				validationResult: validateDiaryEntry(defaultDiaryEntry),
			});
		}
	}

	private handleDateChange(date: Moment.Moment): void {
		this.updateModel({ date });
	}

	private handleMealChange(meal: string): void {
		this.updateModel({ meal: meal as Meal });
	}

	private handleFoodItemChange(foodItem: IFoodItem): void {
		const servingSize = foodItem && foodItem.servingSizes.length
				? foodItem.servingSizes.sort(servingSizeComparator)[0]
				: undefined;
		this.updateModel({ foodItem, servingSize });
	}

	private handleServingQtyChange(servingQty: number): void {
		this.updateModel({ servingQty });
	}

	private handleServingSizeChange(servingSize: IServingSize): void {
		this.updateModel({ servingSize });
	}

	private handleSubmit(): void {
		this.props.actions.startSaveDiaryEntry(this.state.currentValue);
	}

	private updateModel(diaryEntry: Partial<IDiaryEntry>): void {
		const updatedDiaryEntry = {
			...this.state.currentValue,
			...diaryEntry,
		};
		this.setState({
			currentValue: updatedDiaryEntry,
			validationResult: validateDiaryEntry(updatedDiaryEntry),
		});
	}
}

export const EditDiaryEntryPage = connect(mapStateToProps, mapDispatchToProps)(UCEditDiaryEntryPage);
