import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Dispatch } from "redux";
import { calculateTotalMacroSummary, IMacroSummary } from "../../../commons/models/IMacroSummary";
import { momentToDateKey, utcMoment } from "../../../commons/utils/dates";
import * as bs from "../../global-styles/Bootstrap.scss";
import { renderMacroSummary } from "../../helpers/rendering";
import { DiaryEntriesCacheKeys } from "../../redux/diary-entries";
import { ExerciseEntriesCacheKeys } from "../../redux/exercise-entries";
import { FoodItemsCacheKeys } from "../../redux/food-items";
import { KeyCache } from "../../redux/helpers/KeyCache";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { startLoadMacroSummaryForDate } from "../../redux/macro-summaries";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";

interface IDashboardPageProps {
	readonly updateTime?: number;
	readonly loadedMacroSummariesByDate?: { readonly [key: string]: IMacroSummary };
	readonly actions?: {
		readonly loadMacroSummaryForDate: (date: Moment.Moment) => PayloadAction;
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
				KeyCache.getKeyTime(FoodItemsCacheKeys.LATEST_UPDATE_TIME),
		),
		loadedMacroSummariesByDate: state.macroSummaries.loadedMacroSummariesByDate,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IDashboardPageProps): IDashboardPageProps {
	return {
		...props,
		actions: {
			loadMacroSummaryForDate: (date: Moment.Moment) => dispatch(startLoadMacroSummaryForDate(date)),
		},
	};
}

class UCDashboardPage extends PureComponent<IDashboardPageProps> {

	constructor(props: IDashboardPageProps, context: any) {
		super(props, context);

		this.renderSummaryForToday = this.renderSummaryForToday.bind(this);
		this.renderSummaryForLast7Days = this.renderSummaryForLast7Days.bind(this);
		this.renderSummaryForDates = this.renderSummaryForDates.bind(this);
		this.loadData = this.loadData.bind(this);
	}

	public componentDidMount(): void {
		this.loadData();
	}

	public componentDidUpdate(prevProps: Readonly<IDashboardPageProps>, prevState: Readonly<{}>, snapshot?: any): void {
		const props = this.props;
		if (props.updateTime !== prevProps.updateTime) {
			this.loadData();
		}
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
		const { loadedMacroSummariesByDate } = this.props;

		const summaries = dates.map((d) => loadedMacroSummariesByDate[momentToDateKey(d)]);
		if (summaries.some((e) => !e)) {
			return (
					<div className={bs.row}>
						<div className={bs.col}>
							<LoadingSpinner centre={true}/>
						</div>
					</div>
			);
		}

		return renderMacroSummary(calculateTotalMacroSummary(summaries));
	}

	private loadData(): void {
		const today = utcMoment();

		for (let i = 0; i < 8; ++i) {
			this.props.actions.loadMacroSummaryForDate(today.clone().subtract(i, "day"));
		}
	}
}

export const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(UCDashboardPage);
