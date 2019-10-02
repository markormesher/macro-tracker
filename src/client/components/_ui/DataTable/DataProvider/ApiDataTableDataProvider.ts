import axios, { AxiosResponse } from "axios";
import { stringify } from "qs";
import { IDataTableResponse } from "../../../../../commons/models/IDataTableResponse";
import { IColumnSortEntry } from "../DataTable";
import { IDataTableDataProvider } from "./IDataTableDataProvider";

interface IApiParams {
  readonly [key: string]: string | number | boolean;
}

class ApiDataTableDataProvider<Model> implements IDataTableDataProvider<Model> {
  private static formatOrdering(sortedColumns: IColumnSortEntry[]): string[][] {
    if (!sortedColumns) {
      return [];
    }
    return sortedColumns.map((sortEntry) => [sortEntry.column.sortField, sortEntry.dir]);
  }

  private readonly api: string;
  private readonly apiParamProvider: () => IApiParams;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly apiResponseMapper: (entity: any) => Model;

  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(api: string, apiParamProvider?: () => IApiParams, apiResponseMapper?: (entity: any) => Model) {
    this.api = api;
    this.apiParamProvider = apiParamProvider;
    this.apiResponseMapper = apiResponseMapper;
  }

  public async getData(
    start: number,
    length: number,
    searchTerm?: string,
    sortedColumns?: IColumnSortEntry[],
  ): Promise<IDataTableResponse<Model>> {
    const apiParams = this.apiParamProvider ? this.apiParamProvider() : {};
    const apiRes: AxiosResponse<IDataTableResponse<Model>> = await axios.get(this.api, {
      paramsSerializer: (params) => stringify(params, { arrayFormat: "indices" }),
      params: {
        ...apiParams,
        start,
        length,
        searchTerm: searchTerm || "",
        order: ApiDataTableDataProvider.formatOrdering(sortedColumns),
      },
    });
    if (this.apiResponseMapper) {
      return {
        ...apiRes.data,
        data: apiRes.data.data.map(this.apiResponseMapper),
      };
    } else {
      return apiRes.data;
    }
  }
}

export { ApiDataTableDataProvider };
