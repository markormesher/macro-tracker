import { faSearch, faTimes } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { MouseEvent, PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { foodItemComparator, IFoodItem } from "../../../commons/models/IFoodItem";
import * as bs from "../../global-styles/Bootstrap.scss";
import { levenshteinDistance } from "../../helpers/levenshtein-distance";
import { renderFoodItemSummary } from "../../helpers/renderers";
import { combine } from "../../helpers/style-helpers";
import { startLoadAllFoodItems } from "../../redux/food-items";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { BarcodeScannerBtn } from "../_ui/BarcodeScannerBtn/BarcodeScannerBtn";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ControlledTextInput } from "../_ui/ControlledInputs/ControlledTextInput";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import * as style from "./FoodItemPicker.scss";

interface IFoodItemPickerProps {
	// from props
	readonly value?: IFoodItem;
	readonly preSelectedId?: string;
	readonly onValueChange?: (foodItem?: IFoodItem) => void;
	readonly disabled?: boolean;
	readonly resetSearchOnSelect?: boolean;

	// from redux
	readonly allFoodItems?: IFoodItem[];
	readonly actions?: {
		readonly startLoadAllFoodItems: () => PayloadAction;
	};
}

interface IFoodItemPickerState {
	readonly searchOpen: boolean;
	readonly searchTerm: string;
	readonly searchSuggestions: IFoodItem[];
}

