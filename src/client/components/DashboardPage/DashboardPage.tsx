import { subDays } from "date-fns";
import React, { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Dispatch } from "redux";
import { calculateTotalMacroSummary, IMacroSummary } from "../../../models/IMacroSummary";
import { dateToDateKey, fixedDate } from "../../../utils/dates";
import { formatLargeNumber, formatPercent } from "../../../utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { getClassesForProgressBar, renderMacroSummary } from "../../helpers/rendering";
import { combine } from "../../helpers/style-helpers";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { startLoadMacroSummaryForDate } from "../../redux/macro-summaries";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import * as style from "./DashboardPage.scss";

interface IDashboardPageProps {
  readonly loadedMacroSummariesByDate?: {
    readonly [key: string]: IMacroSummary;
  };
  readonly actions?: {
    readonly loadMacroSummaryForDate: (date: Date) => PayloadAction;
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
      loadMacroSummaryForDate: (date: Date): PayloadAction => dispatch(startLoadMacroSummaryForDate(date)),
    },
  };
}

class UCDashboardPage extends PureComponent<IDashboardPageProps> {
  private static HISTORY_DAYS = 7;

  private loadDataDebounceTimeout: NodeJS.Timer = undefined;

  constructor(props: IDashboardPageProps) {
    super(props);

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

        <hr />

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
      const today = fixedDate();

      for (let i = 0; i <= UCDashboardPage.HISTORY_DAYS; ++i) {
        actions.loadMacroSummaryForDate(subDays(today, i));
      }
    }, 500);
  }

  private renderToday(): ReactNode {
    const { loadedMacroSummariesByDate } = this.props;

    const now = fixedDate();
    const summary = loadedMacroSummariesByDate[dateToDateKey(now)];

    if (!summary) {
      return (
        <div className={bs.row}>
          <div className={bs.col}>
            <LoadingSpinner centre={true} />
          </div>
        </div>
      );
    }

    return (
      <div className={bs.row}>
        <div className={bs.col}>{renderMacroSummary(summary)}</div>
      </div>
    );
  }

  private renderHistory(days: number): ReactNode {
    const { loadedMacroSummariesByDate } = this.props;

    const now = fixedDate();
    const dates: Date[] = [];

    for (let i = days; i >= 1; --i) {
      dates.push(subDays(now, i));
    }

    const summaries = dates.map((d) => loadedMacroSummariesByDate[dateToDateKey(d)]);

    if (summaries.some((e) => !e)) {
      return (
        <div className={bs.row}>
          <div className={bs.col}>
            <LoadingSpinner centre={true} />
          </div>
        </div>
      );
    }

    return (
      <>
        <div className={bs.row}>
          <div className={combine(bs.col, bs.mb3)}>{renderMacroSummary(calculateTotalMacroSummary(summaries))}</div>
        </div>
        {this.renderCharts(dates, summaries)}
      </>
    );
  }

  private renderCharts(dates: Date[], summaries: IMacroSummary[]): ReactNode {
    return (
      <>
        <div className={bs.row}>
          <div className={combine(bs.col, bs.mb3)}>
            <h6>Calories</h6>
            {this.renderChart(
              dates,
              summaries.map((s) => s.totalCalories),
              summaries.map((s) => s.targetCalories),
            )}
          </div>
        </div>
        <div className={bs.row}>
          <div className={combine(bs.col, bs.mb3)}>
            <h6>Carbohydrates</h6>
            {this.renderChart(
              dates,
              summaries.map((s) => s.totalCarbohydrates),
              summaries.map((s) => s.targetCarbohydrates),
            )}
          </div>
        </div>
        <div className={bs.row}>
          <div className={combine(bs.col, bs.mb3)}>
            <h6>Fat</h6>
            {this.renderChart(
              dates,
              summaries.map((s) => s.totalFat),
              summaries.map((s) => s.targetFat),
            )}
          </div>
        </div>
        <div className={bs.row}>
          <div className={bs.col}>
            <h6>Protein</h6>
            {this.renderChart(
              dates,
              summaries.map((s) => s.totalProtein),
              summaries.map((s) => s.targetProtein),
            )}
          </div>
        </div>
      </>
    );
  }

  private renderChart(dates: Date[], totals: number[], targets: number[]): ReactNode {
    return (
      <div className={combine(bs.dFlex, bs.flexRow)}>
        {dates.map((date, idx) => {
          const total = totals[idx];
          const target = targets[idx];
          const percent = total / target;

          return (
            <div key={idx} className={style.cell}>
              <div
                className={combine(style.cellColour, getClassesForProgressBar(percent))}
                style={{
                  height: 80 * Math.min(1.2, percent) + "px",
                }}
              />

              <div className={style.cellLine} />

              <div className={style.cellLabel}>
                {formatPercent(percent * 100, 0)}
                <span className={combine(bs.dSmInline, bs.dNone, bs.small)}>
                  <br />
                  {formatLargeNumber(total)} of {formatLargeNumber(target)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(UCDashboardPage);
