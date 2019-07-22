import * as Dayjs from "dayjs";

function utcDayjs(inp?: Dayjs.Dayjs | string | number): Dayjs.Dayjs {
	// TODO: return local time as that time in UTC
	return Dayjs(inp);
}

function dayjsToDateKey(date: Dayjs.Dayjs): string {
	if (!date) {
		return null;
	}

	return date.format("YYYY-MM-DD");
}

function dayjsToUrlString(date: Dayjs.Dayjs): string {
	if (!date) {
		return null;
	}

	return date.format("YYYY-MM-DD");
}

function urlStringToDayjs(date: string): Dayjs.Dayjs {
	if (!date) {
		return null;
	}

	return Dayjs(date);
}

export {
	utcDayjs,
	dayjsToUrlString,
	dayjsToDateKey,
	urlStringToDayjs,
};
