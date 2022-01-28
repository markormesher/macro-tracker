import axios, { AxiosError } from "axios";
import { all, call, Effect, put, takeEvery } from "redux-saga/effects";
import { CacheKeyUtil } from "@dragonlabs/redux-cache-key-util";
import { IDiaryEntry, mapDiaryEntryFromJson, mapDiaryEntryToJson } from "../../models/IDiaryEntry";
import { IJsonArray } from "../../models/IJsonArray";
import { IJsonObject } from "../../models/IJsonObject";
import { dateToDateKey, dateToUrlString } from "../../utils/dates";
import { safeMapEntities } from "../../utils/entities";
import { formatDate } from "../../utils/formatters";
import { setError } from "./global";
import { ActionResult } from "./helpers/ActionResult";
import { PayloadAction } from "./helpers/PayloadAction";

interface IDiaryEntriesState {
  readonly editorBusy?: boolean;
  readonly multiSaveEditorBusy?: boolean;
  readonly editorResult?: ActionResult;
  readonly multiSaveEditorResult?: ActionResult;
  readonly loadedDiaryEntries: { readonly [key: string]: IDiaryEntry };
  readonly loadedDiaryEntriesByDate: { readonly [key: string]: IDiaryEntry[] };
  readonly lastDiaryEntrySaved: IDiaryEntry;
}

const initialState: IDiaryEntriesState = {
  editorBusy: false,
  multiSaveEditorBusy: false,
  editorResult: undefined,
  multiSaveEditorResult: undefined,
  loadedDiaryEntries: {},
  loadedDiaryEntriesByDate: {},
  lastDiaryEntrySaved: undefined,
};

enum DiaryEntriesActions {
  SET_EDITOR_BUSY = "DiaryEntriesActions.SET_EDITOR_BUSY",
  SET_MULTI_SAVE_EDITOR_BUSY = "DiaryEntriesActions.SET_MULTI_SAVE_EDITOR_BUSY",
  SET_EDITOR_RESULT = "DiaryEntriesActions.SET_EDITOR_RESULT",
  SET_MULTI_SAVE_EDITOR_RESULT = "DiaryEntriesActions.SET_MULTI_SAVE_EDITOR_RESULT",
  SET_DIARY_ENTRY = "DiaryEntriesActions.SET_DIARY_ENTRY",
  SET_DIARY_ENTRIES_FOR_DATE = "DiaryEntriesActions.SET_DIARY_ENTRIES_FOR_DATE",
  SET_LAST_DIARY_ENTRY_SAVED = "DiaryEntriesActions.SET_LAST_DIARY_ENTRY_SAVED",

  START_LOAD_DIARY_ENTRY = "DiaryEntriesActions.START_LOAD_DIARY_ENTRY",
  START_LOAD_DIARY_ENTRIES_FOR_DATE = "DiaryEntriesActions.START_LOAD_DIARY_ENTRIES_FOR_DATE",
  START_SAVE_DIARY_ENTRY = "DiaryEntriesActions.START_SAVE_DIARY_ENTRY",
  START_MULTI_SAVE_DIARY_ENTRIES = "DiaryEntriesActions.START_MULTI_SAVE_DIARY_ENTRIES",
  START_DELETE_DIARY_ENTRY = "DiaryEntriesActions.START_DELETE_DIARY_ENTRY",
}

const diaryEntriesCacheKeys = {
  latestUpdate: "diary-entries.latest-update",
  forEntry: (id: string): string => `diary-entries.entry.${id}`,
  forEntriesByDate: (date: Date): string => `diary-entries.entries-by-date.${formatDate(date, "system")}`,
};

function setEditorBusy(editorBusy: boolean): PayloadAction {
  return {
    type: DiaryEntriesActions.SET_EDITOR_BUSY,
    payload: { editorBusy },
  };
}

function setMultiSaveEditorBusy(editorBusy: boolean): PayloadAction {
  return {
    type: DiaryEntriesActions.SET_MULTI_SAVE_EDITOR_BUSY,
    payload: { editorBusy },
  };
}

