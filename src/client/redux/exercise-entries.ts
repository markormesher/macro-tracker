import axios, { AxiosError } from "axios";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { CacheKeyUtil } from "@dragonlabs/redux-cache-key-util";
import { IExerciseEntry, mapExerciseEntryFromJson, mapExerciseEntryToJson } from "../../models/IExerciseEntry";
import { IJsonArray } from "../../models/IJsonArray";
import { IJsonObject } from "../../models/IJsonObject";
import { dateToDateKey, dateToUrlString } from "../../utils/dates";
import { safeMapEntities } from "../../utils/entities";
import { formatDate } from "../../utils/formatters";
import { setError } from "./global";
import { ActionResult } from "./helpers/ActionResult";
import { PayloadAction } from "./helpers/PayloadAction";

interface IExerciseEntriesState {
  readonly editorBusy?: boolean;
  readonly editorResult?: ActionResult;
  readonly loadedExerciseEntries: { readonly [key: string]: IExerciseEntry };
  readonly loadedExerciseEntriesByDate: {
    readonly [key: string]: IExerciseEntry[];
  };
  readonly allExerciseLabels: string[];
  readonly lastExerciseEntrySaved: IExerciseEntry;
}

const initialState: IExerciseEntriesState = {
  editorBusy: false,
  editorResult: undefined,
  loadedExerciseEntries: {},
  loadedExerciseEntriesByDate: {},
  allExerciseLabels: [],
  lastExerciseEntrySaved: undefined,
};

enum ExerciseEntriesActions {
  SET_EDITOR_BUSY = "ExerciseEntriesActions.SET_EDITOR_BUSY",
  SET_EDITOR_RESULT = "ExerciseEntriesActions.SET_EDITOR_RESULT",
  SET_EXERCISE_ENTRY = "ExerciseEntriesActions.SET_EXERCISE_ENTRY",
  SET_EXERCISE_ENTRIES_FOR_DATE = "ExerciseEntriesActions.SET_EXERCISE_ENTRIES_FOR_DATE",
  SET_ALL_EXERCISE_LABELS = "ExerciseEntriesActions.SET_ALL_EXERCISE_LABELS",
  SET_LAST_EXERCISE_ENTRY_SAVED = "ExerciseEntriesActions.SET_LAST_EXERCISE_ENTRY_SAVED",

  START_LOAD_EXERCISE_ENTRY = "ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRY",
  START_LOAD_EXERCISE_ENTRIES_FOR_DATE = "ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRIES_FOR_DATE",
  START_LOAD_ALL_EXERCISE_LABELS = "ExerciseEntriesActions.START_LOAD_ALL_EXERCISE_LABELS",
  START_SAVE_EXERCISE_ENTRY = "ExerciseEntriesActions.START_SAVE_EXERCISE_ENTRY",
  START_DELETE_EXERCISE_ENTRY = "ExerciseEntriesActions.START_DELETE_EXERCISE_ENTRY",
}

const exerciseEntriesCacheKeys = {
  latestUpdate: "exercise-entries.latest-update",
  allLabels: "exercise-entries.all-labels",
  forEntry: (id: string): string => `exercise-entries.entry.${id}`,
  forEntriesByDate: (date: Date): string => `exercise-entries.entries-by-date.${formatDate(date, "system")}`,
};

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

