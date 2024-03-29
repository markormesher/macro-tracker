import React, { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { match as Match } from "react-router";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { v4 } from "uuid";
import { FoodMeasurementUnit } from "../../../utils/enums";
import { getDefaultFoodItem, IFoodItem, IFoodItemValidationResult, validateFoodItem } from "../../../models/IFoodItem";
import { getDefaultServingSize, IServingSize } from "../../../models/IServingSize";
import { formatMeasurementUnit, formatNutritionBaseSize, uniqueArray } from "../../../utils/formatters";
import { getFoodItemDataWarnings } from "../../../utils/helpers";
import * as bs from "../../global-styles/Bootstrap.scss";
import { combine } from "../../helpers/style-helpers";
import { setEditorResult, startLoadAllFoodItems, startLoadFoodItem, startSaveFoodItem } from "../../redux/food-items";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledBarcodeInput } from "../_ui/ControlledBarcodeInput/ControlledBarcodeInput";
import { ControlledForm } from "../_ui/ControlledForm/ControlledForm";
import { ControlledRadioInput } from "../_ui/ControlledInputs/ControlledRadioInput";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";
import { SuggestionTextInput } from "../_ui/SuggestionTextInput/SuggestionTextInput";

interface IEditFoodItemPageProps {
  readonly editorBusy?: boolean;
  readonly editorResult?: ActionResult;
  readonly loadedFoodItem?: IFoodItem;
  readonly lastFoodItemSaved?: IFoodItem;
  readonly allBrands?: string[];
  readonly actions?: {
    readonly resetEditorResult: () => PayloadAction;
    readonly startLoadFoodItem: () => PayloadAction;
    readonly startLoadAllFoodItems: () => PayloadAction;
    readonly startSaveFoodItem: (foodItem: IFoodItem) => PayloadAction;
  };

  // added by connected react router
  readonly match?: Match<{ readonly foodItemId: string }>;
}

interface IEditFoodItemPageState {
  readonly currentValue: IFoodItem;
  readonly validationResult: IFoodItemValidationResult;
  readonly upcInput: string;
}

