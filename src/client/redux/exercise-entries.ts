import axios, { AxiosError } from "axios";
import * as Moment from "moment";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { IExerciseEntry, mapExerciseEntryFromJson, mapExerciseEntryToJson } from "../../commons/models/IExerciseEntry";
import { IJsonArray } from "../../commons/models/IJsonArray";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { momentToDateKey, momentToUrlString } from "../../commons/utils/dates";
import { safeMapEntities } from "../../commons/utils/entities";
import { setError } from "./global";
import { ActionResult } from "./helpers/ActionResult";
import { KeyCache } from "./helpers/KeyCache";
import { PayloadAction } from "./helpers/PayloadAction";

interface IExerciseEntriesState {
	readonly editorBusy?: boolean;
	readonly editorResult?: ActionResult;
	readonly loadedExerciseEntries: { readonly [key: string]: IExerciseEntry };
	readonly loadedExerciseEntriesByDate: { readonly [key: string]: IExerciseEntry[] };
	readonly allExerciseLabels: string[];
}

const initialState: IExerciseEntriesState = {
	editorBusy: false,
	editorResult: undefined,
	loadedExerciseEntries: {},
	loadedExerciseEntriesByDate: {},
	allExerciseLabels: [],
};

enum ExerciseEntriesActions {
	SET_EDITOR_BUSY = "ExerciseEntriesActions.SET_EDITOR_BUSY",
	SET_EDITOR_RESULT = "ExerciseEntriesActions.SET_EDITOR_RESULT",
	SET_EXERCISE_ENTRY = "ExerciseEntriesActions.SET_EXERCISE_ENTRY",
	SET_EXERCISE_ENTRIES_FOR_DATE = "ExerciseEntriesActions.SET_EXERCISE_ENTRIES_FOR_DATE",
	SET_ALL_EXERCISE_LABELS = "ExerciseEntriesActions.SET_ALL_EXERCISE_LABELS",

	START_LOAD_EXERCISE_ENTRY = "ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRY",
	START_LOAD_EXERCISE_ENTRIES_FOR_DATE = "ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRIES_FOR_DATE",
	START_LOAD_ALL_EXERCISE_LABELS = "ExerciseEntriesActions.START_LOAD_ALL_EXERCISE_LABELS",
	START_SAVE_EXERCISE_ENTRY = "ExerciseEntriesActions.START_SAVE_EXERCISE_ENTRY",
	START_DELETE_EXERCISE_ENTRY = "ExerciseEntriesActions.START_DELETE_EXERCISE_ENTRY",
}

enum ExerciseEntriesCacheKeys {
	LATEST_UPDATE_TIME = "ExerciseEntriesCacheKeys.LATEST_UPDATE_TIME",
	LOADED_EXERCISE_ENTRY = "ExerciseEntriesCacheKeys.LOADED_EXERCISE_ENTRY",
	LOADED_EXERCISE_ENTRIES_BY_DATE = "ExerciseEntriesCacheKeys.LOADED_EXERCISE_ENTRIES_BY_DATE",
	ALL_EXERCISE_LABELS = "ExerciseEntriesCacheKeys.ALL_EXERCISE_LABELS",
}

function getCacheKeyForLoadedExerciseEntry(id: string): string {
	return `${ExerciseEntriesCacheKeys.LOADED_EXERCISE_ENTRY}_${id}`;
}

function getCacheKeyForLoadedExerciseEntriesByDate(date: Moment.Moment): string {
	return `${ExerciseEntriesCacheKeys.LOADED_EXERCISE_ENTRIES_BY_DATE}_${momentToDateKey(date)}`;
}

function setEditorBusy(editorBusy: boolean): PayloadAction {
	return {
		type: ExerciseEntriesActions.SET_EDITOR_BUSY,
		payload: { editorBusy },
	};
}

function setEditorResult(editorResult: ActionResult): PayloadAction {
	return {
		type: ExerciseEntriesActions.SET_EDITOR_RESULT,
		payload: { editorResult },
	};
}

