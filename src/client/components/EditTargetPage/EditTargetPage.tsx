import { faBullseyeArrow, faCircleNotch, faRedoAlt, faSave } from "@fortawesome/pro-light-svg-icons";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { getDefaultTarget, ITarget, ITargetValidationResult, validateTarget } from "../../../commons/models/ITarget";
import { formatDate } from "../../../commons/utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { setEditorResult, startLoadTarget, startSaveTarget } from "../../redux/targets";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledForm } from "../_ui/ControlledForm/ControlledForm";
import { ControlledDateInput } from "../_ui/ControlledInputs/ControlledDateInput";
import { ControlledSelectInput } from "../_ui/ControlledInputs/ControlledSelectInput";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";

interface IEditTargetPageProps {
	readonly editorBusy?: boolean;
	readonly editorResult?: ActionResult;
	readonly loadedTarget?: ITarget;
	readonly actions?: {
		readonly resetEditorResult: () => PayloadAction;
		readonly startLoadTarget: () => PayloadAction;
		readonly startSaveTarget: (target: ITarget) => PayloadAction;
	};

	// added by connected react router
	readonly match?: Match<{ readonly targetId: string }>;
}

interface IEditTargetPageState {
	readonly currentValue: ITarget;
	readonly validationResult: ITargetValidationResult;
}