function mapStateToProps(state: IRootState, props: IEditFoodItemPageProps): IEditFoodItemPageProps {
  const foodItemId = props.match.params.foodItemId;
  return {
    ...props,
    editorBusy: state.foodItems.editorBusy,
    editorResult: state.foodItems.editorResult,
    loadedFoodItem: state.foodItems.loadedFoodItems[foodItemId],
    lastFoodItemSaved: state.foodItems.lastFoodItemSaved,
    allBrands: state.foodItems.allFoodItems
      .map((fi) => fi.brand)
      .sort((a, b) => a.localeCompare(b))
      .filter((v, i, a) => i === a.indexOf(v)),
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: IEditFoodItemPageProps): IEditFoodItemPageProps {
  const foodItemId = props.match.params.foodItemId;
  return {
    ...props,
    actions: {
      resetEditorResult: (): PayloadAction => dispatch(setEditorResult(undefined)),
      startLoadFoodItem: (): PayloadAction => dispatch(startLoadFoodItem(foodItemId)),
      startLoadAllFoodItems: (): PayloadAction => dispatch(startLoadAllFoodItems()),
      startSaveFoodItem: (foodItem): PayloadAction => dispatch(startSaveFoodItem(foodItem)),
    },
  };
}

class UCEditFoodItemPage extends PureComponent<IEditFoodItemPageProps, IEditFoodItemPageState> {
  constructor(props: IEditFoodItemPageProps) {
    super(props);

    const defaultFoodItem = {
      ...getDefaultFoodItem(),
    };

    this.state = {
      currentValue: defaultFoodItem,
      validationResult: validateFoodItem(defaultFoodItem),
      upcInput: "",
    };

    this.renderServingSizeInputs = this.renderServingSizeInputs.bind(this);
    this.renderInaccurateDataWarning = this.renderInaccurateDataWarning.bind(this);
    this.handleBrandChange = this.handleBrandChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleUpcInputChanged = this.handleUpcInputChanged.bind(this);
    this.handleAddUpc = this.handleAddUpc.bind(this);
    this.handleRemoveUpc = this.handleRemoveUpc.bind(this);
    this.handleMeasurementUnitChange = this.handleMeasurementUnitChange.bind(this);
    this.handleCaloriesPerBaseAmountChange = this.handleCaloriesPerBaseAmountChange.bind(this);
    this.handleFatPerBaseAmountChange = this.handleFatPerBaseAmountChange.bind(this);
    this.handleSatFatPerBaseAmountChange = this.handleSatFatPerBaseAmountChange.bind(this);
    this.handleCarbohydratePerBaseAmountChange = this.handleCarbohydratePerBaseAmountChange.bind(this);
    this.handleSugarPerBaseAmountChange = this.handleSugarPerBaseAmountChange.bind(this);
    this.handleFibrePerBaseAmountChange = this.handleFibrePerBaseAmountChange.bind(this);
    this.handleProteinPerBaseAmountChange = this.handleProteinPerBaseAmountChange.bind(this);
    this.handleSaltPerBaseAmountChange = this.handleSaltPerBaseAmountChange.bind(this);
    this.handleServingSizeLabelChange = this.handleServingSizeLabelChange.bind(this);
    this.handleServingSizeMeasurementChange = this.handleServingSizeMeasurementChange.bind(this);
    this.updateServingSizes = this.updateServingSizes.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateModel = this.updateModel.bind(this);
  }

  public componentDidMount(): void {
    this.props.actions.resetEditorResult();
    this.props.actions.startLoadAllFoodItems();

    const foodItemId = this.props.match.params.foodItemId;
    if (foodItemId) {
      this.props.actions.startLoadFoodItem();
    }
  }

  public componentDidUpdate(
    prevProps: Readonly<IEditFoodItemPageProps>,
    prevState: Readonly<IEditFoodItemPageState>,
  ): void {
    const loadedFoodItem = this.props.loadedFoodItem;
    if (loadedFoodItem !== prevProps.loadedFoodItem || (loadedFoodItem && !prevState.currentValue.id)) {
      this.updateModel(loadedFoodItem);
    }
  }

  public render(): ReactNode {
    const { match, editorBusy, editorResult, allBrands } = this.props;
    const { currentValue, validationResult } = this.state;
    const errors = validationResult.errors || {};

    const foodItemId = match.params.foodItemId;
    const creatingNew = !foodItemId;

    if (!creatingNew && !currentValue.id) {
      // still loading
      return <LoadingSpinner centre={true} />;
    }

    let statusMsg: ReactNode = null;
    if (editorResult === "success") {
      const { lastFoodItemSaved } = this.props;
      return (
        <ContentWrapper>
          <div className={bs.row}>
            <div className={bs.col}>
              <h1>Done!</h1>
              <p>{lastFoodItemSaved.name} has been saved.</p>
            </div>
          </div>
          <div className={bs.row}>
            <div className={bs.col6}>
              <Link to={"/food-items"}>
                <IconBtn
                  icon={"arrow_forward"}
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
              <Link to={`/diary-entries/edit?initFood=${lastFoodItemSaved.id}`}>
                <IconBtn
                  icon={"today"}
                  text={"Add to Diary"}
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
            <h1>{creatingNew ? "Create" : "Edit"} Food Item</h1>
            <ControlledForm onSubmit={this.handleSubmit}>
              <div className={bs.row}>
                <div className={combine(bs.col12, bs.mb3)}>
                  <SuggestionTextInput
                    id={"brand"}
                    label={"Brand"}
                    placeholder={"Brand"}
                    value={currentValue.brand || ""}
                    disabled={editorBusy}
                    error={errors.brand}
                    onValueChange={this.handleBrandChange}
                    suggestionOptions={allBrands}
                    inputProps={{
                      autoCapitalize: "words",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"name"}
                    label={"Name"}
                    placeholder={"Name"}
                    value={currentValue.name || ""}
                    onValueChange={this.handleNameChange}
                    disabled={editorBusy}
                    error={errors.name}
                    inputProps={{
                      autoCapitalize: "words",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <div className={combine(bs.dFlex, bs.alignItemsEnd, (currentValue.upcs || []).length && bs.mb2)}>
                    <div className={combine(bs.flexGrow1, bs.me1)}>
                      <ControlledBarcodeInput
                        id={"upcs"}
                        label={"UPCs"}
                        placeholder={"Add UPC"}
                        value={this.state.upcInput || ""}
                        onValueChange={this.handleUpcInputChanged}
                        disabled={editorBusy}
                        error={errors.upcs}
                      />
                    </div>
                    <div className={bs.flexGrow0}>
                      <IconBtn
                        icon={"add"}
                        text={"Add UPC"}
                        payload={this.state.upcInput}
                        onClick={this.handleAddUpc}
                        btnProps={{
                          disabled: editorBusy || !this.state.upcInput,
                          className: combine(bs.btnOutlineDark, bs.ms1),
                        }}
                      />
                    </div>
                  </div>
                  {(currentValue.upcs || []).map((upc) => (
                    <span key={upc} className={combine(bs.dInlineBlock, bs.me3)}>
                      <kbd className={bs.me2}>{upc}</kbd>
                      <IconBtn
                        icon={"delete"}
                        payload={upc}
                        onClick={this.handleRemoveUpc}
                        btnProps={{
                          disabled: editorBusy,
                          className: bs.btnOutlineDark,
                        }}
                      />
                    </span>
                  ))}
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <label>Measurement Unit</label>
                  <div className={bs.row}>
                    <div className={bs.col4}>
                      <ControlledRadioInput
                        id={"measurementUnit_g"}
                        name={"measurementUnit"}
                        label={"g"}
                        checked={currentValue.measurementUnit === "g"}
                        value={"g"}
                        onValueChange={this.handleMeasurementUnitChange}
                        disabled={editorBusy}
                      />
                    </div>
                    <div className={bs.col4}>
                      <ControlledRadioInput
                        id={"measurementUnit_ml"}
                        name={"measurementUnit"}
                        label={"ml"}
                        checked={currentValue.measurementUnit === "ml"}
                        value={"ml"}
                        onValueChange={this.handleMeasurementUnitChange}
                        disabled={editorBusy}
                      />
                    </div>
                    <div className={bs.col4}>
                      <ControlledRadioInput
                        id={"measurementUnit_single_serving"}
                        name={"measurementUnit"}
                        label={"serving"}
                        checked={currentValue.measurementUnit === "single_serving"}
                        value={"single_serving"}
                        onValueChange={this.handleMeasurementUnitChange}
                        disabled={editorBusy}
                      />
                    </div>
                  </div>
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"caloriesPerBaseAmount"}
                    label={`Calories per ${formatNutritionBaseSize(currentValue)}`}
                    placeholder={"Calories"}
                    value={ControlledTextInput.safeNumericValue(currentValue.caloriesPerBaseAmount)}
                    onValueChange={this.handleCaloriesPerBaseAmountChange}
                    disabled={editorBusy}
                    error={errors.caloriesPerBaseAmount}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"fatPerBaseAmount"}
                    label={`Fat per ${formatNutritionBaseSize(currentValue)}`}
                    placeholder={"Fat"}
                    value={ControlledTextInput.safeNumericValue(currentValue.fatPerBaseAmount)}
                    onValueChange={this.handleFatPerBaseAmountChange}
                    disabled={editorBusy}
                    error={errors.fatPerBaseAmount}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"satFatPerBaseAmount"}
                    label={`Sat. Fat per ${formatNutritionBaseSize(currentValue)}`}
                    placeholder={"Sat. Fat"}
                    value={ControlledTextInput.safeNumericValue(currentValue.satFatPerBaseAmount)}
                    onValueChange={this.handleSatFatPerBaseAmountChange}
                    disabled={editorBusy}
                    error={errors.satFatPerBaseAmount}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"carbohydratesPerBaseAmount"}
                    label={`Carbohydrates per ${formatNutritionBaseSize(currentValue)}`}
                    placeholder={"Carbohydrates"}
                    value={ControlledTextInput.safeNumericValue(currentValue.carbohydratePerBaseAmount)}
                    onValueChange={this.handleCarbohydratePerBaseAmountChange}
                    disabled={editorBusy}
                    error={errors.carbohydratePerBaseAmount}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"sugarPerBaseAmount"}
                    label={`Sugar per ${formatNutritionBaseSize(currentValue)}`}
                    placeholder={"Sugar"}
                    value={ControlledTextInput.safeNumericValue(currentValue.sugarPerBaseAmount)}
                    onValueChange={this.handleSugarPerBaseAmountChange}
                    disabled={editorBusy}
                    error={errors.sugarPerBaseAmount}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"fibrePerBaseAmount"}
                    label={`Fibre per ${formatNutritionBaseSize(currentValue)}`}
                    placeholder={"Fibre"}
                    value={ControlledTextInput.safeNumericValue(currentValue.fibrePerBaseAmount)}
                    onValueChange={this.handleFibrePerBaseAmountChange}
                    disabled={editorBusy}
                    error={errors.fibrePerBaseAmount}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"proteinPerBaseAmount"}
                    label={`Protein per ${formatNutritionBaseSize(currentValue)}`}
                    placeholder={"Protein"}
                    value={ControlledTextInput.safeNumericValue(currentValue.proteinPerBaseAmount)}
                    onValueChange={this.handleProteinPerBaseAmountChange}
                    disabled={editorBusy}
                    error={errors.proteinPerBaseAmount}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                <div className={combine(bs.col12, bs.mb3)}>
                  <ControlledTextInput
                    id={"saltPerBaseAmount"}
                    label={`Salt per ${formatNutritionBaseSize(currentValue)}`}
                    placeholder={"Salt"}
                    value={ControlledTextInput.safeNumericValue(currentValue.saltPerBaseAmount)}
                    onValueChange={this.handleSaltPerBaseAmountChange}
                    disabled={editorBusy}
                    error={errors.saltPerBaseAmount}
                    inputProps={{
                      type: "number",
                    }}
                  />
                </div>
                {currentValue.measurementUnit !== "single_serving" && (
                  <>
                    <div className={combine(bs.col12, bs.mb3)}>
                      <label className={bs.formLabel}>Serving Sizes</label>
                      {this.renderServingSizeInputs()}
                    </div>
                  </>
                )}
              </div>

              {this.renderInaccurateDataWarning()}

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

  private renderServingSizeInputs(): ReactNode {
    const { editorBusy } = this.props;
    const { currentValue } = this.state;

    // show all valid sizes plus one blank input
    const servingSizesToShow = currentValue.servingSizes
      .filter((ss) => !ss.deleted)
      .filter((ss) => ss.label || (!isNaN(ss.measurement) && ss.measurement !== null));
    servingSizesToShow.push(getDefaultServingSize(v4()));

    return servingSizesToShow.map((ss, idx) => (
      <div className={combine(bs.dFlex, idx > 0 && bs.mt2)} key={`serving_size_${ss.id}`}>
        <div className={combine(bs.flexGrow0, bs.pe1, bs.mAuto)}>1</div>
        <div className={bs.flexGrow1}>
          <ControlledTextInput
            id={`serving_size_label_${ss.id}`}
            label={null}
            value={ss.label || ""}
            disabled={editorBusy}
            onValueChange={this.handleServingSizeLabelChange}
            inputProps={{
              autoCapitalize: "off",
            }}
          />
        </div>
        <div className={combine(bs.flexGrow0, bs.px1, bs.mAuto)}>=</div>
        <div className={bs.flexGrow1}>
          <ControlledTextInput
            id={`serving_size_measurement_${ss.id}`}
            label={null}
            value={isNaN(ss.measurement) || ss.measurement === null ? "" : ss.measurement}
            disabled={editorBusy}
            onValueChange={this.handleServingSizeMeasurementChange}
            inputProps={{
              type: "number",
            }}
          />
        </div>
        <div className={combine(bs.flexGrow0, bs.ps1, bs.mAuto)}>
          {formatMeasurementUnit(currentValue.measurementUnit)}
        </div>
      </div>
    ));
  }

  private renderInaccurateDataWarning(): ReactNode {
    const { currentValue } = this.state;
    const warnings: string[] = getFoodItemDataWarnings(currentValue);

    if (warnings.length > 0) {
      return (
        <div className={bs.row}>
          <div className={bs.col}>
            <div className={combine(bs.alert, bs.alertDanger)}>
              <h5>Are you sure?</h5>
              <ul className={bs.mb0}>
                {warnings.map((w, idx) => (
                  <li key={`warning-${idx}`}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private handleBrandChange(brand: string): void {
    this.updateModel({ brand });
  }

  private handleNameChange(name: string): void {
    this.updateModel({ name });
  }

  private handleUpcInputChanged(upcInput: string): void {
    this.setState({ upcInput });
  }

  private handleAddUpc(upc: string): void {
    this.setState({ upcInput: "" });
    this.updateModel({
      upcs: uniqueArray([...(this.state.currentValue.upcs || []), upc]),
    });
  }

  private handleRemoveUpc(upc: string): void {
    this.updateModel({
      upcs: (this.state.currentValue.upcs || []).filter((u) => u !== upc),
    });
  }

  private handleMeasurementUnitChange(measurementUnit: FoodMeasurementUnit): void {
    this.updateModel({ measurementUnit });
  }

  private handleCaloriesPerBaseAmountChange(value: string): void {
    this.updateModel({
      caloriesPerBaseAmount: value === "" ? null : parseFloat(value),
    });
  }

  private handleFatPerBaseAmountChange(value: string): void {
    this.updateModel({
      fatPerBaseAmount: value === "" ? null : parseFloat(value),
    });
  }

  private handleSatFatPerBaseAmountChange(value: string): void {
    this.updateModel({
      satFatPerBaseAmount: value === "" ? null : parseFloat(value),
    });
  }

  private handleCarbohydratePerBaseAmountChange(value: string): void {
    this.updateModel({
      carbohydratePerBaseAmount: value === "" ? null : parseFloat(value),
    });
  }

  private handleSugarPerBaseAmountChange(value: string): void {
    this.updateModel({
      sugarPerBaseAmount: value === "" ? null : parseFloat(value),
    });
  }

  private handleFibrePerBaseAmountChange(value: string): void {
    this.updateModel({
      fibrePerBaseAmount: value === "" ? null : parseFloat(value),
    });
  }

  private handleProteinPerBaseAmountChange(value: string): void {
    this.updateModel({
      proteinPerBaseAmount: value === "" ? null : parseFloat(value),
    });
  }

  private handleSaltPerBaseAmountChange(value: string): void {
    this.updateModel({
      saltPerBaseAmount: value === "" ? null : parseFloat(value),
    });
  }

  private handleServingSizeLabelChange(value: string, inputId: string): void {
    const ssId = inputId.replace("serving_size_label_", "");
    const originalServingSizes = this.state.currentValue.servingSizes || [];
    let servingSizes: IServingSize[];

    if (originalServingSizes.some((ss) => ss.id === ssId)) {
      // editing an existing one
      servingSizes = originalServingSizes.map((oss) => {
        if (oss.id === ssId) {
          return {
            ...oss,
            label: value,
          };
        } else {
          return oss;
        }
      });
    } else {
      // creating a new one
      servingSizes = [...originalServingSizes, { ...getDefaultServingSize(ssId), label: value }];
    }

    this.updateServingSizes(servingSizes);
  }

  private handleServingSizeMeasurementChange(value: string, inputId: string): void {
    const cleanValue = value === "" ? null : parseFloat(value);
    const ssId = inputId.replace("serving_size_measurement_", "");
    const originalServingSizes = this.state.currentValue.servingSizes || [];
    let servingSizes: IServingSize[];

    if (originalServingSizes.some((ss) => ss.id === ssId)) {
      // editing an existing one
      servingSizes = originalServingSizes.map((oss) => {
        if (oss.id === ssId) {
          return {
            ...oss,
            measurement: cleanValue,
          };
        } else {
          return oss;
        }
      });
    } else {
      // creating a new one
      servingSizes = [...originalServingSizes, { ...getDefaultServingSize(ssId), measurement: cleanValue }];
    }

    this.updateServingSizes(servingSizes);
  }

  private updateServingSizes(servingSizes: IServingSize[]): void {
    const { loadedFoodItem } = this.props;
    const originalServingSizeIds = loadedFoodItem ? loadedFoodItem.servingSizes.map((ss) => ss.id) : [];

    // remove fully-blank sizes that didn't already exist
    servingSizes = servingSizes.filter((ss) => {
      if (originalServingSizeIds.includes(ss.id)) {
        return true;
      }

      return (ss.label && ss.label.trim() !== "") || (ss.measurement !== null && !isNaN(ss.measurement));
    });

    this.updateModel({ servingSizes });
  }

  private handleSubmit(): void {
    this.props.actions.startSaveFoodItem(this.state.currentValue);
  }

  private updateModel(foodItem: Partial<IFoodItem>): void {
    let updatedFoodItem = {
      ...this.state.currentValue,
      ...foodItem,
    };

    // replace [] with null for UPCs
    updatedFoodItem = {
      ...updatedFoodItem,
      upcs: (updatedFoodItem.upcs || []).length === 0 ? null : updatedFoodItem.upcs,
    };

    this.setState({
      currentValue: updatedFoodItem,
      validationResult: validateFoodItem(updatedFoodItem),
    });
  }
}

export const EditFoodItemPage = connect(mapStateToProps, mapDispatchToProps)(UCEditFoodItemPage);
