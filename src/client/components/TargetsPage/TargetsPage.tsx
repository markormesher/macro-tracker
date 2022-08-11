import React, { PureComponent, ReactElement, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { CacheKeyUtil } from "@dragonlabs/redux-cache-key-util";
import { ITarget, mapTargetFromJson, TargetMode } from "../../../models/ITarget";
import { formatDate, formatLargeNumber, formatMeasurement, formatPercent } from "../../../utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { PayloadAction } from "../../redux/helpers/PayloadAction";
import { IRootState } from "../../redux/root";
import { startDeleteTarget, targetsCacheKeys } from "../../redux/targets";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { ApiDataTableDataProvider } from "../_ui/DataTable/DataProvider/ApiDataTableDataProvider";
import { DataTable, IColumn } from "../_ui/DataTable/DataTable";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";

interface ITargetsPageProps {
  readonly updateTime?: number;
  readonly actions?: {
    readonly deleteTarget: (target: ITarget) => PayloadAction;
  };
}

function mapStateToProps(state: IRootState, props: ITargetsPageProps): ITargetsPageProps {
  return {
    ...props,
    updateTime: CacheKeyUtil.getKeyTime(targetsCacheKeys.latestUpdate),
  };
}

function mapDispatchToProps(dispatch: Dispatch, props: ITargetsPageProps): ITargetsPageProps {
  return {
    ...props,
    actions: {
      deleteTarget: (target): PayloadAction => dispatch(startDeleteTarget(target)),
    },
  };
}

class UCTargetsPage extends PureComponent<ITargetsPageProps> {
  private static startEditTarget(target: ITarget): void {
    history.push(`/targets/edit/${target.id}`);
  }

  private static formatSingleMacroTarget(mode: TargetMode, value: number): string {
    switch (mode) {
      case TargetMode.PERCENTAGE_OF_CALORIES:
        return formatPercent(value * 100) + " of kcals";

      case TargetMode.G_PER_KG_OF_BODY_WEIGHT:
        return formatMeasurement(value, "g", 1) + " per kg weight";

      case TargetMode.ABSOLUTE:
        return formatMeasurement(value, "g");

      case TargetMode.REMAINDER_OF_CALORIES:
        return "remaining kcals";
    }
  }

  private tableColumns: IColumn[] = [
    {
      title: "Start Date",
      sortField: "target.start_date",
      defaultSortDirection: "DESC",
    },
    {
      title: "Actions",
      sortable: false,
    },
  ];

  private dataProvider = new ApiDataTableDataProvider<ITarget>(
    "/api/targets/table",
    (): { updateTime: number } => ({ updateTime: this.props.updateTime }),
    mapTargetFromJson,
  );

  public constructor(props: ITargetsPageProps) {
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
              <Link to={"/targets/edit"}>
                <IconBtn
                  icon={"add"}
                  text={"Create Target"}
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
            <DataTable<ITarget>
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

  private tableRowRenderer(target: ITarget): ReactElement<void> {
    let calorieRequirement: ReactNode;
    if (target.calorieAdjustment === 1) {
      calorieRequirement = `${formatLargeNumber(target.maintenanceCalories)} kcal`;
    } else {
      const symbol = target.calorieAdjustment < 1 ? "-" : "+";
      const percentAdjustment = Math.abs(target.calorieAdjustment - 1) * 100;
      calorieRequirement =
        `${formatLargeNumber(target.maintenanceCalories)} kcal` +
        ` ${symbol} ${formatPercent(percentAdjustment)} =` +
        ` ${formatLargeNumber(target.maintenanceCalories * target.calorieAdjustment)} kcal`;
    }

    const infoChunks: ReactNode[] = [];

    infoChunks.push(
      <span key={`info-chunk-carbohydrates`}>
        Carbs: {UCTargetsPage.formatSingleMacroTarget(target.carbohydratesTargetMode, target.carbohydratesTargetValue)}
      </span>,
    );

    infoChunks.push(
      <span key={`info-chunk-fat`}>
        Fat: {UCTargetsPage.formatSingleMacroTarget(target.fatTargetMode, target.fatTargetValue)}
      </span>,
    );

    infoChunks.push(
      <span key={`info-chunk-protein`}>
        Protein: {UCTargetsPage.formatSingleMacroTarget(target.proteinTargetMode, target.proteinTargetValue)}
      </span>,
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

    return (
      <tr key={target.id}>
        <td>
          {formatDate(target.startDate)}
          <br />
          <span className={combine(bs.textMuted, bs.small)}>{calorieRequirement}</span>
          <br />
          <span className={combine(bs.textMuted, bs.small)}>{infoChunks}</span>
        </td>
        <td style={{ verticalAlign: "middle" }}>{this.generateActionButtons(target)}</td>
      </tr>
    );
  }

  private generateActionButtons(target: ITarget): ReactElement<void> {
    return (
      <div className={combine(bs.btnGroup, bs.btnGroupSm)}>
        <IconBtn
          icon={"edit"}
          text={"Edit"}
          payload={target}
          onClick={UCTargetsPage.startEditTarget}
          btnProps={{
            className: combine(bs.btnOutlineDark, gs.btnMini),
          }}
        />
        <DeleteBtn
          payload={target}
          onConfirmedClick={this.props.actions.deleteTarget}
          btnProps={{
            className: combine(bs.btnOutlineDark, gs.btnMini),
          }}
        />
      </div>
    );
  }
}

export const TargetsPage = connect(mapStateToProps, mapDispatchToProps)(UCTargetsPage);
