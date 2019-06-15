import axios from "axios";
import * as Moment from "moment";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { IMacroSummary, mapMacroSummaryFromJson } from "../../commons/models/IMacroSummary";
import { momentToDateKey, momentToUrlString } from "../../commons/utils/dates";
import { formatDate } from "../../commons/utils/formatters";
import { diaryEntriesCacheKeys } from "./diary-entries";
import { exerciseEntriesCacheKeys } from "./exercise-entries";
import { foodItemsCacheKeys } from "./food-items";
import { setError } from "./global";
import { KeyCache } from "./helpers/KeyCache";
import { PayloadAction } from "./helpers/PayloadAction";

interface IMacroSummariesState {
	readonly loadedMacroSummariesByDate: { readonly [key: string]: IMacroSummary };
}

const initialState: IMacroSummariesState = {
	loadedMacroSummariesByDate: {},
};

enum MacroSummariesActions {
	SET_MACRO_SUMMARY_FOR_DATE = "MacroSummariesActions.SET_MACRO_SUMMARY_FOR_DATE",

	START_LOAD_MACRO_SUMMARY_FOR_DATE = "MacroSummariesActions.START_LOAD_MACRO_SUMMARY_FOR_DATE",
}

const macroSummariesCacheKeys = {
	forDate: (date: Moment.Moment) => `macro-summaries.for-date.${formatDate(date, "system")}`,
};

function setMacroSummariesForDate(date: Moment.Moment, macroSummary: IMacroSummary): PayloadAction {
	return {
		type: MacroSummariesActions.SET_MACRO_SUMMARY_FOR_DATE,
		payload: { date, macroSummary },
	};
}

function startLoadMacroSummaryForDate(date: Moment.Moment): PayloadAction {
	return {
		type: MacroSummariesActions.START_LOAD_MACRO_SUMMARY_FOR_DATE,
		payload: { date },
	};
}

function*loadMacroSummaryForDateSaga(): Generator {
	yield takeEvery(MacroSummariesActions.START_LOAD_MACRO_SUMMARY_FOR_DATE, function*(action: PayloadAction): Generator {
		const date: Moment.Moment = action.payload.date;

		// the summary must be newer than all diary, exercise and food item changes
		const summaryKey = macroSummariesCacheKeys.forDate(date);
		const dependencyKeys = [
			diaryEntriesCacheKeys.latestUpdate,
			exerciseEntriesCacheKeys.latestUpdate,
			foodItemsCacheKeys.latestUpdate,
		];

		if (KeyCache.keyIsValid(summaryKey, dependencyKeys)) {
			return;
		}

		try {
			const macroSummaries: IMacroSummary = yield call(() => axios
					.get(`/api/macro-summary/for-date/${momentToUrlString(date)}`)
					.then((res) => mapMacroSummaryFromJson(res.data as IJsonObject)));

			yield all([
				put(setMacroSummariesForDate(date, macroSummaries)),
				put(KeyCache.updateKey(summaryKey)),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*macroSummariesSagas(): Generator {
	yield all([
		loadMacroSummaryForDateSaga(),
	]);
}

function macroSummariesReducer(state = initialState, action: PayloadAction): IMacroSummariesState {
	switch (action.type) {

		case MacroSummariesActions.SET_MACRO_SUMMARY_FOR_DATE:
			return (() => {
				const date = momentToDateKey(action.payload.date);
				const macroSummary: IMacroSummary = action.payload.macroSummary;

				return {
					...state,
					loadedMacroSummariesByDate: {
						...state.loadedMacroSummariesByDate,
						[date]: macroSummary,
					},
				};
			})();

		default:
			return state;
	}
}

export {
	IMacroSummariesState,
	macroSummariesCacheKeys,
	macroSummariesReducer,
	macroSummariesSagas,
	startLoadMacroSummaryForDate,
};
