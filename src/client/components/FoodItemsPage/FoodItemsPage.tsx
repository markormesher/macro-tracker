import React, { PureComponent, ReactElement, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { CacheKeyUtil } from "@dragonlabs/redux-cache-key-util";
import { IFoodItem, mapFoodItemFromJson } from "../../../models/IFoodItem";
import { servingSizeComparator } from "../../../models/IServingSize";
import { formatMeasurement } from "../../../utils/formatters";
import { getFoodItemDataWarnings } from "../../../utils/helpers";
import * as bs from "../../global-styles/Bootstrap.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { foodItemsCacheKeys, startDeleteFoodItem } from "../../redux/food-items";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ApiDataTableDataProvider } from "../_ui/DataTable/DataProvider/ApiDataTableDataProvider";
import { DataTable, IColumn } from "../_ui/DataTable/DataTable";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { MaterialIcon } from "../_ui/MaterialIcon/MaterialIcon";

interface IFoodItemsPageProps {
  readonly updateTime?: number;
  readonly actions?: {
    readonly deleteFoodItem: (foodItem: IFoodItem) => PayloadAction;
  };
}

function mapStateToProps(state: IRootState, props: IFoodItemsPageProps): IFoodItemsPageProps {
  return {
    ...props,
    updateTime: CacheKeyUtil.getKeyTime(foodItemsCacheKeys.latestUpdate),
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: IFoodItemsPageProps): IFoodItemsPageProps {
  return {
    ...props,
    actions: {
      deleteFoodItem: (foodItem: IFoodItem): PayloadAction => dispatch(startDeleteFoodItem(foodItem)),
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
    (): { updateTime: number } => ({ updateTime: this.props.updateTime }),
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
                  icon={"add"}
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

    infoChunks.push(<span key={`info-chunk-brand`}>{foodItem.brand}</span>);

    if (foodItem.measurementUnit !== "single_serving") {
      const sizes = (foodItem.servingSizes || [])
        .filter((ss) => !ss.deleted)
        .sort(servingSizeComparator)
        .map((ss) => `${ss.label} (${formatMeasurement(ss.measurement, foodItem.measurementUnit)})`);
      if (sizes.length > 0) {
        infoChunks.push(<span key={`info-chunk-sizes`}>{sizes.join(", ")}</span>);
      }
    }

    if ((foodItem.upcs || []).length > 0) {
      infoChunks.push(
        <span key={`info-chunk-upc`}>
          <MaterialIcon icon={"barcode"} />
        </span>,
      );
    }

    if (foodItem.apiSource === "tesco") {
      infoChunks.push(
        <span key={`info-chunk-api`}>
          <MaterialIcon icon={"link"} className={bs.me1} />
          Tesco
        </span>,
      );
    } else if (foodItem.apiSource === "nutritionix") {
      infoChunks.push(
        <span key={`info-chunk-api`}>
          <MaterialIcon icon={"link"} className={bs.me1} />
          Nutritionix
        </span>,
      );
    }

    const warnings = getFoodItemDataWarnings(foodItem);
    if (warnings.length > 0) {
      infoChunks.push(
        <span key={`info-chunk-warning`} className={bs.textDanger}>
          <MaterialIcon icon={"warning"} className={bs.me1} />
          {warnings.length} warning{warnings.length > 1 ? "s" : ""}
        </span>,
      );
    }

    for (let i = 1; i < infoChunks.length; i += 2) {
      infoChunks.splice(
        i,
        0,
        <span key={`spacer-${i}`} className={bs.mx1}>
          &bull;
        </span>,
      );
    }

    return (
      <tr key={foodItem.id}>
        <td>
          {foodItem.name}
          <br />
          <span className={combine(bs.textMuted, bs.small)}>{infoChunks}</span>
        </td>
        <td style={{ verticalAlign: "middle" }}>{this.generateActionButtons(foodItem)}</td>
      </tr>
    );
  }

  private generateActionButtons(foodItem: IFoodItem): ReactElement<void> {
    return (
      <div className={combine(bs.btnGroup, bs.btnGroupSm)}>
        <IconBtn
          icon={"edit"}
          text={"Edit"}
          payload={foodItem}
          onClick={UCFoodItemsPage.startEditFoodItem}
          btnProps={{
            className: bs.btnOutlineDark,
          }}
        />
        <DeleteBtn
          payload={foodItem}
          onConfirmedClick={this.props.actions.deleteFoodItem}
          btnProps={{
            className: bs.btnOutlineDark,
          }}
        />
      </div>
    );
  }
}

export const FoodItemsPage = connect(mapStateToProps, mapDispatchToProps)(UCFoodItemsPage);
