import { faCircleNotch, faPlus, faSearch } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IFoodItem } from "../../../commons/models/IFoodItem";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { formatLargeNumber, formatMeasurement } from "../../helpers/formatters";
import { combine } from "../../helpers/style-helpers";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { startSearchFoodItemByUpc } from "../../redux/nutritionix";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { LoadingSpinner } from "../_ui/LoadingSpinner/LoadingSpinner";

interface IUpcFoodItemSearchPageProps {
	readonly upcSearchBusy?: boolean;
	readonly searchedFoodItemsByUpc?: { readonly [key: string]: IFoodItem[] };
	readonly actions?: {
		readonly searchFoodItemByUpc: (upc: string) => PayloadAction;
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
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IUpcFoodItemSearchPageProps): IUpcFoodItemSearchPageProps {
	return {
		...props,
		actions: {
			searchFoodItemByUpc: (upc: string) => dispatch(startSearchFoodItemByUpc(upc)),
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

	public render(): ReactNode {
		const { upcSearchBusy } = this.props;
		const { upcEntered } = this.state;

		return (
				<ContentWrapper>
					<div className={bs.row}>
						<div className={bs.col}>
							<h1>Food Item UPC Search</h1>
						</div>
					</div>
					<div className={bs.row}>
						<div className={combine(bs.col12, bs.formGroup)}>
							<ControlledTextInput
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

				return (
						<div className={bs.row} key={idx}>
							<div className={combine(bs.col, bs.dFlex)}>
								<p className={combine(bs.flexGrow1, bs.mb1)}>
									{fi.name}
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
									<IconBtn
											icon={faPlus}
											text={"Add"}
											payload={fi}
											onClick={this.createFoodItem}
											btnProps={{
												className: combine(bs.btnOutlineDark, gs.btnMini),
											}}
									/>
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
		console.log("Creating item...");
		console.log(foodItem);
	}
}

export const UpcFoodItemSearchPage = connect(mapStateToProps, mapDispatchToProps)(UCUpcFoodItemSearchPage);
