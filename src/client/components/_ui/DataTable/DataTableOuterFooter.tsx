import * as React from "react";
import { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { IColumnSortEntry } from "./DataTable";
import * as styles from "./DataTable.scss";

interface IDataTableOuterFooterProps {
	readonly pageSize: number;
	readonly currentPage: number;
	readonly filteredRowCount: number;
	readonly totalRowCount: number;
	readonly sortedColumns?: IColumnSortEntry[];
}

const sortDirectionFull = {
	ASC: "ascending",
	DESC: "descending",
};

class DataTableOuterFooter extends PureComponent<IDataTableOuterFooterProps> {

	public render(): ReactNode {
		const { pageSize, currentPage, sortedColumns, filteredRowCount, totalRowCount } = this.props;

		const rowRangeFrom = Math.min(filteredRowCount, (currentPage * pageSize) + 1);
		const rowRangeTo = Math.min(filteredRowCount, (currentPage + 1) * pageSize);
		const showTotal = filteredRowCount !== totalRowCount;

		let sortingOrder = "Sorted by";
		if (sortedColumns) {
			sortedColumns.forEach((entry, i) => {
				if (i === 0) {
					sortingOrder += " ";
				} else {
					sortingOrder += ", then ";
				}
				sortingOrder += entry.column.lowercaseTitle || entry.column.title.toLocaleLowerCase();
				sortingOrder += " " + sortDirectionFull[entry.dir];
			});
		}

		return (
				<div className={styles.tableFooter}>
					<p className={bs.floatRight}>
						Showing rows {rowRangeFrom} to {rowRangeTo} of {filteredRowCount}
						{showTotal && <> (filtered from {totalRowCount} total)</>}
						{sortedColumns && sortedColumns.length > 0 && <> &bull; {sortingOrder}</>}
					</p>
				</div>
		);
	}
}

export {
	DataTableOuterFooter,
};
