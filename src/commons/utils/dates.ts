import { addHours, format } from "date-fns";

function dateToDateKey(date: Date): string {
	if (!date) {
		return null;
	}

	return format(date, "YYYY-MM-DD");
}

function dateToUrlString(date: Date): string {
	if (!date) {
		return null;
	}

	return format(date, "YYYY-MM-DD");
}

function urlStringToDate(date: string): Date {
	if (!date) {
		return null;
	}

	// a bit of hackery to make sure the DATE stays the same regardless of local timezone
	const localDate = new Date(date + "T00:00:00Z");
	const tzOffset = localDate.getTimezoneOffset() / 60;
	return addHours(localDate, tzOffset);
}

export {
	dateToDateKey,
	dateToUrlString,
	urlStringToDate,
};
