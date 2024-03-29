import React, { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { generateMacroSummary } from "../../../models/IMacroSummary";
import {
  getDefaultTarget,
  ITarget,
  ITargetValidationResult,
  TargetMode,
  validateTarget,
} from "../../../models/ITarget";
import { formatDate, formatLargeNumber, formatMeasurement, formatPercent } from "../../../utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { setEditorResult, startLoadTarget, startSaveTarget } from "../../redux/targets";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledForm } from "../_ui/ControlledForm/ControlledForm";
import { ControlledDateInput } from "../_ui/ControlledInputs/ControlledDateInput";
import { ControlledSelectInput } from "../_ui/ControlledInputs/ControlledSelectInput";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";

interface IEditTargetPageProps {
  readonly editorBusy?: boolean;
  readonly editorResult?: ActionResult;
  readonly loadedTarget?: ITarget;
  readonly actions?: {
    readonly resetEditorResult: () => PayloadAction;
    readonly startLoadTarget: () => PayloadAction;
    readonly startSaveTarget: (target: ITarget) => PayloadAction;
  };

  // added by connected react router
  readonly match?: Match<{ readonly targetId: string }>;
}

interface IEditTargetPageState {
  readonly currentValue: ITarget;
  readonly validationResult: ITargetValidationResult;
}

function mapStateToProps(state: IRootState, props: IEditTargetPageProps): IEditTargetPageProps {
  const targetId = props.match.params.targetId;
  return {
    ...props,
    editorBusy: state.targets.editorBusy,
    editorResult: state.targets.editorResult,
    loadedTarget: state.targets.loadedTargets[targetId],
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: IEditTargetPageProps): IEditTargetPageProps {
  const targetId = props.match.params.targetId;
  return {
    ...props,
    actions: {
      resetEditorResult: (): PayloadAction => dispatch(setEditorResult(undefined)),
      startLoadTarget: (): PayloadAction => dispatch(startLoadTarget(targetId)),
      startSaveTarget: (target): PayloadAction => dispatch(startSaveTarget(target)),
    },
  };
}

class UCEditTargetPage extends PureComponent<IEditTargetPageProps, IEditTargetPageState> {
  constructor(props: IEditTargetPageProps) {
    super(props);

    this.resetEditor(true);

    this.resetEditor = this.resetEditor.bind(this);
    this.renderMacroTargetInput = this.renderMacroTargetInput.bind(this);
    this.renderTargetSummary = this.renderTargetSummary.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleBodyWeightChange = this.handleBodyWeightChange.bind(this);
    this.handleMaintenanceCaloriesChange = this.handleMaintenanceCaloriesChange.bind(this);
    this.handleCalorieAdjustmentChange = this.handleCalorieAdjustmentChange.bind(this);
    this.handleCarbohydratesTargetModeChange = this.handleCarbohydratesTargetModeChange.bind(this);
    this.handleCarbohydratesTargetValueChange = this.handleCarbohydratesTargetValueChange.bind(this);
    this.handleProteinTargetModeChange = this.handleProteinTargetModeChange.bind(this);
    this.handleProteinTargetValueChange = this.handleProteinTargetValueChange.bind(this);
    this.handleFatTargetModeChange = this.handleFatTargetModeChange.bind(this);
    this.handleFatTargetValueChange = this.handleFatTargetValueChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateModel = this.updateModel.bind(this);
  }

  public componentDidMount(): void {
    this.props.actions.resetEditorResult();

    const targetId = this.props.match.params.targetId;
    if (targetId) {
      this.props.actions.startLoadTarget();
    }
  }

  public componentDidUpdate(
    prevProps: Readonly<IEditTargetPageProps>,
    prevState: Readonly<IEditTargetPageState>,
  ): void {
    const loadedTarget = this.props.loadedTarget;
    if (loadedTarget !== prevProps.loadedTarget || (loadedTarget && !prevState.currentValue.id)) {
      this.updateModel(loadedTarget);
    }
  }

  public render(): ReactNode {
    const { match, editorBusy, editorResult } = this.props;
    const { currentValue, validationResult } = this.state;
    const errors = validationResult.errors || {};

    const targetId = match.params.targetId;
    const creatingNew = !targetId;

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
              <Link to={"/targets"}>
                <IconBtn
                  icon={"sports_score"}
                  text={"All Targets"}
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
            <h1>{creatingNew ? "Create" : "Edit"} Target</h1>
            <ControlledForm onSubmit={this.handleSubmit}>
              <div className={bs.row}>
                <div className={combine(bs.col6, bs.mb3)}>
                  <ControlledDateInput
                    id={"startDate"}
                    label={"Start Date"}
                    value={formatDate(currentValue.startDate, "system") || ""}
                    onValueChange={this.handleStartDateChange}
                    disabled={editorBusy}
                    error={errors.startDate}
                  />
                </div>
                <div className={combine(bs.col6, bs.mb3)}>
                  <ControlledTextInput
                    id={"bodyWeightKg"}
                    label={"Body Weight (kg)"}
                    placeholder={"Body Weight (kg)"}
                    value={ControlledTextInput.safeNumericValue(currentValue.bodyWeightKg)}
                    onValueChange={this.handleBodyWeightChange}
                    disabled={editorBusy}
                    error={errors.bodyWeightKg}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
              </div>
              <div className={bs.row}>
                <div className={combine(bs.col6, bs.mb3)}>
                  <ControlledTextInput
                    id={"maintenanceCalories"}
                    label={"Maintenance Calories"}
                    placeholder={"Maintenance Calories"}
                    value={ControlledTextInput.safeNumericValue(currentValue.maintenanceCalories)}
                    onValueChange={this.handleMaintenanceCaloriesChange}
                    disabled={editorBusy}
                    error={errors.maintenanceCalories}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                <div className={combine(bs.col6, bs.mb3)}>
                  <ControlledSelectInput
                    id={"calorieAdjustment"}
                    label={"Calorie Adjustment"}
                    value={ControlledTextInput.safeNumericValue(currentValue.calorieAdjustment)}
                    onValueChange={this.handleCalorieAdjustmentChange}
                    disabled={editorBusy}
                    error={errors.calorieAdjustment}
                  >
                    <option value={"0.9"}>-10%</option>
                    <option value={"0.95"}>-5%</option>
                    <option value={"1"}>0%</option>
                    <option value={"1.05"}>+5%</option>
                    <option value={"1.1"}>+10%</option>
                  </ControlledSelectInput>
                </div>
              </div>
              {this.renderMacroTargetInput(
                "Carbohydrates",
                currentValue.carbohydratesTargetMode,
                currentValue.carbohydratesTargetValue,
                errors.carbohydratesTargetMode,
                errors.carbohydratesTargetValue,
                this.handleCarbohydratesTargetModeChange,
                this.handleCarbohydratesTargetValueChange,
              )}
              {this.renderMacroTargetInput(
                "Fat",
                currentValue.fatTargetMode,
                currentValue.fatTargetValue,
                errors.fatTargetMode,
                errors.fatTargetValue,
                this.handleFatTargetModeChange,
                this.handleFatTargetValueChange,
              )}
              {this.renderMacroTargetInput(
                "Protein",
                currentValue.proteinTargetMode,
                currentValue.proteinTargetValue,
                errors.proteinTargetMode,
                errors.proteinTargetValue,
                this.handleProteinTargetModeChange,
                this.handleProteinTargetValueChange,
              )}
              {this.renderTargetSummary()}
              {errors.overallTarget && (
                <>
                  <div className={bs.row}>
                    <div className={bs.col}>
                      <div className={combine(bs.alert, bs.alertDanger)}>
                        <p className={bs.mb0}>{errors.overallTarget}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.mb3)}>
                  <IconBtn
                    icon={editorBusy ? "hourglass_empty" : "save"}
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

  private renderMacroTargetInput(
    macroName: string,
    mode: TargetMode,
    value: number,
    modeError: string,
    valueError: string,
    handleModeChange: (mode: string) => void,
    handleValueChange: (value: string) => void,
  ): ReactNode {
    const { editorBusy } = this.props;

    return (
      <div className={bs.row}>
        <div className={combine(bs.col6, bs.mb3)}>
          <ControlledSelectInput
            id={`${macroName}TargetMode`}
            label={`${macroName} Target Mode`}
            value={mode}
            onValueChange={handleModeChange}
            disabled={editorBusy}
            error={modeError}
          >
            <option value={TargetMode.PERCENTAGE_OF_CALORIES}>Percentage of calories</option>
            <option value={TargetMode.G_PER_KG_OF_BODY_WEIGHT}>Grams per KG of body weight</option>
            <option value={TargetMode.ABSOLUTE}>Absolute value</option>
            <option value={TargetMode.REMAINDER_OF_CALORIES}>Remainder of calories</option>
          </ControlledSelectInput>
        </div>
        <div className={combine(bs.col6, bs.mb3)}>
          <ControlledTextInput
            id={`${macroName}TargetValue`}
            label={`${macroName} Target Value`}
            value={mode === TargetMode.REMAINDER_OF_CALORIES ? "" : ControlledTextInput.safeNumericValue(value)}
            onValueChange={handleValueChange}
            disabled={editorBusy || mode === TargetMode.REMAINDER_OF_CALORIES}
            error={valueError}
            inputProps={{
              type: "number",
              step: 0.1,
            }}
          />
        </div>
      </div>
    );
  }

  private renderTargetSummary(): ReactNode {
    const { currentValue } = this.state;
    const macroSummary = generateMacroSummary([], [], {
      ...getDefaultTarget(),
      ...currentValue,
    });

    return (
      <div className={bs.row}>
        <div className={bs.col}>
          <h3>Computed Targets</h3>
          <table className={combine(bs.table, bs.tableBordered)}>
            <tbody>
              <tr>
                <td>Carbohydrates</td>
                <td>{formatMeasurement(macroSummary.targetCarbohydrates, "g")}</td>
                <td>
                  {formatPercent((macroSummary.targetCaloriesFromCarbohydrates / macroSummary.targetCalories) * 100)}
                </td>
                <td>{formatLargeNumber(macroSummary.targetCaloriesFromCarbohydrates)} kcal</td>
              </tr>
              <tr>
                <td>Fat</td>
                <td>{formatMeasurement(macroSummary.targetFat, "g")}</td>
                <td>{formatPercent((macroSummary.targetCaloriesFromFat / macroSummary.targetCalories) * 100)}</td>
                <td>{formatLargeNumber(macroSummary.targetCaloriesFromFat)} kcal</td>
              </tr>
              <tr>
                <td>Protein</td>
                <td>{formatMeasurement(macroSummary.targetProtein, "g")}</td>
                <td>{formatPercent((macroSummary.targetCaloriesFromProtein / macroSummary.targetCalories) * 100)}</td>
                <td>{formatLargeNumber(macroSummary.targetCaloriesFromProtein)} kcal</td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <strong>Total Calories</strong>
                </td>
                <td>
                  <strong>{formatLargeNumber(macroSummary.targetCalories)} kcal</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  private resetEditor(init = false): void {
    const { actions } = this.props;

    actions.resetEditorResult();

    const target = {
      ...getDefaultTarget(),
    };

    if (init) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state = {
        currentValue: target,
        validationResult: validateTarget(target),
      };
    } else {
      // reset the URL as well
      history.push(`/targets/edit`);

      this.setState({
        currentValue: target,
        validationResult: validateTarget(target),
      });
    }
  }

  private handleStartDateChange(startDate: Date): void {
    this.updateModel({ startDate });
  }

  private handleBodyWeightChange(value: string): void {
    this.updateModel({ bodyWeightKg: value === "" ? null : parseFloat(value) });
  }

  private handleMaintenanceCaloriesChange(value: string): void {
    this.updateModel({
      maintenanceCalories: value === "" ? null : parseFloat(value),
    });
  }

  private handleCalorieAdjustmentChange(value: string): void {
    this.updateModel({
      calorieAdjustment: value === null ? 1 : parseFloat(value),
    });
  }

  private handleCarbohydratesTargetModeChange(value: string): void {
    this.updateModel({ carbohydratesTargetMode: value as TargetMode });
  }

  private handleCarbohydratesTargetValueChange(value: string): void {
    this.updateModel({
      carbohydratesTargetValue: value === "" ? null : parseFloat(value),
    });
  }

  private handleFatTargetModeChange(value: string): void {
    this.updateModel({ fatTargetMode: value as TargetMode });
  }

  private handleFatTargetValueChange(value: string): void {
    this.updateModel({
      fatTargetValue: value === "" ? null : parseFloat(value),
    });
  }

  private handleProteinTargetModeChange(value: string): void {
    this.updateModel({ proteinTargetMode: value as TargetMode });
  }

  private handleProteinTargetValueChange(value: string): void {
    this.updateModel({
      proteinTargetValue: value === "" ? null : parseFloat(value),
    });
  }

  private handleSubmit(): void {
    this.props.actions.startSaveTarget(this.state.currentValue);
  }

  private updateModel(target: Partial<ITarget>): void {
    const updatedTarget = {
      ...this.state.currentValue,
      ...target,
    };
    this.setState({
      currentValue: updatedTarget,
      validationResult: validateTarget(updatedTarget),
    });
  }
}

export const EditTargetPage = connect(mapStateToProps, mapDispatchToProps)(UCEditTargetPage);
