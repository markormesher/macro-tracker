import { faCalendarDay, faCircleNotch, faRedoAlt, faSave } from "@fortawesome/pro-light-svg-icons";
import React, { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { ALL_MEAL_VALUES, Meal } from "../../../commons/enums";
import {
  getDefaultDiaryEntry,
  IDiaryEntry,
  IDiaryEntryValidationResult,
  validateDiaryEntry,
} from "../../../commons/models/IDiaryEntry";
import { IFoodItem } from "../../../commons/models/IFoodItem";
import { IServingSize, servingSizeComparator } from "../../../commons/models/IServingSize";
import { dateToUrlString, urlStringToDate } from "../../../commons/utils/dates";
import { formatDate, getMealTitle } from "../../../commons/utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { setEditorResult, startLoadDiaryEntry, startSaveDiaryEntry } from "../../redux/diary-entries";
import { startLoadAllFoodItems } from "../../redux/food-items";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledForm } from "../_ui/ControlledForm/ControlledForm";
import { ControlledDateInput } from "../_ui/ControlledInputs/ControlledDateInput";
import { ControlledSelectInput } from "../_ui/ControlledInputs/ControlledSelectInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import { FoodItemPicker } from "../FoodItemPicker/FoodItemPicker";
import { ServingPicker } from "../ServingPicker/ServingPicker";

interface IEditDiaryEntryPageProps {
  readonly editorBusy?: boolean;
  readonly editorResult?: ActionResult;
  readonly loadedDiaryEntry?: IDiaryEntry;
  readonly allFoodItems?: IFoodItem[];
  readonly lastDiaryEntrySaved?: IDiaryEntry;
  readonly actions?: {
    readonly resetEditorResult: () => PayloadAction;
    readonly startLoadDiaryEntry: () => PayloadAction;
    readonly startSaveDiaryEntry: (diaryEntry: IDiaryEntry) => PayloadAction;
    readonly startLoadAllFoodItems: () => PayloadAction;
  };

  // derived from query string
  readonly urlDate?: Date;
  readonly urlMeal?: Meal;
  readonly urlFoodItemId?: string;

  // added by connected react router
  readonly match?: Match<{ readonly diaryEntryId: string }>;
}

interface IEditDiaryEntryPageState {
  readonly currentValue: IDiaryEntry;
  readonly validationResult: IDiaryEntryValidationResult;
}

