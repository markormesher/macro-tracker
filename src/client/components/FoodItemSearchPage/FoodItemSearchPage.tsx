import React, { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { IFoodItem } from "../../../models/IFoodItem";
import { formatLargeNumber, formatMeasurement, formatNutritionBaseSize } from "../../../utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import { combine } from "../../helpers/style-helpers";
import { setEditorResult, startSaveFoodItem } from "../../redux/food-items";
import { startSearchFoodItemByKeyword, startSearchFoodItemByUpc } from "../../redux/food-search-api";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledBarcodeInput } from "../_ui/ControlledBarcodeInput/ControlledBarcodeInput";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";

interface IFoodItemSearchPageProps {
  readonly upcSearchBusy?: boolean;
  readonly keywordSearchBusy?: boolean;
  readonly searchedFoodItemsByUpc?: { readonly [key: string]: IFoodItem[] };
  readonly searchedFoodItemsByKeyword?: { readonly [key: string]: IFoodItem[] };
  readonly editorResult?: ActionResult;
  readonly lastFoodItemSaved?: IFoodItem;
  readonly actions?: {
    readonly resetEditorResult: () => PayloadAction;
    readonly searchFoodItemByUpc: (upc: string) => PayloadAction;
    readonly searchFoodItemByKeyword: (keyword: string) => PayloadAction;
    readonly startSaveFoodItem: (foodItem: IFoodItem) => PayloadAction;
  };
}

interface IFoodItemSearchPageState {
  readonly lastSearchMode?: "upc" | "keyword";
  readonly upcEntered?: string;
  readonly keywordEntered?: string;
  readonly upcSearched?: string;
  readonly keywordSearched?: string;
}