function setExerciseEntry(exerciseEntry: IExerciseEntry): PayloadAction {
	return {
		type: ExerciseEntriesActions.SET_EXERCISE_ENTRY,
		payload: { exerciseEntry },
	};
}

function setExerciseEntriesForDate(date: Moment.Moment, exerciseEntries: IExerciseEntry[]): PayloadAction {
	return {
		type: ExerciseEntriesActions.SET_EXERCISE_ENTRIES_FOR_DATE,
		payload: { date, exerciseEntries },
	};
}

function setAllExerciseLabels(labels: string[]): PayloadAction {
	return {
		type: ExerciseEntriesActions.SET_ALL_EXERCISE_LABELS,
		payload: { labels },
	};
}

function startLoadExerciseEntry(exerciseEntryId: string): PayloadAction {
	return {
		type: ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRY,
		payload: { exerciseEntryId },
	};
}

function startLoadExerciseEntriesForDate(date: Moment.Moment): PayloadAction {
	return {
		type: ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRIES_FOR_DATE,
		payload: { date },
	};
}

function startLoadAllExerciseLabels(): PayloadAction {
	return {
		type: ExerciseEntriesActions.START_LOAD_ALL_EXERCISE_LABELS,
	};
}

function startSaveExerciseEntry(exerciseEntry: IExerciseEntry): PayloadAction {
	return {
		type: ExerciseEntriesActions.START_SAVE_EXERCISE_ENTRY,
		payload: { exerciseEntry },
	};
}

function startDeleteExerciseEntry(exerciseEntry: IExerciseEntry): PayloadAction {
	return {
		type: ExerciseEntriesActions.START_DELETE_EXERCISE_ENTRY,
		payload: { exerciseEntry },
	};
}

