import { faAppleAlt, faCalendarDay } from "@fortawesome/pro-light-svg-icons";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { IDiaryEntry } from "../../../commons/models/IDiaryEntry";
import { IExerciseEntry } from "../../../commons/models/IExerciseEntry";
import { calculateTotalMacroSummary, generateMacroSummary, IMacroSummary } from "../../../commons/models/IMacroSummary";
import { ITarget } from "../../../commons/models/ITarget";
import { momentToDateKey, momentToUrlString, utcMoment } from "../../../commons/utils/dates";
import * as bs from "../../global-styles/Bootstrap.scss";
import { renderMacroSummary } from "../../helpers/rendering";
import { combine } from "../../helpers/style-helpers";
import { DiaryEntriesCacheKeys, startDeleteDiaryEntry, startLoadDiaryEntriesForDate } from "../../redux/diary-entries";
import {
	ExerciseEntriesCacheKeys,
	startDeleteExerciseEntry,
	startLoadExerciseEntriesForDate,
} from "../../redux/exercise-entries";
import { KeyCache } from "../../redux/helpers/KeyCache";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { startLoadAllTargets } from "../../redux/targets";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";

interface IDashboardPageProps {
	readonly updateTime?: number;
	readonly loadedExerciseEntriesByDate?: { readonly [key: string]: IExerciseEntry[] };
	readonly loadedDiaryEntriesByDate?: { readonly [key: string]: IDiaryEntry[] };
	readonly allTargets?: ITarget[];
	readonly actions?: {
		readonly loadExerciseEntriesForDate: (date: Moment.Moment) => PayloadAction;
		readonly loadDiaryEntriesForDate: (date: Moment.Moment) => PayloadAction;
		readonly deleteExerciseEntry: (exerciseEntry: IExerciseEntry) => PayloadAction;
		readonly deleteDiaryEntry: (diaryEntry: IDiaryEntry) => PayloadAction;
		readonly loadAllTargets: () => PayloadAction;
	};

	// added by connected react router
	readonly match?: Match<{ readonly date: string }>;
}

function mapStateToProps(state: IRootState, props: IDashboardPageProps): IDashboardPageProps {
	return {
		...props,
		updateTime: Math.max(
				KeyCache.getKeyTime(DiaryEntriesCacheKeys.LATEST_UPDATE_TIME),
				KeyCache.getKeyTime(ExerciseEntriesCacheKeys.LATEST_UPDATE_TIME),
		),
		loadedExerciseEntriesByDate: state.exerciseEntries.loadedExerciseEntriesByDate,
		loadedDiaryEntriesByDate: state.diaryEntries.loadedDiaryEntriesByDate,
		allTargets: state.targets.allTargets,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IDashboardPageProps): IDashboardPageProps {
	return {
		...props,
		actions: {
			loadExerciseEntriesForDate: (date: Moment.Moment) => dispatch(startLoadExerciseEntriesForDate(date)),
			loadDiaryEntriesForDate: (date: Moment.Moment) => dispatch(startLoadDiaryEntriesForDate(date)),
			deleteExerciseEntry: (exerciseEntry: IExerciseEntry) => dispatch(startDeleteExerciseEntry(exerciseEntry)),
			deleteDiaryEntry: (diaryEntry: IDiaryEntry) => dispatch(startDeleteDiaryEntry(diaryEntry)),
			loadAllTargets: () => dispatch(startLoadAllTargets()),
		},
	};
}

class UCDashboardPage extends PureComponent<IDashboardPageProps> {

	constructor(props: IDashboardPageProps, context: any) {
		super(props, context);

		this.renderSummaryForToday = this.renderSummaryForToday.bind(this);
		this.renderSummaryForLast7Days = this.renderSummaryForLast7Days.bind(this);
		this.renderSummaryForDates = this.renderSummaryForDates.bind(this);
		this.getTargetForDate = this.getTargetForDate.bind(this);
	}

	public componentDidMount(): void {
		const today = utcMoment();

		for (let i = 0; i < 8; ++i) {
			this.props.actions.loadExerciseEntriesForDate(today.clone().subtract(i, "day"));
			this.props.actions.loadDiaryEntriesForDate(today.clone().subtract(i, "day"));
		}

		this.props.actions.loadAllTargets();
	}

	public render(): ReactNode {
		return (
				<ContentWrapper>
					<div className={bs.row}>
						<div className={bs.col}>
							<h5>Today</h5>
						</div>
					</div>

					{this.renderSummaryForToday()}

					<hr/>

					<div className={bs.row}>
						<div className={bs.col}>
							<h5>Last 7 Days</h5>
						</div>
					</div>

					{this.renderSummaryForLast7Days()}
				</ContentWrapper>
		);
	}

	private renderSummaryForToday(): ReactNode {
		return this.renderSummaryForDates([utcMoment()]);
	}

	private renderSummaryForLast7Days(): ReactNode {
		const today = utcMoment();
		const dates: Moment.Moment[] = [];

		for (let i = 1; i <= 7; ++i) {
			dates.push(today.clone().subtract(i, "day"));
		}

		return this.renderSummaryForDates(dates);
	}

	private renderSummaryForDates(dates: Moment.Moment[]): ReactNode {
		const { loadedDiaryEntriesByDate, loadedExerciseEntriesByDate } = this.props;

		const allDiaryEntries = dates.map((d) => loadedDiaryEntriesByDate[momentToDateKey(d)]);
		const allExerciseEntries = dates.map((d) => loadedExerciseEntriesByDate[momentToDateKey(d)]);
		const allTargets = dates.map((d) => this.getTargetForDate(d));

		if (
				allDiaryEntries.some((e) => !e)
				|| allExerciseEntries.some((e) => !e)
				|| allTargets.some((t) => !t)
		) {
			return (
					<div className={bs.row}>
						<div className={bs.col}>
							<LoadingSpinner centre={true}/>
						</div>
					</div>
			);
		}

		const summaries: IMacroSummary[] = [];

		for (let i = 0; i < dates.length; ++i) {
			const diaryEntries = allDiaryEntries[i];
			const exerciseEntries = allExerciseEntries[i];
			const target = allTargets[i];

			summaries.push(generateMacroSummary(diaryEntries, exerciseEntries, target));
		}

		return renderMacroSummary(calculateTotalMacroSummary(summaries));
	}

	private getTargetForDate(date: Moment.Moment): ITarget {
		const { allTargets } = this.props;
		if (!allTargets || !allTargets.length) {
			return null;
		}

		const sortedTargets = allTargets.sort((a, b) => -1 * a.startDate.diff(b.startDate));

		// go through targets latest-first and pick the first one that is before today
		for (const target of sortedTargets) {
			if (target.startDate.clone().startOf("day").isSameOrBefore(date)) {
				return target;
			}
		}

		return null;
	}
}

export const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(UCDashboardPage);
