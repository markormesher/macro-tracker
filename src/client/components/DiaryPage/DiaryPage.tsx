import { faPencil, faPlus } from "@fortawesome/pro-light-svg-icons";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { Meal } from "../../../commons/enums";
import { IDiaryEntry } from "../../../commons/models/IDiaryEntry";
import { ITarget } from "../../../commons/models/ITarget";
import { momentToDateKey, momentToString } from "../../../commons/utils/dates";
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
import { DateScroller } from "../DateScroller/DateScroller";

interface IDiaryPageProps {
	readonly loadedDiaryEntriesByDate?: { readonly [key: string]: IDiaryEntry[] };
	readonly allTargets?: ITarget[];
	readonly actions?: {
		readonly loadDiaryEntriesForDate: (date: Moment.Moment) => PayloadAction;
		readonly deleteDiaryEntry: (diaryEntry: IDiaryEntry) => PayloadAction;
		readonly loadAllTargets: () => PayloadAction;
	};
}

interface IDiaryPageState {
	readonly currentDate: Moment.Moment;
}

function mapStateToProps(state: IRootState, props: IDiaryPageProps): IDiaryPageProps {
	return {
		...props,
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

class UCDiaryPage extends PureComponent<IDiaryPageProps, IDiaryPageState> {

	private static startEditDiaryEntry(diaryEntry: IDiaryEntry): void {
		history.push(`/diary-entries/edit/${diaryEntry.id}`);
	}

	constructor(props: IDiaryPageProps, context: any) {
		super(props, context);

		this.state = {
			currentDate: Moment(),
		};

		this.renderInner = this.renderInner.bind(this);
		this.renderMeal = this.renderMeal.bind(this);
		this.renderEntry = this.renderEntry.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.getCurrentTarget = this.getCurrentTarget.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.loadDiaryEntriesForDate(this.state.currentDate);
		this.props.actions.loadAllTargets();
	}

	public componentDidUpdate(
			prevProps: Readonly<IDiaryPageProps>,
			prevState: Readonly<IDiaryPageState>,
			snapshot?: any,
	): void {
		if (this.state.currentDate !== prevState.currentDate) {
			this.props.actions.loadDiaryEntriesForDate(this.state.currentDate);
		}
	}

	public render(): ReactNode {
		const { currentDate } = this.state;

		return (
				<>
					<DateScroller
							currentDate={currentDate}
							onDateChange={this.handleDateChange}
					/>
					{this.renderInner()}
				</>
		);
	}

	private renderInner(): ReactNode {
		const { loadedDiaryEntriesByDate } = this.props;
		const { currentDate } = this.state;

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
		const { currentDate } = this.state;
		const currentTarget = this.getCurrentTarget();

		if (!currentTarget) {
			return <p>No target set for {formatDate(currentDate, "user")}.</p>;
		}

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
				<div>
					<div className={combine(bs.progress, bs.mb1)}>
						<div
								className={combine(bs.progressBar)}
								style={{ width: `${totalCalories / 2800 * 100}%` }}
						>
								<span>
									Calories: {formatLargeNumber(totalCalories)} / {formatLargeNumber(2800)}
								</span>
						</div>
					</div>
					<div className={combine(bs.progress, bs.mb1)}>
						<div
								className={combine(bs.progressBar)}
								style={{ width: `${totalCarbohydrates / 280 * 100}%` }}
						>
								<span>
									Carbohydrates: {formatMeasurement(totalCarbohydrates, "g")} / {formatMeasurement(280, "g")}
								</span>
						</div>
					</div>
					<div className={combine(bs.progress, bs.mb1)}>
						<div
								className={combine(bs.progressBar)}
								style={{ width: `${totalProtein / 280 * 100}%` }}
						>
								<span>
									Protein: {formatMeasurement(totalProtein, "g")} / {formatMeasurement(280, "g")}
								</span>
						</div>
					</div>
					<div className={bs.progress}>
						<div
								className={combine(bs.progressBar)}
								style={{ width: `${totalFat / 63 * 100}%` }}
						>
								<span>
									Fat: {formatMeasurement(totalFat, "g")} / {formatMeasurement(63, "g")}
								</span>
						</div>
					</div>
				</div>
		);
	}

	private renderMeal(meal: Meal): ReactNode {
		const { loadedDiaryEntriesByDate } = this.props;
		const { currentDate } = this.state;

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
								to={`/diary-entries/edit?meal=${meal}&date=${momentToString(currentDate)}`}
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
		if (servingSize) {
			infoChunks.push((
					<span key={`info-chunk-serving-size`} className={combine(bs.textMuted, bs.small)}>
						{entry.servingQty} {servingSize.label}
					</span>
			));
		}

		infoChunks.push((
				<span key={`info-chunk-serving-measurement`} className={combine(bs.textMuted, bs.small)}>
					{formatMeasurement(totalMeasurement, foodItem.measurementUnit)}
				</span>
		));

		infoChunks.push((
				<span key={`info-chunk-calries`} className={combine(bs.textMuted, bs.small)}>
					{formatLargeNumber(totalMeasurement * foodItem.caloriesPer100 / 100)} kcal
				</span>
		));

		for (let i = 1; i < infoChunks.length; i += 2) {
			infoChunks.splice(i, 0, (
					<span key={`spacer-${i}`} className={combine(bs.textMuted, bs.small, bs.mx2)}>
						&bull;
					</span>
			));
		}

		return (
				<div className={bs.dFlex} key={entry.id}>
					<p className={combine(bs.flexGrow1, bs.mb1)}>
						{foodItem.brand} {foodItem.name}
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

	private handleDateChange(date: Moment.Moment): void {
		this.setState({ currentDate: date });
	}

	private getCurrentTarget(): ITarget {
		const { allTargets } = this.props;
		const { currentDate } = this.state;
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
