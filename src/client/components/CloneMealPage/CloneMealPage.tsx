import React, { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { ALL_MEAL_VALUES, Meal } from "../../../utils/enums";
import {
  getDefaultCloneMealRequest,
  ICloneMealRequest,
  ICloneMealRequestValidationResult,
  validateCloneMealRequest,
} from "../../../models/ICloneMealRequest";
import { dateToUrlString, urlStringToDate } from "../../../utils/dates";
import { formatDate, getMealTitle } from "../../../utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { setEditorResult, startCloneMeal } from "../../redux/meal-cloning";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledForm } from "../_ui/ControlledForm/ControlledForm";
import { ControlledDateInput } from "../_ui/ControlledInputs/ControlledDateInput";
import { ControlledSelectInput } from "../_ui/ControlledInputs/ControlledSelectInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";

interface IEditCloneMealPageProps {
  readonly editorBusy?: boolean;
  readonly editorResult?: ActionResult;
  readonly lastCloneMealRequest?: ICloneMealRequest;
  readonly actions?: {
    readonly resetEditorResult: () => PayloadAction;
    readonly startCloneMeal: (cloneMealRequest: ICloneMealRequest) => PayloadAction;
  };

  // derived from query string
  readonly urlFromDate?: Date;
  readonly urlFromMeal?: Meal;
  readonly urlToDate?: Date;
  readonly urlToMeal?: Meal;
}

interface IEditCloneMealPageState {
  readonly currentValue: ICloneMealRequest;
  readonly validationResult: ICloneMealRequestValidationResult;
}

function mapStateToProps(state: IRootState, props: IEditCloneMealPageProps): IEditCloneMealPageProps {
  const urlParams = new URLSearchParams(state.router.location.search);
  return {
    ...props,
    editorBusy: state.mealCloning.editorBusy,
    editorResult: state.mealCloning.editorResult,
    lastCloneMealRequest: state.mealCloning.lastCloneMealRequest,

    urlFromDate: urlParams.has("fromDate") ? urlStringToDate(urlParams.get("fromDate")) : undefined,
    urlFromMeal: urlParams.has("fromMeal") ? (urlParams.get("fromMeal") as Meal) : undefined,
    urlToDate: urlParams.has("toDate") ? urlStringToDate(urlParams.get("toDate")) : undefined,
    urlToMeal: urlParams.has("toMeal") ? (urlParams.get("toMeal") as Meal) : undefined,
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: IEditCloneMealPageProps): IEditCloneMealPageProps {
  return {
    ...props,
    actions: {
      resetEditorResult: (): PayloadAction => dispatch(setEditorResult(undefined)),
      startCloneMeal: (cloneMealRequest): PayloadAction => dispatch(startCloneMeal(cloneMealRequest)),
    },
  };
}

class UCEditCloneMealPage extends PureComponent<IEditCloneMealPageProps, IEditCloneMealPageState> {
  constructor(props: IEditCloneMealPageProps) {
    super(props);

    this.resetEditor(true);

    this.resetEditor = this.resetEditor.bind(this);
    this.handleFromDateChange = this.handleFromDateChange.bind(this);
    this.handleFromMealChange = this.handleFromMealChange.bind(this);
    this.handleToDateChange = this.handleToDateChange.bind(this);
    this.handleToMealChange = this.handleToMealChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateModel = this.updateModel.bind(this);
  }

  public componentDidMount(): void {
    this.props.actions.resetEditorResult();
  }

  public render(): ReactNode {
    const { editorBusy, editorResult } = this.props;
    const { currentValue, validationResult } = this.state;
    const errors = validationResult.errors || {};

    let statusMsg: ReactNode = null;
    if (editorResult === "success") {
      return (
        <ContentWrapper>
          <div className={bs.row}>
            <div className={bs.col}>
              <h1>Done!</h1>
              <p>The meal has been cloned.</p>
            </div>
          </div>
          <div className={bs.row}>
            <div className={bs.col6}>
              <Link to={`/diary-entries/${dateToUrlString(currentValue.toDate)}`}>
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
            <div className={bs.col6}>
              <IconBtn
                icon={"refresh"}
                text={"Clone Another"}
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
            <h1>Clone Entry</h1>
            <ControlledForm onSubmit={this.handleSubmit}>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledDateInput
                    id={"fromDate"}
                    label={"From Date"}
                    value={formatDate(currentValue.fromDate, "system") || ""}
                    onValueChange={this.handleFromDateChange}
                    disabled={editorBusy}
                    error={errors.fromDate}
                  />
                </div>
              </div>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledSelectInput
                    id={"fromMeal"}
                    label={"From Meal"}
                    value={currentValue.fromMeal || ""}
                    onValueChange={this.handleFromMealChange}
                    disabled={editorBusy}
                    error={errors.fromMeal}
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
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledDateInput
                    id={"toDate"}
                    label={"To Date"}
                    value={formatDate(currentValue.toDate, "system") || ""}
                    onValueChange={this.handleToDateChange}
                    disabled={editorBusy}
                    error={errors.toDate}
                  />
                </div>
              </div>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledSelectInput
                    id={"toMeal"}
                    label={"To Meal"}
                    value={currentValue.toMeal || ""}
                    onValueChange={this.handleToMealChange}
                    disabled={editorBusy}
                    error={errors.toMeal}
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
                <div className={combine(bs.col12, bs.mb3)}>
                  <IconBtn
                    icon={editorBusy ? "hourglass_empty" : "content_copy"}
                    text={"Clone"}
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
    const { urlFromDate, urlFromMeal, urlToDate, urlToMeal, lastCloneMealRequest, actions } = this.props;

    actions.resetEditorResult();

    const defaultCloneMeal = getDefaultCloneMealRequest();
    let fromDate: Date;
    let fromMeal: Meal;
    let toDate: Date;
    let toMeal: Meal;

    if (init) {
      fromDate = urlFromDate ? urlFromDate : defaultCloneMeal.fromDate;
      fromMeal = urlFromMeal ? urlFromMeal : defaultCloneMeal.fromMeal;
      toDate = urlToDate ? urlToDate : defaultCloneMeal.toDate;
      toMeal = urlToMeal ? urlToMeal : defaultCloneMeal.toMeal;
    } else {
      fromDate = lastCloneMealRequest ? lastCloneMealRequest.fromDate : defaultCloneMeal.fromDate;
      fromMeal = lastCloneMealRequest ? lastCloneMealRequest.fromMeal : defaultCloneMeal.fromMeal;
      toDate = lastCloneMealRequest ? lastCloneMealRequest.toDate : defaultCloneMeal.toDate;
      toMeal = lastCloneMealRequest ? lastCloneMealRequest.toMeal : defaultCloneMeal.toMeal;
    }

    const cloneMeal = {
      ...defaultCloneMeal,
      fromDate,
      fromMeal,
      toDate,
      toMeal,
    };

    if (init) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state = {
        currentValue: cloneMeal,
        validationResult: validateCloneMealRequest(cloneMeal),
      };
    } else {
      // reset the URL as well
      const urlProps = new URLSearchParams({
        fromDate: dateToUrlString(fromDate),
        fromMeal,
        toDate: dateToUrlString(toDate),
        toMeal,
      });
      history.push(`/clone-meal?${urlProps}`);

      this.setState({
        currentValue: cloneMeal,
        validationResult: validateCloneMealRequest(cloneMeal),
      });
    }
  }

  private handleFromDateChange(fromDate: Date): void {
    this.updateModel({ fromDate });
  }

  private handleFromMealChange(fromMeal: string): void {
    this.updateModel({ fromMeal: fromMeal as Meal });
  }

  private handleToDateChange(toDate: Date): void {
    this.updateModel({ toDate });
  }

  private handleToMealChange(toMeal: string): void {
    this.updateModel({ toMeal: toMeal as Meal });
  }

  private handleSubmit(): void {
    this.props.actions.startCloneMeal(this.state.currentValue);
  }

  private updateModel(cloneMeal: Partial<ICloneMealRequest>): void {
    const updatedCloneMeal = {
      ...this.state.currentValue,
      ...cloneMeal,
    };
    this.setState({
      currentValue: updatedCloneMeal,
      validationResult: validateCloneMealRequest(updatedCloneMeal),
    });
  }
}

export const CloneMealPage = connect(mapStateToProps, mapDispatchToProps)(UCEditCloneMealPage);
