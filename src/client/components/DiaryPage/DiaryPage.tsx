import { isSameDay } from "date-fns";
import React, { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router-dom";
import { Dispatch } from "redux";
import { CacheKeyUtil } from "@dragonlabs/redux-cache-key-util";
import { Meal } from "../../../utils/enums";
import { IDiaryEntry } from "../../../models/IDiaryEntry";
import { IExerciseEntry } from "../../../models/IExerciseEntry";
import { IMacroSummary } from "../../../models/IMacroSummary";
import { dateToDateKey, dateToUrlString, fixedDate, urlStringToDate } from "../../../utils/dates";
import { formatLargeNumber, getMealTitle } from "../../../utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { renderMacroSummary } from "../../helpers/rendering";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { diaryEntriesCacheKeys, startDeleteDiaryEntry, startLoadDiaryEntriesForDate } from "../../redux/diary-entries";
import {
  exerciseEntriesCacheKeys,
  startDeleteExerciseEntry,
  startLoadExerciseEntriesForDate,
} from "../../redux/exercise-entries";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { startLoadMacroSummaryForDate } from "../../redux/macro-summaries";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import { DateScroller } from "../DateScroller/DateScroller";
import { DiaryEntryFoodItemSummary } from "../DiaryEntryFoodItemSummary/DiaryEntryFoodItemSummary";

interface IDiaryPageProps {
  readonly updateTime: number;
  readonly currentDate: Date;
  readonly loadedMacroSummariesByDate?: {
    readonly [key: string]: IMacroSummary;
  };
  readonly loadedExerciseEntriesByDate?: {
    readonly [key: string]: IExerciseEntry[];
  };
  readonly loadedDiaryEntriesByDate?: { readonly [key: string]: IDiaryEntry[] };
  readonly actions?: {
    readonly loadMacroSummaryForDate: (date: Date) => PayloadAction;
    readonly loadExerciseEntriesForDate: (date: Date) => PayloadAction;
    readonly loadDiaryEntriesForDate: (date: Date) => PayloadAction;
    readonly deleteExerciseEntry: (exerciseEntry: IExerciseEntry) => PayloadAction;
    readonly deleteDiaryEntry: (diaryEntry: IDiaryEntry) => PayloadAction;
  };

  // added by connected react router
  readonly match?: Match<{ readonly date: string }>;
}

function mapStateToProps(state: IRootState, props: IDiaryPageProps): IDiaryPageProps {
  const date = props.match.params.date ? urlStringToDate(props.match.params.date) : fixedDate();

  return {
    ...props,
    updateTime: CacheKeyUtil.getMaxKeyTime([diaryEntriesCacheKeys.latestUpdate, exerciseEntriesCacheKeys.latestUpdate]),
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
      loadMacroSummaryForDate: (date: Date): PayloadAction => dispatch(startLoadMacroSummaryForDate(date)),
      loadExerciseEntriesForDate: (date: Date): PayloadAction => dispatch(startLoadExerciseEntriesForDate(date)),
      loadDiaryEntriesForDate: (date: Date): PayloadAction => dispatch(startLoadDiaryEntriesForDate(date)),
      deleteExerciseEntry: (exerciseEntry: IExerciseEntry): PayloadAction =>
        dispatch(startDeleteExerciseEntry(exerciseEntry)),
      deleteDiaryEntry: (diaryEntry: IDiaryEntry): PayloadAction => dispatch(startDeleteDiaryEntry(diaryEntry)),
    },
  };
}

class UCDiaryPage extends PureComponent<IDiaryPageProps> {
  private static startAddExerciseEntry(date: Date): void {
    history.push(`/exercise-entries/edit?initDate=${dateToUrlString(date)}`);
  }

  private static startEditExerciseEntry(exerciseEntry: IExerciseEntry): void {
    history.push(`/exercise-entries/edit/${exerciseEntry.id}`);
  }

  private static startCloneMeal(values: { readonly date: Date; readonly meal: Meal }): void {
    history.push(`/clone-meal?fromDate=${dateToUrlString(values.date)}&fromMeal=${values.meal}`);
  }

  private static startAddDiaryEntry(values: { readonly date: Date; readonly meal: Meal }): void {
    history.push(`/diary-entries/edit?initDate=${dateToUrlString(values.date)}&initMeal=${values.meal}`);
  }

  private static startEditDiaryEntry(diaryEntry: IDiaryEntry): void {
    history.push(`/diary-entries/edit/${diaryEntry.id}`);
  }

  private static handleDateChange(date: Date): void {
    history.push(`/diary-entries/${dateToUrlString(date)}`);
  }

  private loadDataDebounceTimeout: NodeJS.Timer = undefined;

  constructor(props: IDiaryPageProps) {
    super(props);

    this.loadData = this.loadData.bind(this);
    this.renderInner = this.renderInner.bind(this);
    this.renderExercise = this.renderExercise.bind(this);
    this.renderMeal = this.renderMeal.bind(this);
    this.renderExerciseEntry = this.renderExerciseEntry.bind(this);
    this.renderDiaryEntry = this.renderDiaryEntry.bind(this);
  }

  public componentDidMount(): void {
    this.loadData();
  }

  public componentDidUpdate(prevProps: Readonly<IDiaryPageProps>): void {
    const currProps = this.props;

    if (currProps.updateTime !== prevProps.updateTime) {
      this.loadData();
    } else if (currProps.currentDate) {
      if (!prevProps.currentDate || !isSameDay(prevProps.currentDate, currProps.currentDate)) {
        this.loadData();
      }
    }
  }

  public render(): ReactNode {
    const { currentDate } = this.props;

    return (
      <>
        <DateScroller currentDate={currentDate} onDateChange={UCDiaryPage.handleDateChange} />
        {this.renderInner()}
      </>
    );
  }

