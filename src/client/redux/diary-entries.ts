import axios, { AxiosError } from "axios";
import * as Moment from "moment";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { IDiaryEntry, mapDiaryEntryFromJson, mapDiaryEntryToJson } from "../../commons/models/IDiaryEntry";
import { IJsonArray } from "../../commons/models/IJsonArray";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { momentToDateKey, momentToUrlString } from "../../commons/utils/dates";
import { safeMapEntities } from "../../commons/utils/entities";
import { formatDate } from "../../commons/utils/formatters";
import { setError } from "./global";
import { ActionResult } from "./helpers/ActionResult";
import { KeyCache } from "./helpers/KeyCache";
import { PayloadAction } from "./helpers/PayloadAction";

interface IDiaryEntriesState {
	readonly editorBusy?: boolean;
	readonly editorResult?: ActionResult;
	readonly loadedDiaryEntries: { readonly [key: string]: IDiaryEntry };
	readonly loadedDiaryEntriesByDate: { readonly [key: string]: IDiaryEntry[] };
	readonly lastDiaryEntrySaved: IDiaryEntry;
}

const initialState: IDiaryEntriesState = {
	editorBusy: false,
	editorResult: undefined,
	loadedDiaryEntries: {},
	loadedDiaryEntriesByDate: {},
	lastDiaryEntrySaved: undefined,
};

enum DiaryEntriesActions {
	SET_EDITOR_BUSY = "DiaryEntriesActions.SET_EDITOR_BUSY",
	SET_EDITOR_RESULT = "DiaryEntriesActions.SET_EDITOR_RESULT",
	SET_DIARY_ENTRY = "DiaryEntriesActions.SET_DIARY_ENTRY",
	SET_DIARY_ENTRIES_FOR_DATE = "DiaryEntriesActions.SET_DIARY_ENTRIES_FOR_DATE",
	SET_LAST_DIARY_ENTRY_SAVED = "DiaryEntriesActions.SET_LAST_DIARY_ENTRY_SAVED",

	START_LOAD_DIARY_ENTRY = "DiaryEntriesActions.START_LOAD_DIARY_ENTRY",
	START_LOAD_DIARY_ENTRIES_FOR_DATE = "DiaryEntriesActions.START_LOAD_DIARY_ENTRIES_FOR_DATE",
	START_SAVE_DIARY_ENTRY = "DiaryEntriesActions.START_SAVE_DIARY_ENTRY",
	START_DELETE_DIARY_ENTRY = "DiaryEntriesActions.START_DELETE_DIARY_ENTRY",
}

const diaryEntriesCacheKeys = {
	latestUpdate: "diary-entries.latest-update",
	forEntry: (id: string) => `diary-entries.entry.${id}`,
	forEntriesByDate: (date: Moment.Moment) => `diary-entries.entries-by-date.${formatDate(date, "system")}`,
};

function setEditorBusy(editorBusy: boolean): PayloadAction {
	return {
		type: DiaryEntriesActions.SET_EDITOR_BUSY,
		payload: { editorBusy },
	};
}

function setEditorResult(editorResult: ActionResult): PayloadAction {
	return {
		type: DiaryEntriesActions.SET_EDITOR_RESULT,
		payload: { editorResult },
	};
}

function setDiaryEntry(diaryEntry: IDiaryEntry): PayloadAction {
	return {
		type: DiaryEntriesActions.SET_DIARY_ENTRY,
		payload: { diaryEntry },
	};
}

function setDiaryEntriesForDate(date: Moment.Moment, diaryEntries: IDiaryEntry[]): PayloadAction {
	return {
		type: DiaryEntriesActions.SET_DIARY_ENTRIES_FOR_DATE,
		payload: { date, diaryEntries },
	};
}

function setLastDiaryEntrySaved(diaryEntry: IDiaryEntry): PayloadAction {
	return {
		type: DiaryEntriesActions.SET_LAST_DIARY_ENTRY_SAVED,
		payload: { diaryEntry },
	};
}

function startLoadDiaryEntry(diaryEntryId: string): PayloadAction {
	return {
		type: DiaryEntriesActions.START_LOAD_DIARY_ENTRY,
		payload: { diaryEntryId },
	};
}

function startLoadDiaryEntriesForDate(date: Moment.Moment): PayloadAction {
	return {
		type: DiaryEntriesActions.START_LOAD_DIARY_ENTRIES_FOR_DATE,
		payload: { date },
	};
}

function startSaveDiaryEntry(diaryEntry: IDiaryEntry): PayloadAction {
	return {
		type: DiaryEntriesActions.START_SAVE_DIARY_ENTRY,
		payload: { diaryEntry },
	};
}

function startDeleteDiaryEntry(diaryEntry: IDiaryEntry): PayloadAction {
	return {
		type: DiaryEntriesActions.START_DELETE_DIARY_ENTRY,
		payload: { diaryEntry },
	};
}

