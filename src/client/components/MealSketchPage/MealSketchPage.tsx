import React, { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { AnyAction, Dispatch } from "redux";
import { ALL_MEAL_VALUES, Meal } from "../../../utils/enums";
import { getDefaultDiaryEntry, IDiaryEntry } from "../../../models/IDiaryEntry";
import { IFoodItem } from "../../../models/IFoodItem";
import { generateMacroSummary } from "../../../models/IMacroSummary";
import { IServingSize } from "../../../models/IServingSize";
import { getDefaultTarget } from "../../../models/ITarget";
import { formatLargeNumber, formatMeasurement, getMealTitle } from "../../../utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { combine } from "../../helpers/style-helpers";
import { startMultiSaveDiaryEntries } from "../../redux/diary-entries";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledSelectInput } from "../_ui/ControlledInputs/ControlledSelectInput";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { DiaryEntryFoodItemSummary } from "../DiaryEntryFoodItemSummary/DiaryEntryFoodItemSummary";
import { FoodItemPicker } from "../FoodItemPicker/FoodItemPicker";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { ServingPicker } from "../ServingPicker/ServingPicker";
import * as style from "./MealSketchPage.scss";

interface IMealSketchPageProps {
  readonly multiSaveEditorBusy?: boolean;
  readonly multiSaveEditorResult?: ActionResult;
  readonly actions?: {
    readonly startSaveDiaryEntries: (diaryEntries: IDiaryEntry[]) => AnyAction;
  };
}

interface IMealSketchPageState {
  readonly diaryEntries: IDiaryEntry[];
  readonly activeEditPositions: number[];
  readonly selectedMeal?: Meal;
}