function setExerciseEntriesForDate(date: Date, exerciseEntries: IExerciseEntry[]): PayloadAction {
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

function setLastExerciseEntrySaved(exerciseEntry: IExerciseEntry): PayloadAction {
  return {
    type: ExerciseEntriesActions.SET_LAST_EXERCISE_ENTRY_SAVED,
    payload: { exerciseEntry },
  };
}

function startLoadExerciseEntry(exerciseEntryId: string): PayloadAction {
  return {
    type: ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRY,
    payload: { exerciseEntryId },
  };
}

function startLoadExerciseEntriesForDate(date: Date): PayloadAction {
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

function* loadExerciseEntrySaga(): Generator {
  yield takeEvery(ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRY, function* (action: PayloadAction): Generator {
    const exerciseEntryId: string = action.payload.exerciseEntryId;

    if (CacheKeyUtil.keyIsValid(exerciseEntriesCacheKeys.forEntry(exerciseEntryId))) {
      return;
    }

    try {
      const exerciseEntry: IExerciseEntry = yield call(() =>
        axios
          .get(`/api/exercise-entries/${exerciseEntryId}`)
          .then((res) => mapExerciseEntryFromJson(res.data as IJsonObject)),
      );

      yield all([
        put(setExerciseEntry(exerciseEntry)),
        put(CacheKeyUtil.updateKey(exerciseEntriesCacheKeys.forEntry(exerciseEntryId))),
      ]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* loadExerciseEntriesForDateSaga(): Generator {
  yield takeEvery(
    ExerciseEntriesActions.START_LOAD_EXERCISE_ENTRIES_FOR_DATE,
    function* (action: PayloadAction): Generator {
      const date: Date = action.payload.date;

      if (CacheKeyUtil.keyIsValid(exerciseEntriesCacheKeys.forEntriesByDate(date))) {
        return;
      }

      try {
        const exerciseEntries: IExerciseEntry[] = yield call(() =>
          axios
            .get(`/api/exercise-entries/for-date/${dateToUrlString(date)}`)
            .then((res) => safeMapEntities(mapExerciseEntryFromJson, res.data as IJsonArray)),
        );

        yield all([
          put(setExerciseEntriesForDate(date, exerciseEntries)),
          put(CacheKeyUtil.updateKey(exerciseEntriesCacheKeys.forEntriesByDate(date))),
        ]);
      } catch (err) {
        yield put(setError(err));
      }
    },
  );
}

function* loadAllExerciseLabelsSaga(): Generator {
  yield takeEvery(ExerciseEntriesActions.START_LOAD_ALL_EXERCISE_LABELS, function* (): Generator {
    if (CacheKeyUtil.keyIsValid(exerciseEntriesCacheKeys.allLabels)) {
      return;
    }

    try {
      const labels: string[] = yield call(() => axios.get("/api/exercise-entries/labels").then((res) => res.data));

      yield all([put(setAllExerciseLabels(labels)), put(CacheKeyUtil.updateKey(exerciseEntriesCacheKeys.allLabels))]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* saveExerciseEntrySaga(): Generator {
  yield takeEvery(ExerciseEntriesActions.START_SAVE_EXERCISE_ENTRY, function* (action: PayloadAction): Generator {
    const exerciseEntry: IExerciseEntry = action.payload.exerciseEntry;
    const exerciseEntryId = exerciseEntry.id || "";
    try {
      yield put(setEditorBusy(true));
      const savedEntry: IExerciseEntry = yield call(() =>
        axios
          .post(`/api/exercise-entries/edit/${exerciseEntryId}`, mapExerciseEntryToJson(exerciseEntry))
          .then((res) => mapExerciseEntryFromJson(res.data as IJsonObject)),
      );

      // note: this should happen before the group below
      yield put(setLastExerciseEntrySaved(savedEntry));

      yield all([
        put(setEditorBusy(false)),
        put(setEditorResult("success")),
        put(CacheKeyUtil.updateKey(exerciseEntriesCacheKeys.latestUpdate)),
        put(CacheKeyUtil.invalidateKey(exerciseEntriesCacheKeys.allLabels)),
        put(CacheKeyUtil.invalidateKey(exerciseEntriesCacheKeys.forEntry(exerciseEntry.id))),
        put(CacheKeyUtil.invalidateKey(exerciseEntriesCacheKeys.forEntriesByDate(exerciseEntry.date))),
      ]);
    } catch (rawError) {
      const error = rawError as AxiosError;
      yield all([put(setEditorBusy(false)), put(setEditorResult(error.response.data))]);
    }
  });
}

function* deleteExerciseEntrySaga(): Generator {
  yield takeEvery(ExerciseEntriesActions.START_DELETE_EXERCISE_ENTRY, function* (action: PayloadAction): Generator {
    try {
      const exerciseEntry: IExerciseEntry = action.payload.exerciseEntry;
      yield call(() => axios.post(`/api/exercise-entries/delete/${exerciseEntry.id}`));

      yield all([
        put(CacheKeyUtil.updateKey(exerciseEntriesCacheKeys.latestUpdate)),
        put(CacheKeyUtil.invalidateKey(exerciseEntriesCacheKeys.allLabels)),
        put(CacheKeyUtil.invalidateKey(exerciseEntriesCacheKeys.forEntry(exerciseEntry.id))),
        put(CacheKeyUtil.invalidateKey(exerciseEntriesCacheKeys.forEntriesByDate(exerciseEntry.date))),
      ]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* exerciseEntriesSagas(): Generator {
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
      return ((): IExerciseEntriesState => {
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
      return ((): IExerciseEntriesState => {
        const date = dateToDateKey(action.payload.date);
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
      return ((): IExerciseEntriesState => {
        const labels = action.payload.labels;

        return {
          ...state,
          allExerciseLabels: labels,
        };
      })();

    case ExerciseEntriesActions.SET_LAST_EXERCISE_ENTRY_SAVED:
      return {
        ...state,
        lastExerciseEntrySaved: action.payload.exerciseEntry,
      };

    default:
      return state;
  }
}

export {
  IExerciseEntriesState,
  exerciseEntriesCacheKeys,
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
