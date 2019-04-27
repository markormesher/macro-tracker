import axios, { AxiosError } from "axios";
import * as Moment from "moment";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { IDiaryEntry, mapDiaryEntryFromApi } from "../../commons/models/IDiaryEntry";
import { momentToDateKey, momentToUrlString } from "../../commons/utils/dates";
import { mapEntitiesFromApi } from "../../commons/utils/entities";
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

enum DiaryEntriesCacheKeys {
	LATEST_UPDATE_TIME = "DiaryEntriesCacheKeys.LATEST_UPDATE_TIME",
	LOADED_DIARY_ENTRY = "DiaryEntriesCacheKeys.LOADED_DIARY_ENTRY",
	LOADED_DIARY_ENTRIES_BY_DATE = "DiaryEntriesCacheKeys.LOADED_DIARY_ENTRIES_BY_DATE",
}

function getCacheKeyForLoadedDiaryEntry(id: string): string {
	return `${DiaryEntriesCacheKeys.LOADED_DIARY_ENTRY}_${id}`;
}

function getCacheKeyForLoadedDiaryEntriesByDate(date: Moment.Moment): string {
	return `${DiaryEntriesCacheKeys.LOADED_DIARY_ENTRIES_BY_DATE}_${momentToDateKey(date)}`;
}

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

function startSaveDiaryEntry(diaryEntry: Partial<IDiaryEntry>): PayloadAction {
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

		if (KeyCache.keyIsValid(getCacheKeyForLoadedDiaryEntry(diaryEntryId))) {
			return;
		}

		try {
			const diaryEntry: IDiaryEntry = yield call(() => axios.get(`/api/diary-entries/${diaryEntryId}`)
					.then((res) => {
						const raw: IDiaryEntry = res.data;
						return mapDiaryEntryFromApi(raw);
					}));

			yield all([
				put(setDiaryEntry(diaryEntry)),
				put(KeyCache.updateKey(getCacheKeyForLoadedDiaryEntry(diaryEntryId))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*loadDiaryEntriesForDateSaga(): Generator {
	yield takeEvery(DiaryEntriesActions.START_LOAD_DIARY_ENTRIES_FOR_DATE, function*(action: PayloadAction): Generator {
		const date: Moment.Moment = action.payload.date;

		if (KeyCache.keyIsValid(getCacheKeyForLoadedDiaryEntriesByDate(date))) {
			return;
		}

		try {
			const diaryEntries: IDiaryEntry[] = yield call(() => {
				return axios.get(`/api/diary-entries/for-date/${momentToUrlString(date)}`)
						.then((res) => {
							const raw: IDiaryEntry[] = res.data;
							return mapEntitiesFromApi(mapDiaryEntryFromApi, raw);
						});
			});

			yield all([
				put(setDiaryEntriesForDate(date, diaryEntries)),
				put(KeyCache.updateKey(getCacheKeyForLoadedDiaryEntriesByDate(date))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*saveDiaryEntrySaga(): Generator {
	yield takeEvery(DiaryEntriesActions.START_SAVE_DIARY_ENTRY, function*(action: PayloadAction): Generator {
		const diaryEntry: Partial<IDiaryEntry> = action.payload.diaryEntry;
		const diaryEntryId = diaryEntry.id || "";
		try {
			yield put(setEditorBusy(true));

			const savedEntry: IDiaryEntry = yield call(() => axios.post(`/api/diary-entries/edit/${diaryEntryId}`, diaryEntry)
					.then((res) => {
						const raw: IDiaryEntry = res.data;
						return mapDiaryEntryFromApi(raw);
					}));

			// note: this should happen before the group below
			yield put(setLastDiaryEntrySaved(savedEntry));

			yield all([
				put(setEditorBusy(false)),
				put(setEditorResult("success")),
				put(KeyCache.updateKey(DiaryEntriesCacheKeys.LATEST_UPDATE_TIME)),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedDiaryEntry(diaryEntry.id))),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedDiaryEntriesByDate(diaryEntry.date))),
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
				put(KeyCache.updateKey(DiaryEntriesCacheKeys.LATEST_UPDATE_TIME)),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedDiaryEntry(diaryEntry.id))),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedDiaryEntriesByDate(diaryEntry.date))),
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
	DiaryEntriesCacheKeys,
	diaryEntriesReducer,
	diaryEntriesSagas,
	setEditorBusy,
	setEditorResult,
	startSaveDiaryEntry,
	startDeleteDiaryEntry,
	startLoadDiaryEntry,
	startLoadDiaryEntriesForDate,
};
