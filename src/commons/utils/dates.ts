import * as Moment from "moment";

function momentToDateKey(date: Moment.Moment): string {
	if (!date) {
		return null;
	}

	return date.format("YYYY-MM-DD");
}

function momentToUrlString(date: Moment.Moment): string {
	if (!date) {
		return null;
	}

	return date.format("YYYY-MM-DD");
}

function urlStringToMoment(date: string): Moment.Moment {
	if (!date) {
		return null;
	}

	return Moment(date).hour(12); // TODO: this is a hack; fix by making EVERYTHING UTC
}

export {
	momentToUrlString,
	momentToDateKey,
	urlStringToMoment,
};
