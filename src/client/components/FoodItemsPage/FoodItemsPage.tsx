import {
	faBarcodeAlt,
	faExclamationTriangle,
	faLink,
	faPencil,
	faPlug,
	faPlus,
} from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { PureComponent, ReactElement, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { IFoodItem, mapFoodItemFromJson } from "../../../commons/models/IFoodItem";
import { servingSizeComparator } from "../../../commons/models/IServingSize";
import { getFoodItemDataWarnings } from "../../../commons/utils/helpers";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { formatMeasurement } from "../../helpers/formatters";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { foodItemsCacheKeys, startDeleteFoodItem } from "../../redux/food-items";
import { KeyCache } from "../../redux/helpers/KeyCache";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ApiDataTableDataProvider } from "../_ui/DataTable/DataProvider/ApiDataTableDataProvider";
import { DataTable, IColumn } from "../_ui/DataTable/DataTable";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";

interface IFoodItemsPageProps {
	readonly updateTime?: number;
	readonly actions?: {
		readonly deleteFoodItem: (foodItem: IFoodItem) => PayloadAction;
	};
}

function mapStateToProps(state: IRootState, props: IFoodItemsPageProps): IFoodItemsPageProps {
	return {
		...props,
		updateTime: KeyCache.getKeyTime(foodItemsCacheKeys.latestUpdate),
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
			() => ({ updateTime: this.props.updateTime }),
			mapFoodItemFromJson,
	);

	public constructor(props: IFoodItemsPageProps) {
		super(props);

		this.tableRowRenderer = this.tableRowRenderer.bind(this);
		this.generateActionButtons = this.generateActionButtons.bind(this);
	}

	public render(): ReactNode {
		const { updateTime } = this.props;

		return (
				<ContentWrapper>
					<div className={bs.row}>
						<div className={bs.col}>
							<p>
								<Link to={"/food-items/entry-chooser"}>
									<IconBtn
											icon={faPlus}
											text={"Create Food Item"}
											btnProps={{
												className: bs.btnOutlineSuccess,
												style: {
													width: "100%",
												},
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
									watchedProps={{ updateTime }}
									rowRenderer={this.tableRowRenderer}
							/>
						</div>
					</div>
				</ContentWrapper>
		);
	}

	private tableRowRenderer(foodItem: IFoodItem): ReactElement<void> {
		const infoChunks: ReactNode[] = [];

		infoChunks.push((
				<span key={`info-chunk-brand`}>
					{foodItem.brand}
				</span>
		));

		if (foodItem.measurementUnit !== "single_serving") {
			const sizes = (foodItem.servingSizes || [])
					.filter((ss) => !ss.deleted)
					.sort(servingSizeComparator)
					.map((ss) => `${ss.label} (${formatMeasurement(ss.measurement, foodItem.measurementUnit)})`);
			if (sizes.length > 0) {
				infoChunks.push((
						<span key={`info-chunk-sizes`}>
							{sizes.join(", ")}
						</span>
				));
			}
		}

		if (foodItem.upc) {
			infoChunks.push((
					<span key={`info-chunk-upc`}>
						<FontAwesomeIcon
								icon={faBarcodeAlt}
						/>
					</span>
			));
		}

		if (foodItem.apiSource === "tesco") {
			infoChunks.push((
					<span key={`info-chunk-api`}>
						<FontAwesomeIcon
								icon={faLink}
								className={bs.mr1}
						/>
						Tesco
					</span>
			));
		} else if (foodItem.apiSource === "nutritionix") {
			infoChunks.push((
					<span key={`info-chunk-api`}>
						<FontAwesomeIcon
								icon={faPlug}
								className={bs.mr1}
						/>
						Nutritionix
					</span>
			));
		}

		const warnings = getFoodItemDataWarnings(foodItem);
		if (warnings.length > 0) {
			infoChunks.push((
					<span key={`info-chunk-warning`} className={bs.textDanger}>
						<FontAwesomeIcon
								icon={faExclamationTriangle}
								className={bs.mr1}
						/>
						{warnings.length} warning{warnings.length > 1 ? "s" : ""}
					</span>
			));
		}

		for (let i = 1; i < infoChunks.length; i += 2) {
			infoChunks.splice(i, 0, (
					<span key={`spacer-${i}`} className={bs.mx1}>
					&bull;
				</span>
			));
		}

		return (
				<tr key={foodItem.id}>
					<td>
						{foodItem.name}
						<br/>
						<span className={combine(bs.textMuted, bs.small)}>
							{infoChunks}
						</span>
					</td>
					<td style={{ verticalAlign: "middle" }}>
						{this.generateActionButtons(foodItem)}
					</td>
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
