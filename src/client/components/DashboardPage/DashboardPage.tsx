import { ChartDataSets, ChartLegendLabelItem } from "chart.js";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { Line, LinearComponentProps } from "react-chartjs-2";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Dispatch } from "redux";
import { calculateTotalMacroSummary, IMacroSummary } from "../../../commons/models/IMacroSummary";
import { momentToDateKey, utcMoment } from "../../../commons/utils/dates";
import * as bs from "../../global-styles/Bootstrap.scss";
import { chartColours, defaultDatasetProps } from "../../helpers/charts";
import { formatDate, formatPercent } from "../../helpers/formatters";
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

	constructor(props: IDashboardPageProps, context: any) {
		super(props, context);

		this.renderSummaryForToday = this.renderSummaryForToday.bind(this);
		this.renderSummaryForLast7Days = this.renderSummaryForLast7Days.bind(this);
		this.renderSummaryForDates = this.renderSummaryForDates.bind(this);
		this.renderChartForLast7Days = this.renderChartForLast7Days.bind(this);
		this.loadData = this.loadData.bind(this);
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

					<div className={bs.row}>
						<div className={bs.col}>
							{this.renderSummaryForToday()}
						</div>
					</div>

					<hr/>

					<div className={bs.row}>
						<div className={bs.col}>
							<h5>Last 7 Days</h5>
						</div>
					</div>

					<div className={bs.row}>
						<div className={combine(bs.col, bs.mb3)}>
							{this.renderSummaryForLast7Days()}
						</div>
					</div>

					<div className={bs.row}>
						<div className={bs.col}>
							{this.renderChartForLast7Days()}
						</div>
					</div>
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
			return <LoadingSpinner centre={true}/>;
		}

		return renderMacroSummary(calculateTotalMacroSummary(summaries));
	}

	private renderChartForLast7Days(): ReactNode {
		const { loadedMacroSummariesByDate } = this.props;

		const today = utcMoment();
		const dates: Moment.Moment[] = [];

		for (let i = 1; i <= 7; ++i) {
			dates.push(today.clone().subtract(i, "day").startOf("day"));
		}

		const summaries = dates.map((d) => loadedMacroSummariesByDate[momentToDateKey(d)]);
		if (summaries.some((e) => !e)) {
			return <LoadingSpinner centre={true}/>;
		}

		const caloriesDatasets: ChartDataSets[] = [
			{
				...defaultDatasetProps,
				borderColor: "rgba(0, 0, 0, 1)",
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
				borderColor: "rgba(0, 0, 0, .5)",
				data: summaries.map((sum, idx) => ({
					x: dates[idx].toDate(),
					y: sum.totalCalories / sum.targetCalories * 100,
				})),
			},
		];
		const carbohydratesDatasets: ChartDataSets[] = [
			{
				...defaultDatasetProps,
				borderColor: "rgba(0, 0, 0, 1)",
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
				borderColor: "rgba(0, 0, 0, 1)",
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
				borderColor: "rgba(0, 0, 0, 1)",
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

	private loadData(): void {
		const today = utcMoment();

		for (let i = 0; i < 8; ++i) {
			this.props.actions.loadMacroSummaryForDate(today.clone().subtract(i, "day"));
		}
	}
}

export const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(UCDashboardPage);
