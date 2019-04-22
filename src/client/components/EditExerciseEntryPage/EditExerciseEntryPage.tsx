import { faCalendarDay, faCircleNotch, faRedoAlt, faSave } from "@fortawesome/pro-light-svg-icons";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import {
	getDefaultExerciseEntry,
	IExerciseEntry,
	IExerciseEntryValidationResult,
	validateExerciseEntry,
} from "../../../commons/models/IExerciseEntry";
import { momentToUrlString, urlStringToMoment } from "../../../commons/utils/dates";
import * as bs from "../../global-styles/Bootstrap.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import {
	setEditorResult,
	startLoadAllExerciseLabels,
	startLoadExerciseEntry,
	startSaveExerciseEntry
} from "../../redux/exercise-entries";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { startLoadAllTargets } from "../../redux/targets";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledForm } from "../_ui/ControlledForm/ControlledForm";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import { SuggestionTextInput } from "../_ui/SuggestionTextInput/SuggestionTextInput";

interface IEditExerciseEntryPageProps {
	readonly editorBusy?: boolean;
	readonly editorResult?: ActionResult;
	readonly loadedExerciseEntry?: IExerciseEntry;
	readonly allExerciseLabels?: string[];
	readonly actions?: {
		readonly resetEditorResult: () => PayloadAction;
		readonly startLoadExerciseEntry: () => PayloadAction;
		readonly startLoadAllExerciseLabels: () => PayloadAction;
		readonly startSaveExerciseEntry: (exerciseEntry: IExerciseEntry) => PayloadAction;
	};

	// derived from query string
	readonly initialDate?: Moment.Moment;

	// added by connected react router
	readonly match?: Match<{ readonly exerciseEntryId: string }>;
}

interface IEditExerciseEntryPageState {
	readonly currentValue: IExerciseEntry;
	readonly validationResult: IExerciseEntryValidationResult;
}

function mapStateToProps(state: IRootState, props: IEditExerciseEntryPageProps): IEditExerciseEntryPageProps {
	const exerciseEntryId = props.match.params.exerciseEntryId;
	const urlParams = new URLSearchParams(state.router.location.search);
	return {
		...props,
		editorBusy: state.exerciseEntries.editorBusy,
		editorResult: state.exerciseEntries.editorResult,
		loadedExerciseEntry: state.exerciseEntries.loadedExerciseEntries[exerciseEntryId],
		allExerciseLabels: state.exerciseEntries.allExerciseLabels,

		initialDate: urlParams.has("initDate") ? urlStringToMoment(urlParams.get("initDate")) : undefined,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IEditExerciseEntryPageProps): IEditExerciseEntryPageProps {
	const exerciseEntryId = props.match.params.exerciseEntryId;
	return {
		...props,
		actions: {
			resetEditorResult: () => dispatch(setEditorResult(undefined)),
			startLoadExerciseEntry: () => dispatch(startLoadExerciseEntry(exerciseEntryId)),
			startLoadAllExerciseLabels: () => dispatch(startLoadAllExerciseLabels()),
			startSaveExerciseEntry: (exerciseEntry) => dispatch(startSaveExerciseEntry(exerciseEntry)),
		},
	};
}

class UCEditExerciseEntryPage extends PureComponent<IEditExerciseEntryPageProps, IEditExerciseEntryPageState> {

	constructor(props: IEditExerciseEntryPageProps, context: any) {
		super(props, context);

		this.resetEditor(true);

		this.resetEditor = this.resetEditor.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleLabelChange = this.handleLabelChange.bind(this);
		this.handleCaloriesBurnedChange = this.handleCaloriesBurnedChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.updateModel = this.updateModel.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.resetEditorResult();
		this.props.actions.startLoadAllExerciseLabels();

		const exerciseEntryId = this.props.match.params.exerciseEntryId;
		if (exerciseEntryId) {
			this.props.actions.startLoadExerciseEntry();
		}
	}

	public componentDidUpdate(
			prevProps: Readonly<IEditExerciseEntryPageProps>,
			prevState: Readonly<IEditExerciseEntryPageState>,
			snapshot?: any,
	): void {
		const loadedExerciseEntry = this.props.loadedExerciseEntry;
		if (loadedExerciseEntry !== prevProps.loadedExerciseEntry || loadedExerciseEntry && !prevState.currentValue.id) {
			this.updateModel(loadedExerciseEntry);
		}
	}

	public render(): ReactNode {
		const { match, editorBusy, editorResult, allExerciseLabels } = this.props;
		const { currentValue, validationResult } = this.state;
		const errors = validationResult.errors || {};

		const exerciseEntryId = match.params.exerciseEntryId;
		const creatingNew = !exerciseEntryId;

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
							<h1>{creatingNew ? "Create" : "Edit"} Exercise Entry</h1>
							<ControlledForm
									onSubmit={this.handleSubmit}
							>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<SuggestionTextInput
												id={"label"}
												label={"Label"}
												value={currentValue.label || ""}
												onValueChange={this.handleLabelChange}
												disabled={editorBusy}
												error={errors.label}
												suggestionOptions={allExerciseLabels}
										/>
									</div>
								</div>
								<div className={bs.row}>
									<div className={combine(bs.col12, bs.formGroup)}>
										<ControlledTextInput
												id={"caloriesBurned"}
												label={"Calories Burned"}
												placeholder={"Calories Burned"}
												value={ControlledTextInput.safeNumericValue(currentValue.caloriesBurned)}
												onValueChange={this.handleCaloriesBurnedChange}
												disabled={editorBusy}
												error={errors.caloriesBurned}
												inputProps={{
													type: "number",
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

		// also reset the URL
		if (!init) {
			history.push("/exercise-entries/edit");
		}

		const defaultExerciseEntry = {
			...(getDefaultExerciseEntry()),
			date: init ? this.props.initialDate : this.state.currentValue.date,
		};

		if (init) {
			this.state = {
				currentValue: defaultExerciseEntry,
				validationResult: validateExerciseEntry(defaultExerciseEntry),
			};
		} else {
			this.setState({
				currentValue: defaultExerciseEntry,
				validationResult: validateExerciseEntry(defaultExerciseEntry),
			});
		}
	}

	private handleDateChange(date: Moment.Moment): void {
		this.updateModel({ date });
	}

	private handleLabelChange(label: string): void {
		this.updateModel({ label });
	}

	private handleCaloriesBurnedChange(value: string): void {
		this.updateModel({ caloriesBurned: value === "" ? null : parseFloat(value) });
	}

	private handleSubmit(): void {
		this.props.actions.startSaveExerciseEntry(this.state.currentValue);
	}

	private updateModel(exerciseEntry: Partial<IExerciseEntry>): void {
		const updatedExerciseEntry = {
			...this.state.currentValue,
			...exerciseEntry,
		};
		this.setState({
			currentValue: updatedExerciseEntry,
			validationResult: validateExerciseEntry(updatedExerciseEntry),
		});
	}
}

export const EditExerciseEntryPage = connect(mapStateToProps, mapDispatchToProps)(UCEditExerciseEntryPage);
