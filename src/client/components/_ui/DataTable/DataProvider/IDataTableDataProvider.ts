import { IDataTableResponse } from "../../../../../models/IDataTableResponse";
import { IColumnSortEntry } from "../DataTable";

interface IDataTableDataProvider<Model> {
  readonly getData: (
    start: number,
    length: number,
    searchTerm?: string,
    sortedColumns?: IColumnSortEntry[],
  ) => Promise<IDataTableResponse<Model>>;
}

export { IDataTableDataProvider };