function mapStateToProps(state: IRootState, props: IMealSketchPageProps): IMealSketchPageProps {
  return {
    ...props,
    multiSaveEditorBusy: state.diaryEntries.multiSaveEditorBusy,
    multiSaveEditorResult: state.diaryEntries.multiSaveEditorResult,
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: IMealSketchPageProps): IMealSketchPageProps {
  return {
    ...props,
    actions: {
      startSaveDiaryEntries: (diaryEntries: IDiaryEntry[]): PayloadAction =>
        dispatch(startMultiSaveDiaryEntries(diaryEntries)),
    },
  };
}

class UCMealSketchPage extends PureComponent<IMealSketchPageProps, IMealSketchPageState> {
  constructor(props: IMealSketchPageProps) {
    super(props);

    this.state = {
      selectedMeal: null,
      diaryEntries: [],
      activeEditPositions: [],
    };

    this.renderSummary = this.renderSummary.bind(this);
    this.renderContents = this.renderContents.bind(this);
    this.renderPicker = this.renderPicker.bind(this);
    this.renderDiaryEntry = this.renderDiaryEntry.bind(this);
    this.handleAddFoodItem = this.handleAddFoodItem.bind(this);
    this.handleToggleEditFoodItem = this.handleToggleEditFoodItem.bind(this);
    this.handleDeleteFoodItem = this.handleDeleteFoodItem.bind(this);
    this.handleServingQtyChange = this.handleServingQtyChange.bind(this);
    this.handleServingSizeChange = this.handleServingSizeChange.bind(this);
    this.handleMealChange = this.handleMealChange.bind(this);
    this.handleSaveEntries = this.handleSaveEntries.bind(this);
  }

  public render(): ReactNode {
    return (
      <div className={style.outerWrapper}>
        {this.renderSummary()}
        {this.renderContents()}
        {this.renderPicker()}
      </div>
    );
  }

  private renderSummary(): ReactNode {
    const { multiSaveEditorResult } = this.props;
    const { diaryEntries } = this.state;

    if (multiSaveEditorResult === "success") {
      // render nothing if we've finished adding entries to the diary
      return null;
    }

    // we don't care about the target at this point
    const summary = generateMacroSummary(diaryEntries, [], getDefaultTarget());

    return (
      <div className={style.summaryWrapper}>
        <div className={style.summaryItem}>
          <span>{formatLargeNumber(summary.totalCalories)}</span>
          <br />
          kcal
        </div>
        <div className={style.summaryItem}>
          <span>{formatMeasurement(summary.totalCarbohydrates, "g")}</span>
          <br />
          carbs
        </div>
        <div className={style.summaryItem}>
          <span>{formatMeasurement(summary.totalFat, "g")}</span>
          <br />
          fat
        </div>
        <div className={style.summaryItem}>
          <span>{formatMeasurement(summary.totalProtein, "g")}</span>
          <br />
          protein
        </div>
      </div>
    );
  }

  private renderContents(): ReactNode {
    const { multiSaveEditorBusy, multiSaveEditorResult } = this.props;
    const { diaryEntries, selectedMeal } = this.state;

    if (diaryEntries.length === 0) {
      return (
        <div className={style.contentWrapper}>
          <ContentWrapper>
            <p className={combine(bs.textMuted, bs.textCenter)}>Select some food to get started.</p>
          </ContentWrapper>
        </div>
      );
    } else {
      let statusMsg: ReactNode = null;
      if (multiSaveEditorResult === "success") {
        return (
          <ContentWrapper>
            <div className={bs.row}>
              <div className={bs.col}>
                <h1>Done!</h1>
                <p>
                  {diaryEntries.length} {diaryEntries.length === 1 ? "entry has" : "entries have"} been saved.
                </p>
              </div>
            </div>
            <div className={bs.row}>
              <div className={bs.col6}>
                <Link to={"/food-items"}>
                  <IconBtn
                    icon={"lunch_dining"}
                    text={"All Food Items"}
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
                <Link to={"/diary-entries"}>
                  <IconBtn
                    icon={"today"}
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
            </div>
          </ContentWrapper>
        );
      } else if (multiSaveEditorResult) {
        statusMsg = (
          <div className={combine(bs.alert, bs.alertDanger)}>
            <h5>Failed!</h5>
            <p>{multiSaveEditorResult.message}</p>
          </div>
        );
      }

      return (
        <div className={style.contentWrapper}>
          <ContentWrapper>
            {statusMsg}
            {diaryEntries.map(this.renderDiaryEntry)}
            <hr />
            <div className={bs.row}>
              <div className={bs.col6}>
                <ControlledSelectInput
                  id={"meal"}
                  label={null}
                  value={selectedMeal || ""}
                  onValueChange={this.handleMealChange}
                  disabled={multiSaveEditorBusy}
                  selectProps={{
                    style: {
                      width: "100%",
                    },
                  }}
                >
                  <option value={""}>Select</option>
                  {ALL_MEAL_VALUES.map((m) => (
                    <option value={m} key={m}>
                      {getMealTitle(m)}
                    </option>
                  ))}
                </ControlledSelectInput>
              </div>
              <div className={bs.col6}>
                <IconBtn
                  icon={multiSaveEditorBusy ? "hourglass_empty" : "save"}
                  text={"Add to Diary"}
                  onClick={this.handleSaveEntries}
                  btnProps={{
                    style: {
                      width: "100%",
                    },
                    disabled: !selectedMeal || multiSaveEditorBusy,
                    className: bs.btnOutlineDark,
                  }}
                  iconProps={{
                    spin: multiSaveEditorBusy,
                  }}
                />
              </div>
            </div>
          </ContentWrapper>
        </div>
      );
    }
  }

  private renderPicker(): ReactNode {
    const { multiSaveEditorBusy, multiSaveEditorResult } = this.props;

    if (multiSaveEditorResult === "success") {
      // render nothing if we've finished adding entries to the diary
      return null;
    }

    return (
      <div className={style.pickerWrapper}>
        <ContentWrapper disableBottomPadding={true}>
          <FoodItemPicker
            onValueChange={this.handleAddFoodItem}
            resetSearchOnSelect={true}
            disabled={multiSaveEditorBusy}
          />
        </ContentWrapper>
      </div>
    );
  }

  private renderDiaryEntry(entry: IDiaryEntry, index: number): ReactNode {
    const { multiSaveEditorBusy } = this.props;
    const { activeEditPositions } = this.state;
    const { foodItem } = entry;

    if (activeEditPositions.indexOf(index) >= 0) {
      return (
        <div className={bs.dFlex} key={index}>
          <div className={combine(bs.flexGrow1, bs.my1, bs.me2)}>
            <ServingPicker
              foodItem={foodItem}
              servingQty={entry.servingQty}
              servingSize={entry.servingSize}
              payload={index}
              onServingQtyChange={this.handleServingQtyChange}
              onServingSizeChange={this.handleServingSizeChange}
            />
          </div>
          <div className={combine(bs.dInlineBlock, bs.flexGrow0, bs.myAuto)}>
            <IconBtn
              icon={"done"}
              text={"Done"}
              payload={index}
              onClick={this.handleToggleEditFoodItem}
              btnProps={{
                className: combine(bs.btnOutlineDark, gs.btnMini),
              }}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className={bs.dFlex} key={index}>
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
              payload={index}
              onClick={this.handleToggleEditFoodItem}
              btnProps={{
                className: combine(bs.btnOutlineDark, gs.btnMini),
                disabled: multiSaveEditorBusy,
              }}
            />
            <DeleteBtn
              payload={index}
              onConfirmedClick={this.handleDeleteFoodItem}
              btnProps={{
                className: combine(bs.btnOutlineDark, gs.btnMini),
                disabled: multiSaveEditorBusy,
              }}
            />
          </div>
        </div>
      );
    }
  }

  private handleAddFoodItem(foodItem: IFoodItem): void {
    const servingSizes = foodItem.servingSizes.filter((s) => !s.deleted);

    const diaryEntry = {
      ...getDefaultDiaryEntry(),
      foodItem,
      servingSize: servingSizes.length > 0 ? servingSizes[0] : null,
    };

    const diaryEntries = [...this.state.diaryEntries, diaryEntry];
    this.setState({ diaryEntries });
  }

  private handleToggleEditFoodItem(index: number): void {
    const { activeEditPositions } = this.state;
    if (activeEditPositions.indexOf(index) >= 0) {
      // remove from the array
      this.setState({
        activeEditPositions: activeEditPositions.filter((i) => i !== index),
      });
    } else {
      // insert into the array
      this.setState({
        activeEditPositions: [...activeEditPositions, index],
      });
    }
  }

  private handleDeleteFoodItem(index: number): void {
    this.setState({
      diaryEntries: this.state.diaryEntries.filter((v, i) => i !== index),
    });
  }

  private handleServingQtyChange(servingQty: number, index: number): void {
    const { diaryEntries } = this.state;
    this.setState({
      diaryEntries: diaryEntries.map((originalEntry, idx) => {
        if (idx === index) {
          return {
            ...originalEntry,
            servingQty,
          };
        } else {
          return originalEntry;
        }
      }),
    });
  }

  private handleServingSizeChange(servingSize: IServingSize, index: number): void {
    const { diaryEntries } = this.state;
    this.setState({
      diaryEntries: diaryEntries.map((originalEntry, idx) => {
        if (idx === index) {
          return {
            ...originalEntry,
            servingSize,
          };
        } else {
          return originalEntry;
        }
      }),
    });
  }

  private handleMealChange(meal: string): void {
    this.setState({ selectedMeal: meal as Meal });
  }

  private handleSaveEntries(): void {
    const { diaryEntries, selectedMeal } = this.state;
    const diaryEntriesWithMeal = diaryEntries.map((d) => ({
      ...d,
      meal: selectedMeal,
    }));
    this.props.actions.startSaveDiaryEntries(diaryEntriesWithMeal);
  }
}

export const MealSketchPage = connect(mapStateToProps, mapDispatchToProps)(UCMealSketchPage);
