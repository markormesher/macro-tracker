import { faPencil, faPlus } from "@fortawesome/pro-light-svg-icons";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Link, match as Match } from "react-router-dom";
import { Dispatch } from "redux";
import { Meal } from "../../../commons/enums";
import { IDiaryEntry } from "../../../commons/models/IDiaryEntry";
import { IExerciseEntry } from "../../../commons/models/IExerciseEntry";
import { IMacroSummary } from "../../../commons/models/IMacroSummary";
import { momentToDateKey, momentToUrlString, urlStringToMoment } from "../../../commons/utils/dates";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { formatLargeNumber, formatMeasurement, getMealTitle } from "../../helpers/formatters";
import { renderMacroSummary } from "../../helpers/rendering";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { DiaryEntriesCacheKeys, startDeleteDiaryEntry, startLoadDiaryEntriesForDate } from "../../redux/diary-entries";
import {
	ExerciseEntriesCacheKeys,
	startDeleteExerciseEntry,
	startLoadExerciseEntriesForDate,
} from "../../redux/exercise-entries";
import { FoodItemsCacheKeys } from "../../redux/food-items";
import { KeyCache } from "../../redux/helpers/KeyCache";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { startLoadMacroSummaryForDate } from "../../redux/macro-summaries";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import { DateScroller } from "../DateScroller/DateScroller";

// TODO: WAY too many network requests being made on each page load

interface IDiaryPageProps {
	readonly updateTime?: number;
	readonly currentDate: Moment.Moment;
	readonly loadedMacroSummariesByDate?: { readonly [key: string]: IMacroSummary };
	readonly loadedExerciseEntriesByDate?: { readonly [key: string]: IExerciseEntry[] };
	readonly loadedDiaryEntriesByDate?: { readonly [key: string]: IDiaryEntry[] };
	readonly actions?: {
		readonly loadMacroSummaryForDate: (date: Moment.Moment) => PayloadAction;
		readonly loadExerciseEntriesForDate: (date: Moment.Moment) => PayloadAction;
		readonly loadDiaryEntriesForDate: (date: Moment.Moment) => PayloadAction;
		readonly deleteExerciseEntry: (exerciseEntry: IExerciseEntry) => PayloadAction;
		readonly deleteDiaryEntry: (diaryEntry: IDiaryEntry) => PayloadAction;
	};

	// added by connected react router
	readonly match?: Match<{ readonly date: string }>;
}