function*loadExerciseEntrySaga(): Generator {
	yield takeEvery(ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRY, function*(action: PayloadAction): Generator {
		const exerciseEntryId: string = action.payload.exerciseEntryId;

		if (KeyCache.keyIsValid(getCacheKeyForLoadedExerciseEntry(exerciseEntryId))) {
			return;
		}

		try {
			const exerciseEntry: IExerciseEntry = yield call(() => axios
					.get(`/api/exercise-entries/${exerciseEntryId}`)
					.then((res) => mapExerciseEntryFromJson(res.data as IJsonObject)));

			yield all([
				put(setExerciseEntry(exerciseEntry)),
				put(KeyCache.updateKey(getCacheKeyForLoadedExerciseEntry(exerciseEntryId))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*loadExerciseEntriesForDateSaga(): Generator {
	yield takeEvery(ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRIES_FOR_DATE,
			function*(action: PayloadAction): Generator {
				const date: Moment.Moment = action.payload.date;

				if (KeyCache.keyIsValid(getCacheKeyForLoadedExerciseEntriesByDate(date))) {
					return;
				}

				try {
					const exerciseEntries: IExerciseEntry[] = yield call(() => axios
							.get(`/api/exercise-entries/for-date/${momentToUrlString(date)}`)
							.then((res) => safeMapEntities(mapExerciseEntryFromJson, res.data as IJsonArray)));

					yield all([
						put(setExerciseEntriesForDate(date, exerciseEntries)),
						put(KeyCache.updateKey(getCacheKeyForLoadedExerciseEntriesByDate(date))),
					]);
				} catch (err) {
					yield put(setError(err));
				}
			});
}

function*loadAllExerciseLabelsSaga(): Generator {
	yield takeEvery(ExerciseEntriesActions.START_LOAD_ALL_EXERCISE_LABELS, function*(): Generator {
		if (KeyCache.keyIsValid(ExerciseEntriesCacheKeys.ALL_EXERCISE_LABELS)) {
			return;
		}

		try {
			const labels: string[] = yield call(() => axios.get("/api/exercise-entries/labels").then((res) => res.data));

			yield all([
				put(setAllExerciseLabels(labels)),
				put(KeyCache.updateKey(ExerciseEntriesCacheKeys.ALL_EXERCISE_LABELS)),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*saveExerciseEntrySaga(): Generator {
	yield takeEvery(ExerciseEntriesActions.START_SAVE_EXERCISE_ENTRY, function*(action: PayloadAction): Generator {
		const exerciseEntry: IExerciseEntry = action.payload.exerciseEntry;
		const exerciseEntryId = exerciseEntry.id || "";
		try {
			yield put(setEditorBusy(true));
			yield call(() => axios
					.post(`/api/exercise-entries/edit/${exerciseEntryId}`, mapExerciseEntryToJson(exerciseEntry)));

			yield all([
				put(setEditorBusy(false)),
				put(setEditorResult("success")),
				put(KeyCache.updateKey(ExerciseEntriesCacheKeys.LATEST_UPDATE_TIME)),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedExerciseEntry(exerciseEntry.id))),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedExerciseEntriesByDate(exerciseEntry.date))),
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

function*deleteExerciseEntrySaga(): Generator {
	yield takeEvery(ExerciseEntriesActions.START_DELETE_EXERCISE_ENTRY, function*(action: PayloadAction): Generator {
		try {
			const exerciseEntry: IExerciseEntry = action.payload.exerciseEntry;
			yield call(() => axios.post(`/api/exercise-entries/delete/${exerciseEntry.id}`));

			yield all([
				put(KeyCache.updateKey(ExerciseEntriesCacheKeys.LATEST_UPDATE_TIME)),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedExerciseEntry(exerciseEntry.id))),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedExerciseEntriesByDate(exerciseEntry.date))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*exerciseEntriesSagas(): Generator {
	yield all([
		loadExerciseEntrySaga(),
		loadExerciseEntriesForDateSaga(),
		loadAllExerciseLabelsSaga(),
		saveExerciseEntrySaga(),
		deleteExerciseEntrySaga(),
	]);
}

function exerciseEntriesReducer(state = initialState, action: PayloadAction): IExerciseEntriesState {
	switch (action.type) {

		case ExerciseEntriesActions.SET_EDITOR_BUSY:
			return {
				...state,
				editorBusy: action.payload.editorBusy,
			};

		case ExerciseEntriesActions.SET_EDITOR_RESULT:
			return {
				...state,
				editorResult: action.payload.editorResult,
			};

		case ExerciseEntriesActions.SET_EXERCISE_ENTRY:
			return (() => {
				const exerciseEntry: IExerciseEntry = action.payload.exerciseEntry;

				return {
					...state,
					loadedExerciseEntries: {
						...state.loadedExerciseEntries,
						[exerciseEntry.id]: exerciseEntry,
					},
				};
			})();

		case ExerciseEntriesActions.SET_EXERCISE_ENTRIES_FOR_DATE:
			return (() => {
				const date = momentToDateKey(action.payload.date);
				const exerciseEntries: IExerciseEntry[] = action.payload.exerciseEntries;

				return {
					...state,
					loadedExerciseEntriesByDate: {
						...state.loadedExerciseEntriesByDate,
						[date]: exerciseEntries,
					},
				};
			})();

		case ExerciseEntriesActions.SET_ALL_EXERCISE_LABELS:
			return (() => {
				const labels = action.payload.labels;

				return {
					...state,
					allExerciseLabels: labels,
				};
			})();

		default:
			return state;
	}
}

export {
	IExerciseEntriesState,
	ExerciseEntriesCacheKeys,
	exerciseEntriesReducer,
	exerciseEntriesSagas,
	setEditorBusy,
	setEditorResult,
	startLoadExerciseEntry,
	startLoadExerciseEntriesForDate,
	startLoadAllExerciseLabels,
	startSaveExerciseEntry,
	startDeleteExerciseEntry,
};
