import { ChartDataSets, ChartLegendLabelItem } from "chart.js";
import * as Moment from "moment";
import { PureComponent, ReactNode } from "react";
import * as React from "react";
import { Line, LinearComponentProps } from "react-chartjs-2";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Dispatch } from "redux";
import { calculateTotalMacroSummary, IMacroSummary } from "../../../commons/models/IMacroSummary";
import { momentToDateKey, utcMoment } from "../../../commons/utils/dates";
import { formatDate, formatPercent } from "../../../commons/utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { chartColours, defaultDatasetProps } from "../../helpers/charts";
import { renderMacroSummary } from "../../helpers/rendering";
import { combine } from "../../helpers/style-helpers";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { startLoadMacroSummaryForDate } from "../../redux/macro-summaries";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";

interface IDashboardPageProps {
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

	private static HISTORY_DAYS = 7;

	private loadDataDebounceTimeout: NodeJS.Timer = undefined;

	constructor(props: IDashboardPageProps, context: any) {
		super(props, context);

		this.loadData = this.loadData.bind(this);
		this.renderToday = this.renderToday.bind(this);
		this.renderHistory = this.renderHistory.bind(this);
		this.renderCharts = this.renderCharts.bind(this);
	}

	public componentDidMount(): void {
		this.loadData();
	}

	public render(): ReactNode {
		return (
				<ContentWrapper>
					<div className={bs.row}>
						<div className={bs.col}>
							<h5>Today</h5>
						</div>
					</div>

					{this.renderToday()}

					<hr/>

					<div className={bs.row}>
						<div className={bs.col}>
							<h5>Last {UCDashboardPage.HISTORY_DAYS} Days</h5>
						</div>
					</div>

					{this.renderHistory(UCDashboardPage.HISTORY_DAYS)}
				</ContentWrapper>
		);
	}

	private loadData(): void {
		const { actions } = this.props;

		if (this.loadDataDebounceTimeout) {
			global.clearTimeout(this.loadDataDebounceTimeout);
			this.loadDataDebounceTimeout = undefined;
		}

		this.loadDataDebounceTimeout = global.setTimeout(() => {
			const today = utcMoment();

			for (let i = 0; i <= UCDashboardPage.HISTORY_DAYS; ++i) {
				actions.loadMacroSummaryForDate(today.clone().subtract(i, "day"));
			}
		}, 500);
	}

	private renderToday(): ReactNode {
		const { loadedMacroSummariesByDate } = this.props;

		const now = utcMoment();
		const summary = loadedMacroSummariesByDate[momentToDateKey(now)];

		if (!summary) {
			return (
					<div className={bs.row}>
						<div className={bs.col}>
							<LoadingSpinner centre={true}/>
						</div>
					</div>
			);
		}

		return (
				<div className={bs.row}>
					<div className={bs.col}>
						{renderMacroSummary(summary)}
					</div>
				</div>
		);
	}

	private renderHistory(days: number): ReactNode {
		const { loadedMacroSummariesByDate } = this.props;

		const now = utcMoment();
		const dates: Moment.Moment[] = [];

		for (let i = 1; i <= days; ++i) {
			dates.push(now.clone().subtract(i, "day"));
		}

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

		return (
				<>
					<div className={bs.row}>
						<div className={combine(bs.col, bs.mb3)}>
							{renderMacroSummary(calculateTotalMacroSummary(summaries))}
						</div>
					</div>
					<div className={bs.row}>
						<div className={bs.col}>
							{this.renderCharts(dates, summaries)}
						</div>
					</div>
				</>
		);
	}

	private renderCharts(dates: Moment.Moment[], summaries: IMacroSummary[]): ReactNode {
		const caloriesDatasets: ChartDataSets[] = [
			{
				...defaultDatasetProps,
				borderColor: chartColours.black.toString(),
				borderWidth: 1,
				borderDash: [5, 10],
				data: dates.map((date) => ({
					x: date.toDate(),
					y: 100,
				})),
			},
			{
				...defaultDatasetProps,
				label: "Calories",
				borderColor: chartColours.blackSemiTransparent.toString(),
				data: summaries.map((sum, idx) => ({
					x: dates[idx].toDate(),
					y: sum.totalCalories / sum.targetCalories * 100,
				})),
			},
		];
		const carbohydratesDatasets: ChartDataSets[] = [
			{
				...defaultDatasetProps,
				borderColor: chartColours.black.toString(),
				borderWidth: 1,
				borderDash: [5, 10],
				data: dates.map((date) => ({
					x: date.toDate(),
					y: 100,
				})),
			},
			{
				...defaultDatasetProps,
				label: "Carbohydrates",
				borderColor: chartColours.blue.toString(),
				data: summaries.map((sum, idx) => ({
					x: dates[idx].toDate(),
					y: sum.totalCarbohydrates / sum.targetCarbohydrates * 100,
				})),
			},
		];
		const fatDatasets: ChartDataSets[] = [
			{
				...defaultDatasetProps,
				borderColor: chartColours.black.toString(),
				borderWidth: 1,
				borderDash: [5, 10],
				data: dates.map((date) => ({
					x: date.toDate(),
					y: 100,
				})),
			},
			{
				...defaultDatasetProps,
				label: "Fat",
				borderColor: chartColours.red.toString(),
				data: summaries.map((sum, idx) => ({
					x: dates[idx].toDate(),
					y: sum.totalFat / sum.targetFat * 100,
				})),
			},
		];
		const proteinDatasets: ChartDataSets[] = [
			{
				...defaultDatasetProps,
				borderColor: chartColours.black.toString(),
				borderWidth: 1,
				borderDash: [5, 10],
				data: dates.map((date) => ({
					x: date.toDate(),
					y: 100,
				})),
			},
			{
				...defaultDatasetProps,
				label: "Protein",
				borderColor: chartColours.green.toString(),
				data: summaries.map((sum, idx) => ({
					x: dates[idx].toDate(),
					y: sum.totalProtein / sum.targetProtein * 100,
				})),
			},
		];

		const chartProps: Partial<LinearComponentProps> = {
			legend: {
				display: true,
				position: "bottom",
				labels: {
					filter: (label: ChartLegendLabelItem) => !!label.text,
				},
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				elements: {
					line: {
						borderWidth: 1,
						tension: 0,
						fill: false,
					},
				},
				tooltips: {
					enabled: false,
				},
				scales: {
					display: true,
					gridLines: {
						offsetGridLines: true,
					},
					xAxes: [
						{
							display: true,
							type: "time",
							ticks: {
								callback: (_: any, idx: number, values: Array<{ readonly value: number }>) => {
									const date = values[idx];
									return date ? formatDate(utcMoment(date.value), "short") : undefined;
								},
							},
						},
					],
					yAxes: [
						{
							display: true,
							ticks: {
								beginAtZero: true,
								callback: (val: number) => formatPercent(val),
							},
						},
					],
				},
			},
		};

		return (
				<>
					<div className={bs.mb3}>
						<Line
								{...chartProps}
								data={{ datasets: caloriesDatasets }}
						/>
					</div>
					<div className={bs.mb3}>
						<Line
								{...chartProps}
								data={{ datasets: carbohydratesDatasets }}
						/>
					</div>
					<div className={bs.mb3}>
						<Line
								{...chartProps}
								data={{ datasets: fatDatasets }}
						/>
					</div>
					<div>
						<Line
								{...chartProps}
								data={{ datasets: proteinDatasets }}
						/>
					</div>
				</>
		);
	}
}

export const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(UCDashboardPage);