function mapStateToProps(state: IRootState, props: IEditTargetPageProps): IEditTargetPageProps {
	const targetId = props.match.params.targetId;
	return {
		...props,
		editorBusy: state.targets.editorBusy,
		editorResult: state.targets.editorResult,
		loadedTarget: state.targets.loadedTargets[targetId],
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IEditTargetPageProps): IEditTargetPageProps {
	const targetId = props.match.params.targetId;
	return {
		...props,
		actions: {
			resetEditorResult: () => dispatch(setEditorResult(undefined)),
			startLoadTarget: () => dispatch(startLoadTarget(targetId)),
			startSaveTarget: (target) => dispatch(startSaveTarget(target)),
		},
	};
}

class UCEditTargetPage extends PureComponent<IEditTargetPageProps, IEditTargetPageState> {

	constructor(props: IEditTargetPageProps, context: any) {
		super(props, context);

		this.resetEditor(true);

		this.resetEditor = this.resetEditor.bind(this);
		this.handleStartDateChange = this.handleStartDateChange.bind(this);
		this.handleBaselineCaloriesPerDayChange = this.handleBaselineCaloriesPerDayChange.bind(this);
		this.handleCalorieAdjustmentChange = this.handleCalorieAdjustmentChange.bind(this);
		this.handleProportionCarbohydratesChange = this.handleProportionCarbohydratesChange.bind(this);
		this.handleProportionFatChange = this.handleProportionFatChange.bind(this);
		this.handleProportionProteinChange = this.handleProportionProteinChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.updateModel = this.updateModel.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.resetEditorResult();

		const targetId = this.props.match.params.targetId;
		if (targetId) {
			this.props.actions.startLoadTarget();
		}
	}

	public componentDidUpdate(
			prevProps: Readonly<IEditTargetPageProps>,
			prevState: Readonly<IEditTargetPageState>,
			snapshot?: any,
	): void {
		const loadedTarget = this.props.loadedTarget;
		if (loadedTarget !== prevProps.loadedTarget || loadedTarget && !prevState.currentValue.id) {
			this.updateModel(loadedTarget);
		}
	}

	public render(): ReactNode {
		const { match, editorBusy, editorResult } = this.props;
		const { currentValue, validationResult } = this.state;
		const errors = validationResult.errors || {};

		const targetId = match.params.targetId;
		const creatingNew = !targetId;

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
								<Link to={"/targets"}>
									<IconBtn
											icon={faBullseyeArrow}
											text={"All Targets"}
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
							<h1>{creatingNew ? "Create" : "Edit"} Target</h1>
							<ControlledForm
									onSubmit={this.handleSubmit}
							>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledDateInput
												id={"startDate"}
												label={"Start Date"}
												value={formatDate(currentValue.startDate, "system") || ""}
												onValueChange={this.handleStartDateChange}
												disabled={editorBusy}
												error={errors.startDate}
										/>
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"baselineCalories"}
												label={"Maintenance Calories per Day"}
												placeholder={"Maintenance Calories per Day"}
												value={ControlledTextInput.safeNumericValue(currentValue.baselineCaloriesPerDay)}
												onValueChange={this.handleBaselineCaloriesPerDayChange}
												disabled={editorBusy}
												error={errors.baselineCaloriesPerDay}
												inputProps={{
													type: "number",
												}}
										/>
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledSelectInput
												id={"calorieAdjustment"}
												label={"Calorie Adjustment"}
												value={ControlledTextInput.safeNumericValue(currentValue.calorieAdjustment)}
												onValueChange={this.handleCalorieAdjustmentChange}
												disabled={editorBusy}
												error={errors.calorieAdjustment}
										>
											<option value={"0.9"}>-10%</option>
											<option value={"0.95"}>-5%</option>
											<option value={"1"}>0%</option>
											<option value={"1.05"}>+5%</option>
											<option value={"1.1"}>+10%</option>
										</ControlledSelectInput>
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"proportionCarbohydrates"}
												label={"Carbohydrates Proportion"}
												placeholder={"Carbohydrates Proportion"}
												value={ControlledTextInput.safeNumericValue(currentValue.proportionCarbohydrates)}
												onValueChange={this.handleProportionCarbohydratesChange}
												disabled={editorBusy}
												error={errors.proportionCarbohydrates}
												inputProps={{
													type: "number",
													step: 0.1,
													min: 0,
													max: 1,
												}}
										/>
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"proportionFat"}
												label={"Fat Proportion"}
												placeholder={"Fat Proportion"}
												value={ControlledTextInput.safeNumericValue(currentValue.proportionFat)}
												onValueChange={this.handleProportionFatChange}
												disabled={editorBusy}
												error={errors.proportionFat}
												inputProps={{
													type: "number",
													step: 0.1,
													min: 0,
													max: 1,
												}}
										/>
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"proportionProtein"}
												label={"Protein Proportion"}
												placeholder={"Protein Proportion"}
												value={ControlledTextInput.safeNumericValue(currentValue.proportionProtein)}
												onValueChange={this.handleProportionProteinChange}
												disabled={editorBusy}
												error={errors.proportionProtein}
												inputProps={{
													type: "number",
													step: 0.1,
													min: 0,
													max: 1,
												}}
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
													style: {
														width: "100%",
													},
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
		const { actions } = this.props;

		actions.resetEditorResult();

		const target = {
			...getDefaultTarget(),
		};

		if (init) {
			this.state = {
				currentValue: target,
				validationResult: validateTarget(target),
			};
		} else {
			// reset the URL as well
			history.push(`/targets/edit`);

			this.setState({
				currentValue: target,
				validationResult: validateTarget(target),
			});
		}
	}

	private handleStartDateChange(startDate: Moment.Moment): void {
		this.updateModel({ startDate: startDate.startOf("day") });
	}

	private handleBaselineCaloriesPerDayChange(value: string): void {
		this.updateModel({ baselineCaloriesPerDay: value === "" ? null : parseFloat(value) });
	}

	private handleCalorieAdjustmentChange(value: string): void {
		this.updateModel({ calorieAdjustment: value === null ? 1 : parseFloat(value) });
	}

	private handleProportionCarbohydratesChange(value: string): void {
		this.updateModel({ proportionCarbohydrates: value === "" ? null : parseFloat(value) });
	}

	private handleProportionFatChange(value: string): void {
		this.updateModel({ proportionFat: value === "" ? null : parseFloat(value) });
	}

	private handleProportionProteinChange(value: string): void {
		this.updateModel({ proportionProtein: value === "" ? null : parseFloat(value) });
	}

	private handleSubmit(): void {
		this.props.actions.startSaveTarget(this.state.currentValue);
	}

	private updateModel(target: Partial<ITarget>): void {
		const updatedTarget = {
			...this.state.currentValue,
			...target,
		};
		this.setState({
			currentValue: updatedTarget,
			validationResult: validateTarget(updatedTarget),
		});
	}
}

export const EditTargetPage = connect(mapStateToProps, mapDispatchToProps)(UCEditTargetPage);
