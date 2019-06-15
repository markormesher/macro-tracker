import { faPencil, faPlus } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactElement, ReactNode } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Dispatch } from "redux";
import { ITarget, mapTargetFromJson } from "../../../commons/models/ITarget";
import { formatDate, formatPercent } from "../../../commons/utils/formatters";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { history } from "../../helpers/single-history";
import { combine } from "../../helpers/style-helpers";
import { KeyCache } from "../../redux/helpers/KeyCache";
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
		updateTime: KeyCache.getKeyTime(targetsCacheKeys.latestUpdate),
	};
}

function mapDispatchToProps(dispatch: Dispatch, props: ITargetsPageProps): ITargetsPageProps {
	return {
		...props,
		actions: {
			deleteTarget: (target) => dispatch(startDeleteTarget(target)),
		},
	};
}

class UCTargetsPage extends PureComponent<ITargetsPageProps> {

	private static startEditTarget(target: ITarget): void {
		history.push(`/targets/edit/${target.id}`);
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
			() => ({ updateTime: this.props.updateTime }),
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
											icon={faPlus}
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
		const infoChunks: ReactNode[] = [];

		infoChunks.push((
				<span key={`info-chunk-carbohydrates`}>
					{formatPercent(target.proportionCarbohydrates * 100)} carbs
				</span>
		));

		infoChunks.push((
				<span key={`info-chunk-fat`}>
					{formatPercent(target.proportionFat * 100)} fat
				</span>
		));

		infoChunks.push((
				<span key={`info-chunk-protein`}>
					{formatPercent(target.proportionProtein * 100)} protein
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
				<tr key={target.id}>
					<td>
						{formatDate(target.startDate)}
						<br/>
						<span className={combine(bs.textMuted, bs.small)}>
							{infoChunks}
						</span>
					</td>
					<td style={{ verticalAlign: "middle" }}>
						{this.generateActionButtons(target)}
					</td>
				</tr>
		);
	}

	private generateActionButtons(target: ITarget): ReactElement<void> {
		return (
				<div className={combine(bs.btnGroup, bs.btnGroupSm)}>
					<IconBtn
							icon={faPencil}
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
