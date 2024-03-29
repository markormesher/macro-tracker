import React, { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";
import { MaterialIcon } from "../MaterialIcon/MaterialIcon";
import { IColumn, IColumnSortEntry, SortDirection } from "./DataTable";
import * as styles from "./DataTable.scss";

interface IDataTableInnerHeaderProps {
  readonly columns: IColumn[];
  readonly sortedColumns?: IColumnSortEntry[];
  readonly onSortOrderUpdate?: (sortedColumns: IColumnSortEntry[]) => void;
}

class DataTableInnerHeader extends PureComponent<IDataTableInnerHeaderProps> {
  private static getNextSortDirection(dir: SortDirection): SortDirection {
    switch (dir) {
      case "ASC":
        return "DESC";

      case "DESC":
        return undefined;

      default:
        return "ASC";
    }
  }

  constructor(props: IDataTableInnerHeaderProps) {
    super(props);

    this.generateDefaultSortedColumns = this.generateDefaultSortedColumns.bind(this);
    this.toggleColumnSortOrder = this.toggleColumnSortOrder.bind(this);

    if (this.props.sortedColumns === undefined) {
      if (this.props.onSortOrderUpdate) {
        this.props.onSortOrderUpdate(this.generateDefaultSortedColumns());
      }
    }
  }

  public render(): ReactNode {
    const { columns } = this.props;
    const sortedColumns = this.props.sortedColumns || [];
    const headers = columns.map((col) => {
      const sortable = col.sortable !== false; // undefined implicitly means yes
      const sortEntry: IColumnSortEntry = sortedColumns.find((sc) => sc.column.title === col.title);
      const sorted = sortEntry !== undefined;

      const sortIcon = sorted ? (sortEntry.dir === "ASC" ? "arrow_downward" : "arrow_upward") : "swap_vert";
      const sortIconClasses = combine(bs.me1, !sorted && styles.sortInactive);

      const clickHandler = sortable ? (): void => this.toggleColumnSortOrder(col) : undefined;
      const className = sortable ? styles.sortable : undefined;

      return (
        <th key={col.title} className={className} onClick={clickHandler}>
          {sortable && <MaterialIcon icon={sortIcon} className={sortIconClasses} />}
          {col.title}
        </th>
      );
    });

    return (
      <thead>
        <tr>{headers}</tr>
      </thead>
    );
  }

  private generateDefaultSortedColumns(): IColumnSortEntry[] {
    return this.props.columns
      .filter((col) => col.defaultSortDirection !== undefined)
      .sort((a, b) => (a.defaultSortPriority || 0) - (b.defaultSortPriority || 0))
      .map((col) => ({ column: col, dir: col.defaultSortDirection }));
  }

  private toggleColumnSortOrder(column: IColumn): void {
    // note: always compare columns by key not equality
    const oldSortedColumns = this.props.sortedColumns || [];
    const sortedColumns = oldSortedColumns.slice(0); // work on a copy
    const currentSortEntryIndex = sortedColumns.findIndex((sc) => sc.column.title === column.title);

    if (currentSortEntryIndex < 0) {
      // add at the beginning
      sortedColumns.unshift({
        column,
        dir: DataTableInnerHeader.getNextSortDirection(undefined),
      });
    } else {
      const nextDir = DataTableInnerHeader.getNextSortDirection(sortedColumns[currentSortEntryIndex].dir);
      // remove...
      sortedColumns.splice(currentSortEntryIndex, 1);
      if (nextDir !== undefined) {
        // ...and re-add at the beginning
        sortedColumns.unshift({ column, dir: nextDir });
      }
    }

    if (this.props.onSortOrderUpdate) {
      this.props.onSortOrderUpdate(sortedColumns);
    }
  }
}

export { DataTableInnerHeader };