function mapStateToProps(state: IRootState, props: IDiaryPageProps): IDiaryPageProps {
	const date = props.match.params.date ? urlStringToMoment(props.match.params.date) : Moment();

	return {
		...props,
		updateTime: Math.max(
				KeyCache.getKeyTime(DiaryEntriesCacheKeys.LATEST_UPDATE_TIME),
				KeyCache.getKeyTime(ExerciseEntriesCacheKeys.LATEST_UPDATE_TIME),
				KeyCache.getKeyTime(FoodItemsCacheKeys.LATEST_UPDATE_TIME),
		),
		currentDate: date,
		loadedMacroSummariesByDate: state.macroSummaries.loadedMacroSummariesByDate,
		loadedExerciseEntriesByDate: state.exerciseEntries.loadedExerciseEntriesByDate,
		loadedDiaryEntriesByDate: state.diaryEntries.loadedDiaryEntriesByDate,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IDiaryPageProps): IDiaryPageProps {
	return {
		...props,
		actions: {
			loadMacroSummaryForDate: (date: Moment.Moment) => dispatch(startLoadMacroSummaryForDate(date)),
			loadExerciseEntriesForDate: (date: Moment.Moment) => dispatch(startLoadExerciseEntriesForDate(date)),
			loadDiaryEntriesForDate: (date: Moment.Moment) => dispatch(startLoadDiaryEntriesForDate(date)),
			deleteExerciseEntry: (exerciseEntry: IExerciseEntry) => dispatch(startDeleteExerciseEntry(exerciseEntry)),
			deleteDiaryEntry: (diaryEntry: IDiaryEntry) => dispatch(startDeleteDiaryEntry(diaryEntry)),
		},
	};
}

class UCDiaryPage extends PureComponent<IDiaryPageProps> {

	private static startEditExerciseEntry(exerciseEntry: IExerciseEntry): void {
		history.push(`/exercise-entries/edit/${exerciseEntry.id}`);
	}

	private static startEditDiaryEntry(diaryEntry: IDiaryEntry): void {
		history.push(`/diary-entries/edit/${diaryEntry.id}`);
	}

	private static handleDateChange(date: Moment.Moment): void {
		history.push(`/diary-entries/${momentToUrlString(date)}`);
	}

	constructor(props: IDiaryPageProps, context: any) {
		super(props, context);

		this.renderInner = this.renderInner.bind(this);
		this.renderExercise = this.renderExercise.bind(this);
		this.renderMeal = this.renderMeal.bind(this);
		this.renderExerciseEntry = this.renderExerciseEntry.bind(this);
		this.renderDiaryEntry = this.renderDiaryEntry.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.loadMacroSummaryForDate(this.props.currentDate);
		this.props.actions.loadExerciseEntriesForDate(this.props.currentDate);
		this.props.actions.loadDiaryEntriesForDate(this.props.currentDate);
	}

	public componentDidUpdate(
			prevProps: Readonly<IDiaryPageProps>,
			prevState: Readonly<{}>,
			snapshot?: any,
	): void {
		const props = this.props;
		if (props.currentDate !== prevProps.currentDate || props.updateTime !== prevProps.updateTime) {
			props.actions.loadMacroSummaryForDate(props.currentDate);
			props.actions.loadExerciseEntriesForDate(props.currentDate);
			props.actions.loadDiaryEntriesForDate(props.currentDate);
		}
	}

	public render(): ReactNode {
		const { currentDate } = this.props;

		return (
				<>
					<DateScroller
							currentDate={currentDate}
							onDateChange={UCDiaryPage.handleDateChange}
					/>
					{this.renderInner()}
				</>
		);
	}

	private renderInner(): ReactNode {
		const {
			currentDate, loadedMacroSummariesByDate, loadedDiaryEntriesByDate,
			loadedExerciseEntriesByDate,
		} = this.props;

		const summary = loadedMacroSummariesByDate[momentToDateKey(currentDate)];
		const diaryEntries = loadedDiaryEntriesByDate[momentToDateKey(currentDate)];
		const exerciseEntries = loadedExerciseEntriesByDate[momentToDateKey(currentDate)];

		if (!summary || !diaryEntries || !exerciseEntries) {
			return (
					<ContentWrapper>
						<LoadingSpinner centre={true}/>
					</ContentWrapper>
			);
		}

		return (
				<ContentWrapper>
					<div className={bs.row}>
						<div className={bs.col}>
							{this.renderSummary()}
						</div>
					</div>
					{this.renderExercise()}
					{this.renderMeal("snacks_1")}
					{this.renderMeal("breakfast")}
					{this.renderMeal("snacks_2")}
					{this.renderMeal("lunch")}
					{this.renderMeal("snacks_3")}
					{this.renderMeal("dinner")}
					{this.renderMeal("snacks_4")}
				</ContentWrapper>
		);
	}

	private renderSummary(): ReactNode {
		const { currentDate, loadedMacroSummariesByDate } = this.props;
		const summary = loadedMacroSummariesByDate[momentToDateKey(currentDate)];
		return renderMacroSummary(summary);
	}

	private renderExercise(): ReactNode {
		const { currentDate, loadedExerciseEntriesByDate } = this.props;

		const entries = loadedExerciseEntriesByDate[momentToDateKey(currentDate)];

		if (!entries) {
			return null;
		}

		let renderedEntries: ReactNode;
		if (!entries.length) {
			renderedEntries = <p><em className={bs.textMuted}>No entries yet.</em></p>;
		} else {
			renderedEntries = entries.map((e) => this.renderExerciseEntry(e));
		}

		return (
				<>
					<hr/>
					<div className={bs.dFlex}>
						<h5 className={bs.flexGrow1}>
							Exercise
						</h5>
						<Link
								to={`/exercise-entries/edit?initDate=${momentToUrlString(currentDate)}`}
								className={combine(bs.dInlineBlock, bs.flexGrow0)}
						>
							<IconBtn
									icon={faPlus}
									text={"Add"}
									btnProps={{
										className: combine(bs.btnOutlineDark, gs.btnMini),
									}}
							/>
						</Link>
					</div>
					{renderedEntries}
				</>
		);
	}

	private renderMeal(meal: Meal): ReactNode {
		const { currentDate, loadedDiaryEntriesByDate } = this.props;

		const allEntries = loadedDiaryEntriesByDate[momentToDateKey(currentDate)];

		if (!allEntries) {
			return null;
		}

		const entries = allEntries
				.filter((e) => e.meal === meal)
				.sort((e1, e2) => e1.lastEdit.diff(e2.lastEdit));

		let renderedEntries: ReactNode;
		if (!entries.length) {
			renderedEntries = <p><em className={bs.textMuted}>No entries yet.</em></p>;
		} else {
			renderedEntries = entries.map((e) => this.renderDiaryEntry(e));
		}

		return (
				<>
					<hr/>
					<div className={bs.dFlex}>
						<h5 className={bs.flexGrow1}>
							{getMealTitle(meal)}
						</h5>
						<Link
								to={`/diary-entries/edit?initMeal=${meal}&initDate=${momentToUrlString(currentDate)}`}
								className={combine(bs.dInlineBlock, bs.flexGrow0)}
						>
							<IconBtn
									icon={faPlus}
									text={"Add"}
									btnProps={{
										className: combine(bs.btnOutlineDark, gs.btnMini),
									}}
							/>
						</Link>
					</div>
					{renderedEntries}
				</>
		);
	}

	private renderExerciseEntry(entry: IExerciseEntry): ReactNode {
		const { label, caloriesBurned } = entry;

		return (
				<div className={bs.dFlex} key={entry.id}>
					<p className={combine(bs.flexGrow1, bs.mb1)}>
						{label}
						<br/>
						<span className={combine(bs.textMuted, bs.small)}>
							{formatLargeNumber(caloriesBurned)} kcal
						</span>
					</p>
					<div
							className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0)}
							style={{ whiteSpace: "nowrap" }}
					>
						<IconBtn
								icon={faPencil}
								text={"Edit"}
								payload={entry}
								onClick={UCDiaryPage.startEditExerciseEntry}
								btnProps={{
									className: combine(bs.btnOutlineDark, gs.btnMini),
								}}
						/>
						<DeleteBtn
								payload={entry}
								onConfirmedClick={this.props.actions.deleteExerciseEntry}
								btnProps={{
									className: combine(bs.btnOutlineDark, gs.btnMini),
								}}
						/>
					</div>
				</div>
		);
	}

	private renderDiaryEntry(entry: IDiaryEntry): ReactNode {
		const { foodItem, servingSize } = entry;

		let totalMeasurement: number;
		if (servingSize) {
			totalMeasurement = entry.servingQty * servingSize.measurement;
		} else {
			totalMeasurement = entry.servingQty;
		}

		const infoChunks: ReactNode[] = [];

		infoChunks.push((
				<span key={`info-chunk-brand`} className={combine(bs.textMuted, bs.small)}>
					{foodItem.brand}
				</span>
		));

		if (servingSize) {
			infoChunks.push((
					<span key={`info-chunk-serving-size`} className={combine(bs.textMuted, bs.small)}>
						{entry.servingQty} {servingSize.label}
					</span>
			));
		} else {
			infoChunks.push((
					<span key={`info-chunk-serving-measurement`} className={combine(bs.textMuted, bs.small)}>
					{formatMeasurement(totalMeasurement, foodItem.measurementUnit)}
				</span>
			));
		}

		infoChunks.push((
				<span key={`info-chunk-calories`} className={combine(bs.textMuted, bs.small)}>
					{formatLargeNumber(totalMeasurement * foodItem.caloriesPer100 / 100)} kcal
				</span>
		));

		for (let i = 1; i < infoChunks.length; i += 2) {
			infoChunks.splice(i, 0, (
					<span key={`spacer-${i}`} className={combine(bs.textMuted, bs.small, bs.mx1)}>
						&bull;
					</span>
			));
		}

		return (
				<div className={bs.dFlex} key={entry.id}>
					<p className={combine(bs.flexGrow1, bs.mb1)}>
						{foodItem.name}
						<br/>
						{infoChunks}
					</p>
					<div
							className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0, bs.myAuto)}
							style={{ whiteSpace: "nowrap" }}
					>
						<IconBtn
								icon={faPencil}
								text={"Edit"}
								payload={entry}
								onClick={UCDiaryPage.startEditDiaryEntry}
								btnProps={{
									className: combine(bs.btnOutlineDark, gs.btnMini),
								}}
						/>
						<DeleteBtn
								payload={entry}
								onConfirmedClick={this.props.actions.deleteDiaryEntry}
								btnProps={{
									className: combine(bs.btnOutlineDark, gs.btnMini),
								}}
						/>
					</div>
				</div>
		);
	}
}

export const DiaryPage = connect(mapStateToProps, mapDispatchToProps)(UCDiaryPage);
