import { faCalendarDay, faCircleNotch, faPencil, faPlus, faSearch } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { IFoodItem } from "../../../commons/models/IFoodItem";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { formatLargeNumber, formatMeasurement } from "../../helpers/formatters";
import { combine } from "../../helpers/style-helpers";
import { setEditorResult, startSaveFoodItem } from "../../redux/food-items";
import { ActionResult } from "../../redux/helpers/ActionResult";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { startSearchFoodItemByUpc } from "../../redux/nutritionix";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledBarcodeInput } from "../_ui/ControlledBarcodeInput/ControlledBarcodeInput";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";

interface IUpcFoodItemSearchPageProps {
	readonly upcSearchBusy?: boolean;
	readonly searchedFoodItemsByUpc?: { readonly [key: string]: IFoodItem[] };
	readonly editorResult?: ActionResult;
	readonly lastFoodItemSaved?: IFoodItem;
	readonly actions?: {
		readonly resetEditorResult: () => PayloadAction;
		readonly searchFoodItemByUpc: (upc: string) => PayloadAction;
		readonly startSaveFoodItem: (foodItem: IFoodItem) => PayloadAction;
	};
}

interface IUpcFoodItemSearchPageState {
	readonly upcEntered?: string;
	readonly upcSearched?: string;
}

function mapStateToProps(state: IRootState, props: IUpcFoodItemSearchPageProps): IUpcFoodItemSearchPageProps {
	return {
		...props,
		upcSearchBusy: state.nutritionix.upcSearchBusy,
		searchedFoodItemsByUpc: state.nutritionix.searchedFoodItemsByUpc,
		editorResult: state.foodItems.editorResult,
		lastFoodItemSaved: state.foodItems.lastFoodItemSaved,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IUpcFoodItemSearchPageProps): IUpcFoodItemSearchPageProps {
	return {
		...props,
		actions: {
			resetEditorResult: () => dispatch(setEditorResult(undefined)),
			searchFoodItemByUpc: (upc: string) => dispatch(startSearchFoodItemByUpc(upc)),
			startSaveFoodItem: (foodItem) => dispatch(startSaveFoodItem(foodItem)),
		},
	};
}

class UCUpcFoodItemSearchPage extends PureComponent<IUpcFoodItemSearchPageProps, IUpcFoodItemSearchPageState> {

	constructor(props: IUpcFoodItemSearchPageProps, context: any) {
		super(props, context);

		this.state = {
			upcEntered: null,
			upcSearched: null,
		};

		this.renderSearchResults = this.renderSearchResults.bind(this);
		this.handleUpcChange = this.handleUpcChange.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.createFoodItem = this.createFoodItem.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.resetEditorResult();
	}

	public render(): ReactNode {
		const { upcSearchBusy, editorResult } = this.props;
		const { upcEntered } = this.state;

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
											icon={faPencil}
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
											icon={faCalendarDay}
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
							<h1>Food Item UPC Search</h1>
						</div>
					</div>
					<div className={bs.row}>
						<div className={combine(bs.col12, bs.formGroup)}>
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
						<div className={combine(bs.col12, bs.formGroup)}>
							<IconBtn
									icon={upcSearchBusy ? faCircleNotch : faSearch}
									text={"Search"}
									onClick={this.handleSearch}
									btnProps={{
										className: bs.btnOutlinePrimary,
										disabled: upcSearchBusy || !upcEntered,
										style: {
											width: "100%",
										},
									}}
									iconProps={{
										spin: upcSearchBusy,
									}}
							/>
						</div>
					</div>
					{this.renderSearchResults()}
				</ContentWrapper>
		);
	}

	private renderSearchResults(): ReactNode {
		const { searchedFoodItemsByUpc, upcSearchBusy } = this.props;
		const { upcSearched } = this.state;

		const searchResults = searchedFoodItemsByUpc[upcSearched];

		if (upcSearchBusy) {
			return <LoadingSpinner centre={true}/>;
		} else if (!searchResults || !searchResults.length) {
			return (
					<div className={bs.row}>
						<div className={bs.col}>
							<p><em className={bs.textMuted}>No search results.</em></p>
						</div>
					</div>
			);
		} else {
			return searchResults.map((fi, idx) => {
				const infoChunks: ReactNode[] = [];

				infoChunks.push((
						<span key={`info-chunk-calories`}>
							{formatLargeNumber(fi.caloriesPer100)} kcal
						</span>
				));

				infoChunks.push((
						<span key={`info-chunk-fat`}>
							{formatMeasurement(fi.fatPer100, "g")} fat
						</span>
				));

				infoChunks.push((
						<span key={`info-chunk-carbohydrates`}>
							{formatMeasurement(fi.carbohydratePer100, "g")} carbs
						</span>
				));

				infoChunks.push((
						<span key={`info-chunk-protein`}>
							{formatMeasurement(fi.proteinPer100, "g")} protein
						</span>
				));

				for (let i = 1; i < infoChunks.length; i += 2) {
					infoChunks.splice(i, 0, (
							<span key={`spacer-${i}`} className={bs.mx1}>
								&bull;
							</span>
					));
				}

				let btn: ReactNode;
				if (fi.id) {
					// item came from our database
					btn = (
							<Link to={`/diary-entries/edit?initFood=${fi.id}`}>
								<IconBtn
										icon={faCalendarDay}
										text={"Add to Diary"}
										btnProps={{
											className: combine(bs.btnOutlineDark, gs.btnMini),
										}}
								/>
							</Link>
					);
				} else {
					// item came from remote API
					btn = (
							<IconBtn
									icon={faPlus}
									text={"Add"}
									payload={fi}
									onClick={this.createFoodItem}
									btnProps={{
										className: combine(bs.btnOutlineDark, gs.btnMini),
									}}
							/>
					);
				}

				return (
						<div className={bs.row} key={idx}>
							<div className={combine(bs.col, bs.dFlex)}>
								<p className={combine(bs.flexGrow1, bs.mb1)}>
									{fi.name} {fi.id && " (already added)"}
									<br/>
									<span className={combine(bs.textMuted, bs.small)}>
										{fi.brand}
									</span>
									<br/>
									<span className={combine(bs.textMuted, bs.small)}>
										Per {formatMeasurement(100, fi.measurementUnit)}: {infoChunks}
									</span>
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

	private handleSearch(): void {
		const upcEntered = this.state.upcEntered;

		this.setState({ upcSearched: upcEntered });
		this.props.actions.searchFoodItemByUpc(upcEntered);
	}

	private createFoodItem(foodItem: IFoodItem): void {
		this.props.actions.startSaveFoodItem(foodItem);
	}
}

export const UpcFoodItemSearchPage = connect(mapStateToProps, mapDispatchToProps)(UCUpcFoodItemSearchPage);
