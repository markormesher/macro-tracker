interface IDataTableResponse<T> {
	readonly filteredRowCount: number;
	readonly totalRowCount: number;
	readonly data: T[];
}

export {
	IDataTableResponse,
};