function setEditorResult(editorResult: ActionResult): PayloadAction {
  return {
    type: DiaryEntriesActions.SET_EDITOR_RESULT,
    payload: { editorResult },
  };
}

function setMultiSaveEditorResult(editorResult: ActionResult): PayloadAction {
  return {
    type: DiaryEntriesActions.SET_MULTI_SAVE_EDITOR_RESULT,
    payload: { editorResult },
  };
}

function setDiaryEntry(diaryEntry: IDiaryEntry): PayloadAction {
  return {
    type: DiaryEntriesActions.SET_DIARY_ENTRY,
    payload: { diaryEntry },
  };
}

function setDiaryEntriesForDate(date: Date, diaryEntries: IDiaryEntry[]): PayloadAction {
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

function startLoadDiaryEntriesForDate(date: Date): PayloadAction {
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

function startMultiSaveDiaryEntries(diaryEntries: IDiaryEntry[]): PayloadAction {
  return {
    type: DiaryEntriesActions.START_MULTI_SAVE_DIARY_ENTRIES,
    payload: { diaryEntries },
  };
}

function startDeleteDiaryEntry(diaryEntry: IDiaryEntry): PayloadAction {
  return {
    type: DiaryEntriesActions.START_DELETE_DIARY_ENTRY,
    payload: { diaryEntry },
  };
}

function* loadDiaryEntrySaga(): Generator {
  yield takeEvery(DiaryEntriesActions.START_LOAD_DIARY_ENTRY, function*(action: PayloadAction): Generator {
    const diaryEntryId: string = action.payload.diaryEntryId;

    if (CacheKeyUtil.keyIsValid(diaryEntriesCacheKeys.forEntry(diaryEntryId))) {
      return;
    }

    try {
      const diaryEntry: IDiaryEntry = yield call(() =>
        axios.get(`/api/diary-entries/${diaryEntryId}`).then((res) => mapDiaryEntryFromJson(res.data as IJsonObject)),
      );

      yield all([
        put(setDiaryEntry(diaryEntry)),
        put(CacheKeyUtil.updateKey(diaryEntriesCacheKeys.forEntry(diaryEntryId))),
      ]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* loadDiaryEntriesForDateSaga(): Generator {
  yield takeEvery(DiaryEntriesActions.START_LOAD_DIARY_ENTRIES_FOR_DATE, function*(action: PayloadAction): Generator {
    const date: Date = action.payload.date;

    if (CacheKeyUtil.keyIsValid(diaryEntriesCacheKeys.forEntriesByDate(date))) {
      return;
    }

    try {
      const diaryEntries: IDiaryEntry[] = yield call(() =>
        axios
          .get(`/api/diary-entries/for-date/${dateToUrlString(date)}`)
          .then((res) => safeMapEntities(mapDiaryEntryFromJson, res.data as IJsonArray)),
      );

      yield all([
        put(setDiaryEntriesForDate(date, diaryEntries)),
        put(CacheKeyUtil.updateKey(diaryEntriesCacheKeys.forEntriesByDate(date))),
      ]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* saveDiaryEntrySaga(): Generator {
  yield takeEvery(DiaryEntriesActions.START_SAVE_DIARY_ENTRY, function*(action: PayloadAction): Generator {
    const diaryEntry: IDiaryEntry = action.payload.diaryEntry;
    const diaryEntryId = diaryEntry.id || "";
    try {
      yield put(setEditorBusy(true));

      const savedEntry: IDiaryEntry = yield call(() =>
        axios
          .post(`/api/diary-entries/edit/${diaryEntryId}`, mapDiaryEntryToJson(diaryEntry))
          .then((res) => mapDiaryEntryFromJson(res.data as IJsonObject)),
      );

      // note: this should happen before the group below
      yield put(setLastDiaryEntrySaved(savedEntry));

      yield all([
        put(setEditorBusy(false)),
        put(setEditorResult("success")),
        put(CacheKeyUtil.updateKey(diaryEntriesCacheKeys.latestUpdate)),
        put(CacheKeyUtil.invalidateKey(diaryEntriesCacheKeys.forEntry(diaryEntry.id))),
        put(CacheKeyUtil.invalidateKey(diaryEntriesCacheKeys.forEntriesByDate(diaryEntry.date))),
      ]);
    } catch (rawError) {
      const error = rawError as AxiosError;
      yield all([put(setEditorBusy(false)), put(setEditorResult(error.response.data))]);
    }
  });
}

function* multiSaveDiaryEntriesSaga(): Generator {
  yield takeEvery(DiaryEntriesActions.START_MULTI_SAVE_DIARY_ENTRIES, function*(action: PayloadAction): Generator {
    const diaryEntries: IDiaryEntry[] = action.payload.diaryEntries;
    try {
      yield put(setMultiSaveEditorBusy(true));

      const cacheUpdates: Effect[] = [];

      for (const diaryEntry of diaryEntries) {
        const diaryEntryId = diaryEntry.id || "";
        yield call(() =>
          axios
            .post(`/api/diary-entries/edit/${diaryEntryId}`, mapDiaryEntryToJson(diaryEntry))
            .then((res) => mapDiaryEntryFromJson(res.data as IJsonObject)),
        );
        cacheUpdates.push(put(CacheKeyUtil.invalidateKey(diaryEntriesCacheKeys.forEntry(diaryEntry.id))));
        cacheUpdates.push(put(CacheKeyUtil.invalidateKey(diaryEntriesCacheKeys.forEntriesByDate(diaryEntry.date))));
      }

      yield all([
        put(setMultiSaveEditorBusy(false)),
        put(setMultiSaveEditorResult("success")),
        put(CacheKeyUtil.updateKey(diaryEntriesCacheKeys.latestUpdate)),
        ...cacheUpdates,
      ]);
    } catch (rawError) {
      const error = rawError as AxiosError;
      yield all([put(setMultiSaveEditorBusy(false)), put(setMultiSaveEditorResult(error.response.data))]);
    }
  });
}

function* deleteDiaryEntrySaga(): Generator {
  yield takeEvery(DiaryEntriesActions.START_DELETE_DIARY_ENTRY, function*(action: PayloadAction): Generator {
    try {
      const diaryEntry: IDiaryEntry = action.payload.diaryEntry;
      yield call(() => axios.post(`/api/diary-entries/delete/${diaryEntry.id}`));

      yield all([
        put(CacheKeyUtil.updateKey(diaryEntriesCacheKeys.latestUpdate)),
        put(CacheKeyUtil.invalidateKey(diaryEntriesCacheKeys.forEntry(diaryEntry.id))),
        put(CacheKeyUtil.invalidateKey(diaryEntriesCacheKeys.forEntriesByDate(diaryEntry.date))),
      ]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* diaryEntriesSagas(): Generator {
  yield all([
    saveDiaryEntrySaga(),
    multiSaveDiaryEntriesSaga(),
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

    case DiaryEntriesActions.SET_MULTI_SAVE_EDITOR_BUSY:
      return {
        ...state,
        multiSaveEditorBusy: action.payload.editorBusy,
      };

    case DiaryEntriesActions.SET_EDITOR_RESULT:
      return {
        ...state,
        editorResult: action.payload.editorResult,
      };

    case DiaryEntriesActions.SET_MULTI_SAVE_EDITOR_RESULT:
      return {
        ...state,
        multiSaveEditorResult: action.payload.editorResult,
      };

    case DiaryEntriesActions.SET_DIARY_ENTRY:
      return ((): IDiaryEntriesState => {
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
      return ((): IDiaryEntriesState => {
        const date = dateToDateKey(action.payload.date);
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
  startMultiSaveDiaryEntries,
  startDeleteDiaryEntry,
  startLoadDiaryEntry,
  startLoadDiaryEntriesForDate,
};