function mapStateToProps(state: IRootState, props: IFoodItemPickerProps): IFoodItemPickerProps {
	return {
		...props,
		allFoodItems: state.foodItems.allFoodItems,
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IFoodItemPickerProps): IFoodItemPickerProps {
	return {
		...props,
		actions: {
			startLoadAllFoodItems: () => dispatch(startLoadAllFoodItems()),
		},
	};
}

class UCFoodItemPicker extends PureComponent<IFoodItemPickerProps, IFoodItemPickerState> {

	private static MAX_SEARCH_RESULTS = 15;

	private static removeRegexChars(str: string): string {
		return str.replace(/[\^$\\+*?.(){}\[\]]/g, "");
	}

	private static highlightFoodName(name: string, searchTerm: string): ReactNode {
		const output: ReactNode[] = [];
		const nameChars = name.split("");
		let consumedInputIndex = 0;
		for (const c of nameChars) {
			if (c.length && c.toLowerCase() === searchTerm.charAt(consumedInputIndex).toLowerCase()) {
				output.push(<span className={style.highlight} key={`${consumedInputIndex}-${c}`}>{c}</span>);
				++consumedInputIndex;
			} else {
				output.push(c);
			}
		}
		return <>{output}</>;
	}

	constructor(props: IFoodItemPickerProps, context: any) {
		super(props, context);

		this.state = {
			searchOpen: false,
			searchTerm: "",
			searchSuggestions: [],
		};

		this.renderSelectedFood = this.renderSelectedFood.bind(this);
		this.renderFullPageChooser = this.renderFullPageChooser.bind(this);
		this.reGenerateSearchSuggestions = this.reGenerateSearchSuggestions.bind(this);
		this.openSearch = this.openSearch.bind(this);
		this.closeSearch = this.closeSearch.bind(this);
		this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
		this.handleScan = this.handleScan.bind(this);
		this.handleSearchResultClick = this.handleSearchResultClick.bind(this);
		this.handleIdSelected = this.handleIdSelected.bind(this);
	}

	public componentDidMount(): void {
		this.props.actions.startLoadAllFoodItems();
	}

	public componentDidUpdate(
			prevProps: Readonly<IFoodItemPickerProps>,
			prevState: Readonly<IFoodItemPickerState>,
			snapshot?: any,
	): void {
		const props = this.props;
		const state = this.state;

		const didLoadFood = props.allFoodItems !== prevProps.allFoodItems;
		const didChangeSearchTerm = state.searchTerm !== prevState.searchTerm;

		if (didLoadFood) {
			if (props.preSelectedId) {
				this.handleIdSelected(props.preSelectedId);
			}
		}

		if (didLoadFood || didChangeSearchTerm) {
			this.reGenerateSearchSuggestions();
		}
	}

	public render(): ReactNode {
		const { disabled } = this.props;

		return (
				<>
					{this.renderFullPageChooser()}

					{this.renderSelectedFood()}

					<div className={bs.row}>
						<div className={bs.col6}>
							<BarcodeScannerBtn
									onScan={this.handleScan}
									btnProps={{
										style: {
											width: "100%",
										},
										className: combine(bs.btnOutlineDark),
										disabled,
									}}
							/>
						</div>
						<div className={bs.col6}>
							<IconBtn
									icon={faSearch}
									text={"Search Food"}
									onClick={this.openSearch}
									btnProps={{
										style: {
											width: "100%",
										},
										className: combine(bs.btnOutlineDark),
										disabled,
									}}
							/>
						</div>
					</div>
				</>
		);
	}

	private renderFullPageChooser(): ReactNode {
		const { searchOpen, searchTerm, searchSuggestions } = this.state;

		if (!searchOpen) {
			return null;
		}

		const suggestions = searchSuggestions.slice(0, UCFoodItemPicker.MAX_SEARCH_RESULTS);

		let foodItemList: ReactNode;
		if (suggestions.length === 0) {
			foodItemList = <p className={combine(bs.textMuted, bs.textCenter)}>No results.</p>;
		} else {
			foodItemList = suggestions.map((suggestion) => (
					<div
							className={bs.row}
							key={suggestion.id}
							data-id={suggestion.id}
							style={{ cursor: "pointer" }}
							onClick={this.handleSearchResultClick}
					>
						<div className={bs.col}>
							{renderFoodItemSummary(
									suggestion,
									null,
									(name) => UCFoodItemPicker.highlightFoodName(name, searchTerm),
							)}
						</div>
					</div>
			));
		}

		return (
				<div className={style.search}>
					<div className={combine(style.inputWrapper, bs.dFlex)}>
						<div className={bs.flexGrow1}>
							<ControlledTextInput
									id={"search"}
									placeholder={"Search"}
									label={null}
									value={searchTerm}
									onValueChange={this.handleSearchTermChange}
									disabled={false}
									inputProps={{
										autoFocus: true,
									}}
							/>
						</div>
						<div className={bs.flexGrow0}>
							<IconBtn
									icon={faTimes}
									text={"Cancel"}
									onClick={this.closeSearch}
									btnProps={{
										className: combine(bs.btnOutlineDark, bs.ml1),
									}}
							/>
						</div>
					</div>
					<div className={style.candidatesWrapper}>
						<ContentWrapper>
							{foodItemList}
						</ContentWrapper>
					</div>
				</div>
		);
	}

	private renderSelectedFood(): ReactNode {
		const { value } = this.props;
		if (!value) {
			return null;
		} else {
			return renderFoodItemSummary(value, bs.mb3);
		}
	}

	private reGenerateSearchSuggestions(): void {
		const { searchTerm } = this.state;
		const { allFoodItems } = this.props;

		let searchSuggestions: IFoodItem[];

		if (!searchTerm || searchTerm.trim() === "") {
			searchSuggestions = allFoodItems.sort(foodItemComparator);
		} else {
			const regex = new RegExp(".*" + UCFoodItemPicker.removeRegexChars(searchTerm).split("").join(".*") + ".*", "i");
			const scores: { [key: string]: number } = {};
			searchSuggestions = allFoodItems
					.filter((fi) => regex.test(fi.name))
					.sort((a, b) => {
						scores[a.name] = scores[a.name] || levenshteinDistance(searchTerm, a.name);
						scores[b.name] = scores[b.name] || levenshteinDistance(searchTerm, b.name);
						return scores[a.name] - scores[b.name];
					});
		}

		this.setState({ searchSuggestions });
	}

	private openSearch(): void {
		this.setState({ searchOpen: true });
	}

	private closeSearch(): void {
		this.setState({ searchOpen: false });
	}

	private handleSearchTermChange(searchTerm: string): void {
		this.setState({ searchTerm });
	}

	private handleScan(value: string): void {
		const { allFoodItems, onValueChange } = this.props;
		const foodItem = (allFoodItems || []).find((fi) => fi.upc === value) || undefined;
		if (onValueChange) {
			onValueChange(foodItem);
		}
	}

	private handleSearchResultClick(event: MouseEvent<HTMLDivElement>): void {
		const id = event.currentTarget.attributes.getNamedItem("data-id").value;

		if (this.props.resetSearchOnSelect) {
			this.handleSearchTermChange("");
		}

		this.handleIdSelected(id);
		this.closeSearch();
	}

	private handleIdSelected(foodItemId: string): void {
		const { allFoodItems, onValueChange } = this.props;
		const foodItem = (allFoodItems || []).find((fi) => fi.id === foodItemId) || undefined;
		if (onValueChange) {
			onValueChange(foodItem);
		}
	}
}

export const FoodItemPicker = connect(mapStateToProps, mapDispatchToProps)(UCFoodItemPicker);
