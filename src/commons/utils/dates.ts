import * as Moment from "moment";

function momentToString(date: Moment.Moment): string {
	if (!date) {
		return null;
	}

	return date.toISOString();
}

function momentToDateKey(date: Moment.Moment): string {
	if (!date) {
		return null;
	}

	return date.format("YYYY-MM-DD");
}

function stringToMoment(date: string): Moment.Moment {
	if (!date) {
		return null;
	}

	return Moment(date);
}

export {
	momentToString,
	momentToDateKey,
	stringToMoment,
};