function*loadDiaryEntrySaga(): Generator {
	yield takeEvery(DiaryEntriesActions.START_LOAD_DIARY_ENTRY, function*(action: PayloadAction): Generator {
		const diaryEntryId: string = action.payload.diaryEntryId;

		if (KeyCache.keyIsValid(diaryEntriesCacheKeys.forEntry(diaryEntryId))) {
			return;
		}

		try {
			const diaryEntry: IDiaryEntry = yield call(() => axios
					.get(`/api/diary-entries/${diaryEntryId}`)
					.then((res) => mapDiaryEntryFromJson(res.data as IJsonObject)));

			yield all([
				put(setDiaryEntry(diaryEntry)),
				put(KeyCache.updateKey(diaryEntriesCacheKeys.forEntry(diaryEntryId))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*loadDiaryEntriesForDateSaga(): Generator {
	yield takeEvery(DiaryEntriesActions.START_LOAD_DIARY_ENTRIES_FOR_DATE, function*(action: PayloadAction): Generator {
		const date: Moment.Moment = action.payload.date;

		if (KeyCache.keyIsValid(diaryEntriesCacheKeys.forEntriesByDate(date))) {
			return;
		}

		try {
			const diaryEntries: IDiaryEntry[] = yield call(() => axios
					.get(`/api/diary-entries/for-date/${momentToUrlString(date)}`)
					.then((res) => safeMapEntities(mapDiaryEntryFromJson, res.data as IJsonArray)));

			yield all([
				put(setDiaryEntriesForDate(date, diaryEntries)),
				put(KeyCache.updateKey(diaryEntriesCacheKeys.forEntriesByDate(date))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*saveDiaryEntrySaga(): Generator {
	yield takeEvery(DiaryEntriesActions.START_SAVE_DIARY_ENTRY, function*(action: PayloadAction): Generator {
		const diaryEntry: IDiaryEntry = action.payload.diaryEntry;
		const diaryEntryId = diaryEntry.id || "";
		try {
			yield put(setEditorBusy(true));

			const savedEntry: IDiaryEntry = yield call(() => axios
					.post(`/api/diary-entries/edit/${diaryEntryId}`, mapDiaryEntryToJson(diaryEntry))
					.then((res) => mapDiaryEntryFromJson(res.data as IJsonObject)));

			// note: this should happen before the group below
			yield put(setLastDiaryEntrySaved(savedEntry));

			yield all([
				put(setEditorBusy(false)),
				put(setEditorResult("success")),
				put(KeyCache.updateKey(diaryEntriesCacheKeys.latestUpdate)),
				put(KeyCache.invalidateKey(diaryEntriesCacheKeys.forEntry(diaryEntry.id))),
				put(KeyCache.invalidateKey(diaryEntriesCacheKeys.forEntriesByDate(diaryEntry.date))),
			]);
		} catch (rawError) {
			const error = rawError as AxiosError;
			yield all([
				put(setEditorBusy(false)),
				put(setEditorResult(error.response.data)),
			]);
		}
	});
}

function*deleteDiaryEntrySaga(): Generator {
	yield takeEvery(DiaryEntriesActions.START_DELETE_DIARY_ENTRY, function*(action: PayloadAction): Generator {
		try {
			const diaryEntry: IDiaryEntry = action.payload.diaryEntry;
			yield call(() => axios.post(`/api/diary-entries/delete/${diaryEntry.id}`));

			yield all([
				put(KeyCache.updateKey(diaryEntriesCacheKeys.latestUpdate)),
				put(KeyCache.invalidateKey(diaryEntriesCacheKeys.forEntry(diaryEntry.id))),
				put(KeyCache.invalidateKey(diaryEntriesCacheKeys.forEntriesByDate(diaryEntry.date))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*diaryEntriesSagas(): Generator {
	yield all([
		saveDiaryEntrySaga(),
		deleteDiaryEntrySaga(),
		loadDiaryEntrySaga(),
		loadDiaryEntriesForDateSaga(),
	]);
}

function diaryEntriesReducer(state = initialState, action: PayloadAction): IDiaryEntriesState {
	switch (action.type) {

		case DiaryEntriesActions.SET_EDITOR_BUSY:
			return {
				...state,
				editorBusy: action.payload.editorBusy,
			};

		case DiaryEntriesActions.SET_EDITOR_RESULT:
			return {
				...state,
				editorResult: action.payload.editorResult,
			};

		case DiaryEntriesActions.SET_DIARY_ENTRY:
			return (() => {
				const diaryEntry: IDiaryEntry = action.payload.diaryEntry;

				return {
					...state,
					loadedDiaryEntries: {
						...state.loadedDiaryEntries,
						[diaryEntry.id]: diaryEntry,
					},
				};
			})();

		case DiaryEntriesActions.SET_DIARY_ENTRIES_FOR_DATE:
			return (() => {
				const date = momentToDateKey(action.payload.date);
				const diaryEntries: IDiaryEntry[] = action.payload.diaryEntries;

				return {
					...state,
					loadedDiaryEntriesByDate: {
						...state.loadedDiaryEntriesByDate,
						[date]: diaryEntries,
					},
				};
			})();

		case DiaryEntriesActions.SET_LAST_DIARY_ENTRY_SAVED:
			return {
				...state,
				lastDiaryEntrySaved: action.payload.diaryEntry,
			};

		default:
			return state;
	}
}

export {
	IDiaryEntriesState,
	diaryEntriesCacheKeys,
	diaryEntriesReducer,
	diaryEntriesSagas,
	setEditorBusy,
	setEditorResult,
	startSaveDiaryEntry,
	startDeleteDiaryEntry,
	startLoadDiaryEntry,
	startLoadDiaryEntriesForDate,
};