function mapStateToProps(state: IRootState, props: IFoodItemSearchPageProps): IFoodItemSearchPageProps {
  return {
    ...props,
    upcSearchBusy: state.foodSearchApi.upcSearchBusy,
    keywordSearchBusy: state.foodSearchApi.keywordSearchBusy,
    searchedFoodItemsByUpc: state.foodSearchApi.searchedFoodItemsByUpc,
    searchedFoodItemsByKeyword: state.foodSearchApi.searchedFoodItemsByKeyword,
    editorResult: state.foodItems.editorResult,
    lastFoodItemSaved: state.foodItems.lastFoodItemSaved,
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: IFoodItemSearchPageProps): IFoodItemSearchPageProps {
  return {
    ...props,
    actions: {
      resetEditorResult: (): PayloadAction => dispatch(setEditorResult(undefined)),
      searchFoodItemByUpc: (upc: string): PayloadAction => dispatch(startSearchFoodItemByUpc(upc)),
      searchFoodItemByKeyword: (keyword: string): PayloadAction => dispatch(startSearchFoodItemByKeyword(keyword)),
      startSaveFoodItem: (foodItem): PayloadAction => dispatch(startSaveFoodItem(foodItem)),
    },
  };
}

class UCFoodItemSearchPage extends PureComponent<IFoodItemSearchPageProps, IFoodItemSearchPageState> {
  constructor(props: IFoodItemSearchPageProps) {
    super(props);

    this.state = {
      lastSearchMode: null,
      upcEntered: null,
      keywordEntered: null,
      upcSearched: null,
      keywordSearched: null,
    };

    this.renderSearchResults = this.renderSearchResults.bind(this);
    this.handleUpcChange = this.handleUpcChange.bind(this);
    this.handleKeywordChange = this.handleKeywordChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.createFoodItem = this.createFoodItem.bind(this);
  }

  public componentDidMount(): void {
    this.props.actions.resetEditorResult();
  }

  public render(): ReactNode {
    const { upcSearchBusy, keywordSearchBusy, editorResult } = this.props;
    const { upcEntered, keywordEntered } = this.state;

    const searchBusy = keywordSearchBusy || upcSearchBusy;
    const searchBlocked = (!upcEntered && !keywordEntered) || (!!upcEntered && !!keywordEntered);

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
              <Link to={`/food-items/edit/${lastFoodItemSaved.id}`}>
                <IconBtn
                  icon={"edit"}
                  text={"Edit Details"}
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
            <h1>Food Item Search</h1>
          </div>
        </div>
        <div className={bs.row}>
          <div className={combine(bs.col12, bs.mb3)}>
            <ControlledBarcodeInput
              id={"upc"}
              label={"UPC"}
              placeholder={"UPC"}
              value={upcEntered || ""}
              onValueChange={this.handleUpcChange}
              disabled={upcSearchBusy}
              inputProps={{
                type: "number",
              }}
            />
          </div>
        </div>
        <div className={bs.row}>
          <div className={combine(bs.col12, bs.mb3)}>
            <ControlledTextInput
              id={"keyword"}
              label={"Keyword"}
              placeholder={"Keyword"}
              value={keywordEntered || ""}
              onValueChange={this.handleKeywordChange}
              disabled={keywordSearchBusy}
            />
          </div>
        </div>
        <div className={bs.row}>
          <div className={combine(bs.col12, bs.mb3)}>
            <IconBtn
              icon={searchBusy ? "hourglass_empty" : "search"}
              text={"Search"}
              onClick={this.handleSearch}
              btnProps={{
                className: bs.btnOutlinePrimary,
                disabled: searchBusy || searchBlocked,
                style: {
                  width: "100%",
                },
              }}
              iconProps={{
                spin: searchBusy,
              }}
            />
          </div>
        </div>
        {this.renderSearchResults()}
      </ContentWrapper>
    );
  }

  private renderSearchResults(): ReactNode {
    const { searchedFoodItemsByUpc, searchedFoodItemsByKeyword, upcSearchBusy, keywordSearchBusy } = this.props;
    const { lastSearchMode, upcSearched, keywordSearched } = this.state;

    const searchBusy = upcSearchBusy || keywordSearchBusy;

    let searchResults = null;
    if (lastSearchMode === "upc") {
      searchResults = searchedFoodItemsByUpc[upcSearched];
    } else if (lastSearchMode === "keyword") {
      searchResults = searchedFoodItemsByKeyword[keywordSearched];
    }

    if (searchBusy || !searchResults) {
      return null;
    } else if (searchResults.length === 0) {
      return (
        <div className={bs.row}>
          <div className={bs.col}>
            <p>
              <em className={bs.textMuted}>No search results.</em>
            </p>
          </div>
        </div>
      );
    } else {
      return searchResults.map((fi, idx) => {
        const infoChunks: ReactNode[] = [];

        infoChunks.push(<span key={`info-chunk-calories`}>{formatLargeNumber(fi.caloriesPerBaseAmount)} kcal</span>);

        infoChunks.push(<span key={`info-chunk-fat`}>{formatMeasurement(fi.fatPerBaseAmount, "g")} fat</span>);

        infoChunks.push(
          <span key={`info-chunk-carbohydrates`}>{formatMeasurement(fi.carbohydratePerBaseAmount, "g")} carbs</span>,
        );

        infoChunks.push(
          <span key={`info-chunk-protein`}>{formatMeasurement(fi.proteinPerBaseAmount, "g")} protein</span>,
        );

        for (let i = 1; i < infoChunks.length; i += 2) {
          infoChunks.splice(
            i,
            0,
            <span key={`spacer-${i}`} className={bs.mx1}>
              &bull;
            </span>,
          );
        }

        let btn: ReactNode;
        if (fi.id) {
          // item came from our database
          btn = (
            <Link to={`/diary-entries/edit?initFood=${fi.id}`}>
              <IconBtn
                icon={"today"}
                text={"Add to Diary"}
                btnProps={{
                  className: combine(bs.btnOutlineDark),
                }}
              />
            </Link>
          );
        } else {
          // item came from remote API and has nutrition data already
          btn = (
            <IconBtn
              icon={"add"}
              text={"Add"}
              payload={fi}
              onClick={this.createFoodItem}
              btnProps={{
                className: combine(bs.btnOutlineDark),
              }}
            />
          );
        }

        return (
          <div className={bs.row} key={idx}>
            <div className={combine(bs.col, bs.dFlex, bs.mb2)}>
              <p className={combine(bs.flexGrow1, bs.mb1)}>
                {fi.name}
                {fi.id && <span className={bs.textMuted}> (already added)</span>}
                {!fi.id && fi.apiSource === "nutritionix" && (
                  <span className={bs.textMuted}> (via Nutritionix API)</span>
                )}
                {!fi.id && fi.apiSource === "tesco" && <span className={bs.textMuted}> (via Tesco API)</span>}
                <br />
                <span className={combine(bs.textMuted, bs.small)}>{fi.brand}</span>
                {fi.caloriesPerBaseAmount > 0 && (
                  <>
                    <br />
                    <span className={combine(bs.textMuted, bs.small)}>
                      Per {formatNutritionBaseSize(fi)}: {infoChunks}
                    </span>
                  </>
                )}
              </p>
              <div
                className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0, bs.myAuto)}
                style={{ whiteSpace: "nowrap" }}
              >
                {btn}
              </div>
            </div>
          </div>
        );
      });
    }
  }

  private handleUpcChange(upcEntered: string): void {
    this.setState({ upcEntered: upcEntered ? upcEntered.trim() : null });
  }

  private handleKeywordChange(keywordEntered: string): void {
    this.setState({ keywordEntered });
  }

  private handleSearch(): void {
    const upcEntered = this.state.upcEntered;
    const keywordEntered = this.state.keywordEntered;

    if (upcEntered) {
      // search by UPC
      this.setState({
        upcSearched: upcEntered,
        lastSearchMode: "upc",
      });
      this.props.actions.searchFoodItemByUpc(upcEntered);
    } else if (keywordEntered) {
      // search by keyword
      this.setState({
        keywordSearched: keywordEntered,
        lastSearchMode: "keyword",
      });
      this.props.actions.searchFoodItemByKeyword(keywordEntered);
    }
  }

  private createFoodItem(foodItem: IFoodItem): void {
    this.props.actions.startSaveFoodItem(foodItem);
  }
}

export const FoodItemSearchPage = connect(mapStateToProps, mapDispatchToProps)(UCFoodItemSearchPage);
