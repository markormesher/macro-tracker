import { addHours, format } from "date-fns";

function removeTimezoneOffset(date: Date): Date {
	// a bit of hackery to fiddle with the TIME to make sure the DATE stays the same, regardless of local timezone
	const tzOffset = date.getTimezoneOffset() / 60;
	return addHours(date, tzOffset);
}

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

	return removeTimezoneOffset(new Date(date));
}

export {
	removeTimezoneOffset,
	dateToDateKey,
	dateToUrlString,
	urlStringToDate,
};
