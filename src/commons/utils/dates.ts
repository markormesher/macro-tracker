import * as Moment from "moment";

function utcMoment(inp?: Moment.MomentInput): Moment.Moment {
	return Moment(inp).utcOffset(0, true);
}

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

	return utcMoment(date);
}

export {
	utcMoment,
	momentToUrlString,
	momentToDateKey,
	urlStringToMoment,
};
