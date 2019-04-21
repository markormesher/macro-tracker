function groupBy<T>(data: T[], identifier: (entity: T) => string | number):
		{ readonly [key: string]: T[] } | { readonly [key: number]: T[] } {
	const empty: { [key: string]: T[] } = {};
	return data.reduce((returnVal, entity) => {
		const key = identifier(entity);
		(returnVal[identifier(entity)] = returnVal[key] || []).push(entity);
		return returnVal;
	}, empty);
}

export {
	groupBy,
};