function mapStateToProps(state: IRootState, props: IEditDiaryEntryPageProps): IEditDiaryEntryPageProps {
  const diaryEntryId = props.match.params.diaryEntryId;
  const urlParams = new URLSearchParams(state.router.location.search);
  return {
    ...props,
    editorBusy: state.diaryEntries.editorBusy,
    editorResult: state.diaryEntries.editorResult,
    loadedDiaryEntry: state.diaryEntries.loadedDiaryEntries[diaryEntryId],
    allFoodItems: state.foodItems.allFoodItems,
    lastDiaryEntrySaved: state.diaryEntries.lastDiaryEntrySaved,

    urlDate: urlParams.has("initDate") ? urlStringToDate(urlParams.get("initDate")) : undefined,
    urlMeal: urlParams.has("initMeal") ? (urlParams.get("initMeal") as Meal) : undefined,
    urlFoodItemId: urlParams.has("initFood") ? urlParams.get("initFood") : undefined,
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: IEditDiaryEntryPageProps): IEditDiaryEntryPageProps {
  const diaryEntryId = props.match.params.diaryEntryId;
  return {
    ...props,
    actions: {
      resetEditorResult: (): PayloadAction => dispatch(setEditorResult(undefined)),
      startLoadDiaryEntry: (): PayloadAction => dispatch(startLoadDiaryEntry(diaryEntryId)),
      startSaveDiaryEntry: (diaryEntry): PayloadAction => dispatch(startSaveDiaryEntry(diaryEntry)),
      startLoadAllFoodItems: (): PayloadAction => dispatch(startLoadAllFoodItems()),
    },
  };
}

class UCEditDiaryEntryPage extends PureComponent<IEditDiaryEntryPageProps, IEditDiaryEntryPageState> {
  constructor(props: IEditDiaryEntryPageProps) {
    super(props);

    this.resetEditor(true);

    this.resetEditor = this.resetEditor.bind(this);
    this.handleFoodItemChange = this.handleFoodItemChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleMealChange = this.handleMealChange.bind(this);
    this.handleServingQtyChange = this.handleServingQtyChange.bind(this);
    this.handleServingSizeChange = this.handleServingSizeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateModel = this.updateModel.bind(this);
  }

  public componentDidMount(): void {
    this.props.actions.resetEditorResult();
    this.props.actions.startLoadAllFoodItems();

    const diaryEntryId = this.props.match.params.diaryEntryId;
    if (diaryEntryId) {
      this.props.actions.startLoadDiaryEntry();
    }
  }

  public componentDidUpdate(
    prevProps: Readonly<IEditDiaryEntryPageProps>,
    prevState: Readonly<IEditDiaryEntryPageState>,
  ): void {
    const loadedDiaryEntry = this.props.loadedDiaryEntry;
    if (loadedDiaryEntry !== prevProps.loadedDiaryEntry || (loadedDiaryEntry && !prevState.currentValue.id)) {
      this.updateModel(loadedDiaryEntry);
    }
  }

  public render(): ReactNode {
    const { match, editorBusy, editorResult, urlFoodItemId } = this.props;
    const { currentValue, validationResult } = this.state;
    const errors = validationResult.errors || {};

    const diaryEntryId = match.params.diaryEntryId;
    const creatingNew = !diaryEntryId;

    if (!creatingNew && !currentValue.id) {
      // still loading
      return <LoadingSpinner centre={true} />;
    }

    let statusMsg: ReactNode = null;
    if (editorResult === "success") {
      return (
        <ContentWrapper>
          <div className={bs.row}>
            <div className={bs.col}>
              <h1>Done!</h1>
              <p>The entry has been saved.</p>
            </div>
          </div>
          <div className={bs.row}>
            <div className={bs.col6}>
              <Link to={`/diary-entries/${dateToUrlString(currentValue.date)}`}>
                <IconBtn
                  icon={faCalendarDay}
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
            <div className={bs.col6}>
              <IconBtn
                icon={faRedoAlt}
                text={"Add Another"}
                onClick={this.resetEditor}
                btnProps={{
                  className: bs.btnOutlineDark,
                  style: {
                    width: "100%",
                  },
                }}
              />
            </div>
          </div>
        </ContentWrapper>
      );
    } else if (editorResult) {
      statusMsg = (
        <div className={combine(bs.alert, bs.alertDanger)}>
          <h5>Failed!</h5>
          <p>{editorResult.message}</p>
        </div>
      );
    }

    return (
      <ContentWrapper>
        {statusMsg}
        <div className={bs.row}>
          <div className={bs.col}>
            <h1>{creatingNew ? "Create" : "Edit"} Diary Entry</h1>
            <ControlledForm onSubmit={this.handleSubmit}>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.formGroup)}>
                  <FoodItemPicker
                    value={currentValue.foodItem}
                    preSelectedId={urlFoodItemId}
                    onValueChange={this.handleFoodItemChange}
                    disabled={editorBusy}
                  />
                </div>
              </div>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.formGroup)}>
                  <ControlledDateInput
                    id={"date"}
                    label={"Date"}
                    value={formatDate(currentValue.date, "system") || ""}
                    onValueChange={this.handleDateChange}
                    disabled={editorBusy}
                    error={errors.date}
                  />
                </div>
              </div>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.formGroup)}>
                  <ControlledSelectInput
                    id={"meal"}
                    label={"Meal"}
                    value={currentValue.meal || ""}
                    onValueChange={this.handleMealChange}
                    disabled={editorBusy}
                    error={errors.meal}
                  >
                    <option value={""}>Select</option>
                    {ALL_MEAL_VALUES.map((m) => (
                      <option value={m} key={m}>
                        {getMealTitle(m)}
                      </option>
                    ))}
                  </ControlledSelectInput>
                </div>
              </div>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.formGroup)}>
                  <label>How Much?</label>
                  <ServingPicker
                    foodItem={currentValue.foodItem}
                    servingQty={currentValue.servingQty}
                    servingSize={currentValue.servingSize}
                    disabled={editorBusy}
                    onServingQtyChange={this.handleServingQtyChange}
                    onServingSizeChange={this.handleServingSizeChange}
                  />
                </div>
              </div>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.formGroup)}>
                  <IconBtn
                    icon={editorBusy ? faCircleNotch : faSave}
                    text={"Save"}
                    onClick={this.handleSubmit}
                    btnProps={{
                      className: bs.btnOutlinePrimary,
                      disabled: editorBusy || !validationResult.isValid,
                      style: {
                        width: "100%",
                      },
                    }}
                    iconProps={{
                      spin: editorBusy,
                    }}
                  />
                </div>
              </div>
            </ControlledForm>
          </div>
        </div>
      </ContentWrapper>
    );
  }

  private resetEditor(init = false): void {
    const { urlDate, urlMeal, lastDiaryEntrySaved, actions } = this.props;

    actions.resetEditorResult();

    const defaultDiaryEntry = getDefaultDiaryEntry();
    let nextDate: Date;
    let nextMeal: Meal;

    if (init) {
      nextDate = urlDate ? urlDate : defaultDiaryEntry.date;
      nextMeal = urlMeal ? urlMeal : defaultDiaryEntry.meal;
    } else {
      nextDate = lastDiaryEntrySaved ? lastDiaryEntrySaved.date : defaultDiaryEntry.date;
      nextMeal = lastDiaryEntrySaved ? lastDiaryEntrySaved.meal : defaultDiaryEntry.meal;
    }

    const diaryEntry = {
      ...defaultDiaryEntry,
      date: nextDate,
      meal: nextMeal,
    };

    if (init) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state = {
        currentValue: diaryEntry,
        validationResult: validateDiaryEntry(diaryEntry),
      };
    } else {
      // reset the URL as well
      const urlProps = new URLSearchParams({
        initMeal: nextMeal,
        initDate: dateToUrlString(nextDate),
      });
      history.push(`/diary-entries/edit?${urlProps}`);

      this.setState({
        currentValue: diaryEntry,
        validationResult: validateDiaryEntry(diaryEntry),
      });
    }
  }

  private handleFoodItemChange(foodItem: IFoodItem): void {
    const servingSize =
      foodItem && foodItem.servingSizes.length ? foodItem.servingSizes.sort(servingSizeComparator)[0] : undefined;
    this.updateModel({ foodItem, servingSize });
  }

  private handleDateChange(date: Date): void {
    this.updateModel({ date });
  }

  private handleMealChange(meal: string): void {
    this.updateModel({ meal: meal as Meal });
  }

  private handleServingQtyChange(servingQty: number): void {
    this.updateModel({ servingQty });
  }

  private handleServingSizeChange(servingSize: IServingSize): void {
    this.updateModel({ servingSize });
  }

  private handleSubmit(): void {
    this.props.actions.startSaveDiaryEntry(this.state.currentValue);
  }

  private updateModel(diaryEntry: Partial<IDiaryEntry>): void {
    const updatedDiaryEntry = {
      ...this.state.currentValue,
      ...diaryEntry,
    };
    this.setState({
      currentValue: updatedDiaryEntry,
      validationResult: validateDiaryEntry(updatedDiaryEntry),
    });
  }
}

export const EditDiaryEntryPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UCEditDiaryEntryPage);