  private loadData(): void {
    const { actions, currentDate } = this.props;

    if (this.loadDataDebounceTimeout) {
      global.clearTimeout(this.loadDataDebounceTimeout);
      this.loadDataDebounceTimeout = undefined;
    }

    this.loadDataDebounceTimeout = global.setTimeout(() => {
      actions.loadMacroSummaryForDate(currentDate);
      actions.loadExerciseEntriesForDate(currentDate);
      actions.loadDiaryEntriesForDate(currentDate);
    }, 500);
  }

  private renderInner(): ReactNode {
    const { currentDate, loadedMacroSummariesByDate, loadedDiaryEntriesByDate, loadedExerciseEntriesByDate } =
      this.props;

    const summary = loadedMacroSummariesByDate[dateToDateKey(currentDate)];
    const diaryEntries = loadedDiaryEntriesByDate[dateToDateKey(currentDate)];
    const exerciseEntries = loadedExerciseEntriesByDate[dateToDateKey(currentDate)];

    if (!summary || !diaryEntries || !exerciseEntries) {
      return (
        <ContentWrapper>
          <LoadingSpinner centre={true} />
        </ContentWrapper>
      );
    }

    return (
      <ContentWrapper>
        <div className={bs.row}>
          <div className={bs.col}>{this.renderSummary()}</div>
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
    const summary = loadedMacroSummariesByDate[dateToDateKey(currentDate)];
    return renderMacroSummary(summary);
  }

  private renderExercise(): ReactNode {
    const { currentDate, loadedExerciseEntriesByDate } = this.props;

    const entries = loadedExerciseEntriesByDate[dateToDateKey(currentDate)];

    if (!entries) {
      return null;
    }

    let renderedEntries: ReactNode;
    if (!entries.length) {
      renderedEntries = (
        <p>
          <em className={bs.textMuted}>No entries yet.</em>
        </p>
      );
    } else {
      renderedEntries = entries.map((e) => this.renderExerciseEntry(e));
    }

    return (
      <>
        <hr />
        <div className={bs.dFlex}>
          <h5 className={bs.flexGrow1}>Exercise</h5>
          <div
            className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0)}
            style={{ whiteSpace: "nowrap" }}
          >
            <IconBtn
              icon={"add"}
              text={"Add"}
              payload={currentDate}
              onClick={UCDiaryPage.startAddExerciseEntry}
              btnProps={{
                className: bs.btnOutlineDark,
              }}
            />
          </div>
        </div>
        {renderedEntries}
      </>
    );
  }

  private renderMeal(meal: Meal): ReactNode {
    const { currentDate, loadedDiaryEntriesByDate } = this.props;

    const allEntries = loadedDiaryEntriesByDate[dateToDateKey(currentDate)];

    if (!allEntries) {
      return null;
    }

    const entries = allEntries
      .filter((e) => e.meal === meal)
      .sort((e1, e2) => e1.foodItem.name.localeCompare(e2.foodItem.name));

    let renderedEntries: ReactNode;
    if (!entries.length) {
      renderedEntries = (
        <p>
          <em className={bs.textMuted}>No entries yet.</em>
        </p>
      );
    } else {
      renderedEntries = entries.map((e) => this.renderDiaryEntry(e));
    }

    return (
      <>
        <hr />
        <div className={bs.dFlex}>
          <h5 className={bs.flexGrow1}>{getMealTitle(meal)}</h5>
          <div
            className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0)}
            style={{ whiteSpace: "nowrap" }}
          >
            <IconBtn
              icon={"add"}
              text={"Add"}
              payload={{ date: currentDate, meal }}
              onClick={UCDiaryPage.startAddDiaryEntry}
              btnProps={{
                className: bs.btnOutlineDark,
              }}
            />
            <IconBtn
              icon={"content_copy"}
              text={"Clone"}
              payload={{ date: currentDate, meal }}
              onClick={UCDiaryPage.startCloneMeal}
              btnProps={{
                className: bs.btnOutlineDark,
              }}
            />
          </div>
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
          <br />
          <span className={combine(bs.textMuted, bs.small)}>{formatLargeNumber(caloriesBurned)} kcal</span>
        </p>
        <div
          className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0)}
          style={{ whiteSpace: "nowrap" }}
        >
          <IconBtn
            icon={"edit"}
            text={"Edit"}
            payload={entry}
            onClick={UCDiaryPage.startEditExerciseEntry}
            btnProps={{
              className: bs.btnOutlineDark,
            }}
          />
          <DeleteBtn
            payload={entry}
            onConfirmedClick={this.props.actions.deleteExerciseEntry}
            btnProps={{
              className: bs.btnOutlineDark,
            }}
          />
        </div>
      </div>
    );
  }

  private renderDiaryEntry(entry: IDiaryEntry): ReactNode {
    return (
      <div className={bs.dFlex} key={entry.id}>
        <p className={combine(bs.flexGrow1, bs.mb1)}>
          <DiaryEntryFoodItemSummary diaryEntry={entry} />
        </p>
        <div
          className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0, bs.myAuto)}
          style={{ whiteSpace: "nowrap" }}
        >
          <IconBtn
            icon={"edit"}
            text={"Edit"}
            payload={entry}
            onClick={UCDiaryPage.startEditDiaryEntry}
            btnProps={{
              className: bs.btnOutlineDark,
            }}
          />
          <DeleteBtn
            payload={entry}
            onConfirmedClick={this.props.actions.deleteDiaryEntry}
            btnProps={{
              className: bs.btnOutlineDark,
            }}
          />
        </div>
      </div>
    );
  }
}

export const DiaryPage = connect(mapStateToProps, mapDispatchToProps)(UCDiaryPage);
