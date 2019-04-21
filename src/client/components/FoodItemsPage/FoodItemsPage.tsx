import { faPencil, faPlus } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactElement, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { IFoodItem, mapFoodItemFromApi } from "../../../commons/models/IFoodItem";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { FoodItemsCacheKeys, startDeleteFoodItem } from "../../redux/food-items";
import { KeyCache } from "../../redux/helpers/KeyCache";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ApiDataTableDataProvider } from "../_ui/DataTable/DataProvider/ApiDataTableDataProvider";
import { DataTable, IColumn } from "../_ui/DataTable/DataTable";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";

interface IFoodItemsPageProps {
	readonly cacheTime?: number;
	readonly actions?: {
		readonly deleteFoodItem: (foodItem: IFoodItem) => PayloadAction;
	};
}

function mapStateToProps(state: IRootState, props: IFoodItemsPageProps): IFoodItemsPageProps {
	return {
		...props,
		cacheTime: KeyCache.getKeyTime(FoodItemsCacheKeys.LATEST_CACHE_TIME),
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: IFoodItemsPageProps): IFoodItemsPageProps {
	return {
		...props,
		actions: {
			deleteFoodItem: (foodItem: IFoodItem) => dispatch(startDeleteFoodItem(foodItem)),
		},
	};
}

class UCFoodItemsPage extends PureComponent<IFoodItemsPageProps> {

	private static startEditFoodItem(foodItem: IFoodItem): void {
		history.push(`/food-items/edit/${foodItem.id}`);
	}

	private tableColumns: IColumn[] = [
		{
			title: "Name",
			sortField: "food_item.name",
			defaultSortDirection: "ASC",
		},
		{
			title: "Actions",
			sortable: false,
		},
	];

	private dataProvider = new ApiDataTableDataProvider<IFoodItem>(
			"/api/food-items/table",
			() => ({ cacheTime: this.props.cacheTime }),
			mapFoodItemFromApi,
	);

	public constructor(props: IFoodItemsPageProps) {
		super(props);

		this.tableRowRenderer = this.tableRowRenderer.bind(this);
		this.generateActionButtons = this.generateActionButtons.bind(this);
	}

	public render(): ReactNode {
		const { cacheTime } = this.props;

		return (
				<ContentWrapper>
					<div className={bs.row}>
						<div className={bs.col}>
							<p>
								<Link to={"/food-items/edit"}>
									<IconBtn
											icon={faPlus}
											text={"Create Food Item"}
											btnProps={{
												className: bs.btnOutlineSuccess,
											}}
									/>
								</Link>
							</p>
						</div>
					</div>

					<div className={bs.row}>
						<div className={bs.col}>
							<DataTable<IFoodItem>
									dataProvider={this.dataProvider}
									columns={this.tableColumns}
									watchedProps={{ cacheTime }}
									rowRenderer={this.tableRowRenderer}
							/>
						</div>
					</div>
				</ContentWrapper>
		);
	}

	private tableRowRenderer(foodItem: IFoodItem): ReactElement<void> {
		return (
				<tr key={foodItem.id}>
					<td><span className={bs.textMuted}>{foodItem.brand}</span> {foodItem.name}</td>
					<td>{this.generateActionButtons(foodItem)}</td>
				</tr>
		);
	}

	private generateActionButtons(foodItem: IFoodItem): ReactElement<void> {
		return (
				<div className={combine(bs.btnGroup, bs.btnGroupSm)}>
					<IconBtn
							icon={faPencil}
							text={"Edit"}
							payload={foodItem}
							onClick={UCFoodItemsPage.startEditFoodItem}
							btnProps={{
								className: combine(bs.btnOutlineDark, gs.btnMini),
							}}
					/>
					<DeleteBtn
							payload={foodItem}
							onConfirmedClick={this.props.actions.deleteFoodItem}
							btnProps={{
								className: combine(bs.btnOutlineDark, gs.btnMini),
							}}
					/>
				</div>
		);
	}

}

export const FoodItemsPage = connect(mapStateToProps, mapDispatchToProps)(UCFoodItemsPage);
