import { faPencil, faPlus } from "@fortawesome/pro-light-svg-icons";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Link, match as Match } from "react-router-dom";
import { Dispatch } from "redux";
import { CALORIES_PER_G_CARBOHYDRATES, CALORIES_PER_G_FAT, CALORIES_PER_G_PROTEIN } from "../../../commons/constants";
import { Meal } from "../../../commons/enums";
import { IDiaryEntry } from "../../../commons/models/IDiaryEntry";
import { ITarget } from "../../../commons/models/ITarget";
import { momentToDateKey, momentToUrlString, urlStringToMoment } from "../../../commons/utils/dates";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { formatDate, formatLargeNumber, formatMeasurement, getMealTitle } from "../../helpers/formatters";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { startDeleteDiaryEntry, startLoadDiaryEntriesForDate } from "../../redux/diary-entries";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { startLoadAllTargets } from "../../redux/targets";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import { ProgressBar } from "../_ui/ProgressBar/ProgressBar";
import { DateScroller } from "../DateScroller/DateScroller";

interface IDiaryPageProps {
	readonly currentDate: Moment.Moment;
	readonly loadedDiaryEntriesByDate?: { readonly [key: string]: IDiaryEntry[] };
	readonly allTargets?: ITarget[];
	readonly actions?: {
		readonly loadDiaryEntriesForDate: (date: Moment.Moment) => PayloadAction;
		readonly deleteDiaryEntry: (diaryEntry: IDiaryEntry) => PayloadAction;
		readonly loadAllTargets: () => PayloadAction;
	};

	// added by connected react router
	readonly match?: Match<{ readonly date: string }>;
}

function mapStateToProps(state: IRootState, props: IDiaryPageProps): IDiaryPageProps {
	const date = props.match.params.date ? urlStringToMoment(props.match.params.date) : Moment();

	return {
		...props,
		currentDate: date,
		loadedDiaryEntriesByDate: state.diaryEntries.loadedDiaryEntriesByDate,
		allTargets: state.targets.allTargets,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IDiaryPageProps): IDiaryPageProps {
	return {
		...props,
		actions: {
			loadDiaryEntriesForDate: (date: Moment.Moment) => dispatch(startLoadDiaryEntriesForDate(date)),
			deleteDiaryEntry: (diaryEntry: IDiaryEntry) => dispatch(startDeleteDiaryEntry(diaryEntry)),
			loadAllTargets: () => dispatch(startLoadAllTargets()),
		},
	};
}

class UCDiaryPage extends PureComponent<IDiaryPageProps> {

	private static startEditDiaryEntry(diaryEntry: IDiaryEntry): void {
		history.push(`/diary-entries/edit/${diaryEntry.id}`);
	}

	private static handleDateChange(date: Moment.Moment): void {
		history.push(`/diary-entries/${momentToUrlString(date)}`);
	}

	constructor(props: IDiaryPageProps, context: any) {
		super(props, context);

		this.renderInner = this.renderInner.bind(this);
		this.renderMeal = this.renderMeal.bind(this);
		this.renderEntry = this.renderEntry.bind(this);
		UCDiaryPage.handleDateChange = UCDiaryPage.handleDateChange.bind(this);
		this.getCurrentTarget = this.getCurrentTarget.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.loadDiaryEntriesForDate(this.props.currentDate);
		this.props.actions.loadAllTargets();
	}

	public componentDidUpdate(
			prevProps: Readonly<IDiaryPageProps>,
			prevState: Readonly<{}>,
			snapshot?: any,
	): void {
		if (this.props.currentDate !== prevProps.currentDate) {
			this.props.actions.loadDiaryEntriesForDate(this.props.currentDate);
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
		const { currentDate, loadedDiaryEntriesByDate } = this.props;

		const entries = loadedDiaryEntriesByDate[momentToDateKey(currentDate)];

		if (!entries) {
			return (
					<ContentWrapper>
						<LoadingSpinner centre={true}/>
					</ContentWrapper>
			);
		}

		return (
				<ContentWrapper>
					{this.renderSummary(entries)}
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

	private renderSummary(allEntries: IDiaryEntry[]): ReactNode {
		const { currentDate } = this.props;
		const target = this.getCurrentTarget();

		if (!target) {
			return <p>No target set for {formatDate(currentDate, "user")}.</p>;
		}

		const targetCalories = target.baselineCaloriesPerDay; // TODO: plus exercise
		const targetCarbohydrates = targetCalories * target.proportionCarbohydrates / CALORIES_PER_G_CARBOHYDRATES;
		const targetProtein = targetCalories * target.proportionProtein / CALORIES_PER_G_PROTEIN;
		const targetFat = targetCalories * target.proportionFat / CALORIES_PER_G_FAT;

		const totalCalories = allEntries
				.map((e) => e.foodItem.caloriesPer100 * e.servingQty * (e.servingSize ? e.servingSize.measurement : 1) / 100)
				.reduce((a, b) => a + b, 0);
		const totalCarbohydrates = allEntries
				.map((e) => e.foodItem.carbohydratePer100 * e.servingQty * (e.servingSize ? e.servingSize.measurement : 1) / 100)
				.reduce((a, b) => a + b, 0);
		const totalProtein = allEntries
				.map((e) => e.foodItem.proteinPer100 * e.servingQty * (e.servingSize ? e.servingSize.measurement : 1) / 100)
				.reduce((a, b) => a + b, 0);
		const totalFat = allEntries
				.map((e) => e.foodItem.fatPer100 * e.servingQty * (e.servingSize ? e.servingSize.measurement : 1) / 100)
				.reduce((a, b) => a + b, 0);

		return (
				<div className={bs.row}>
					<div className={bs.col}>
						<ProgressBar
								label={"Calories"}
								value={totalCalories}
								total={targetCalories}
								wrapperClasses={bs.mb1}
						/>
						<ProgressBar
								label={"Carbohydrates"}
								value={totalCarbohydrates}
								total={targetCarbohydrates}
								unit={"g"}
								wrapperClasses={bs.mb1}
						/>
						<ProgressBar
								label={"Protein"}
								value={totalProtein}
								total={targetProtein}
								unit={"g"}
								wrapperClasses={bs.mb1}
						/>
						<ProgressBar
								label={"Fat"}
								value={totalFat}
								total={targetFat}
								unit={"g"}
						/>
					</div>
				</div>
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
			renderedEntries = entries.map((e) => this.renderEntry(e));
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

	private renderEntry(entry: IDiaryEntry): ReactNode {
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
							className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0)}
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
						{/*	TODO: trigger reload on delete */}
					</div>
				</div>
		);
	}

	private getCurrentTarget(): ITarget {
		const { currentDate, allTargets } = this.props;
		if (!allTargets || !allTargets.length) {
			return null;
		}

		const sortedTargets = allTargets.sort((a, b) => -1 * a.startDate.diff(b.startDate));

		// go through targets latest-first and pick the first one that is before today
		for (const target of sortedTargets) {
			if (target.startDate.clone().startOf("day").isSameOrBefore(currentDate)) {
				return target;
			}
		}

		return null;
	}
}

export const DiaryPage = connect(mapStateToProps, mapDispatchToProps)(UCDiaryPage);
