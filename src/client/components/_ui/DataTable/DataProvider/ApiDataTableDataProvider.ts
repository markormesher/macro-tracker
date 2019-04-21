import axios, { AxiosResponse } from "axios";
import { stringify } from "qs";
import { IDataTableResponse } from "../../../../../commons/models/IDataTableResponse";
import { IColumnSortEntry } from "../DataTable";
import { IDataTableDataProvider } from "./IDataTableDataProvider";

interface IApiParams {
	readonly [key: string]: any;
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
	private readonly apiResponseMapper: (entity: any) => Model;

	constructor(
			api: string,
			apiParamProvider?: () => IApiParams,
			apiResponseMapper?: (entity: any) => Model,
	) {
		this.api = api;
		this.apiParamProvider = apiParamProvider;
		this.apiResponseMapper = apiResponseMapper;
	}

	public getData(
			start: number,
			length: number,
			searchTerm?: string,
			sortedColumns?: IColumnSortEntry[],
	): Promise<IDataTableResponse<Model>> {
		const apiParams = this.apiParamProvider ? this.apiParamProvider() : {};
		return axios
				.get(this.api, {
					paramsSerializer: (params) => stringify(params, { arrayFormat: "indices" }),
					params: {
						...apiParams,
						start,
						length,
						searchTerm: searchTerm || "",
						order: ApiDataTableDataProvider.formatOrdering(sortedColumns),
					},
				})
				.then((res: AxiosResponse<IDataTableResponse<Model>>) => {
					if (this.apiResponseMapper) {
						return {
							...res.data,
							data: res.data.data.map(this.apiResponseMapper),
						};
					} else {
						return res.data;
					}
				});
	}
}

export {
	ApiDataTableDataProvider,
};
