import axios, { AxiosError } from "axios";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { IJsonArray } from "../../commons/models/IJsonArray";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { ITarget, mapTargetFromJson, mapTargetToJson } from "../../commons/models/ITarget";
import { safeMapEntities } from "../../commons/utils/entities";
import { setError } from "./global";
import { ActionResult } from "./helpers/ActionResult";
import { KeyCache } from "./helpers/KeyCache";
import { PayloadAction } from "./helpers/PayloadAction";

interface ITargetsState {
  readonly editorBusy: boolean;
  readonly editorResult: ActionResult;
  readonly loadedTargets: { readonly [key: string]: ITarget };
  readonly allTargets: ITarget[];
}

const initialState: ITargetsState = {
  editorBusy: false,
  editorResult: undefined,
  loadedTargets: {},
  allTargets: [],
};

enum TargetsActions {
  SET_EDITOR_BUSY = "TargetsActions.SET_EDITOR_BUSY",
  SET_EDITOR_RESULT = "TargetsActions.SET_EDITOR_RESULT",
  SET_TARGET = "TargetsActions.SET_TARGET",
  SET_ALL_TARGETS = "TargetsActions.SET_ALL_TARGETS",

  START_LOAD_TARGET = "TargetsActions.START_LOAD_TARGET",
  START_LOAD_ALL_TARGETS = "TargetsActions.START_LOAD_ALL_TARGETS",
  START_SAVE_TARGET = "TargetsActions.START_SAVE_TARGET",
  START_DELETE_TARGET = "TargetsActions.START_DELETE_TARGET",
}

const targetsCacheKeys = {
  latestUpdate: "targets.latest-update",
  allTargets: "targets.all-targets",
  forTarget: (id: string): string => `targets.target.${id}`,
};

function setEditorBusy(editorBusy: boolean): PayloadAction {
  return {
    type: TargetsActions.SET_EDITOR_BUSY,
    payload: { editorBusy },
  };
}

function setEditorResult(editorResult: ActionResult): PayloadAction {
  return {
    type: TargetsActions.SET_EDITOR_RESULT,
    payload: { editorResult },
  };
}

function setTarget(target: ITarget): PayloadAction {
  return {
    type: TargetsActions.SET_TARGET,
    payload: { target },
  };
}

function setAllTargets(targets: ITarget[]): PayloadAction {
  return {
    type: TargetsActions.SET_ALL_TARGETS,
    payload: { targets },
  };
}

function startLoadTarget(targetId: string): PayloadAction {
  return {
    type: TargetsActions.START_LOAD_TARGET,
    payload: { targetId },
  };
}

function startLoadAllTargets(): PayloadAction {
  return {
    type: TargetsActions.START_LOAD_ALL_TARGETS,
  };
}

function startSaveTarget(target: ITarget): PayloadAction {
  return {
    type: TargetsActions.START_SAVE_TARGET,
    payload: { target },
  };
}

function startDeleteTarget(target: ITarget): PayloadAction {
  return {
    type: TargetsActions.START_DELETE_TARGET,
    payload: { target },
  };
}

function* loadTargetSaga(): Generator {
  yield takeEvery(TargetsActions.START_LOAD_TARGET, function*(action: PayloadAction): Generator {
    const targetId: string = action.payload.targetId;

    if (KeyCache.keyIsValid(targetsCacheKeys.forTarget(targetId))) {
      return;
    }

    try {
      const target: ITarget = yield call(() =>
        axios.get(`/api/targets/${targetId}`).then((res) => mapTargetFromJson(res.data as IJsonObject)),
      );

      yield all([put(setTarget(target)), put(KeyCache.updateKey(targetsCacheKeys.forTarget(target.id)))]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* loadAllTargetsSaga(): Generator {
  yield takeEvery(TargetsActions.START_LOAD_ALL_TARGETS, function*(): Generator {
    if (KeyCache.keyIsValid(targetsCacheKeys.allTargets)) {
      return;
    }

    try {
      const targets: ITarget[] = yield call(() =>
        axios.get("/api/targets/all").then((res) => safeMapEntities(mapTargetFromJson, res.data as IJsonArray)),
      );

      yield all([put(setAllTargets(targets)), KeyCache.updateKey(targetsCacheKeys.allTargets)]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* saveTargetSaga(): Generator {
  yield takeEvery(TargetsActions.START_SAVE_TARGET, function*(action: PayloadAction): Generator {
    try {
      const target: ITarget = action.payload.target;
      const targetId = target.id || "";
      yield put(setEditorBusy(true));
      yield call(() => axios.post(`/api/targets/edit/${targetId}`, mapTargetToJson(target)));

      yield all([
        put(setEditorBusy(false)),
        put(setEditorResult("success")),
        put(KeyCache.updateKey(targetsCacheKeys.latestUpdate)),
        put(KeyCache.invalidateKey(targetsCacheKeys.allTargets)),
        put(KeyCache.invalidateKey(targetsCacheKeys.forTarget(target.id))),
      ]);
    } catch (rawError) {
      const error = rawError as AxiosError;
      yield all([put(setEditorBusy(false)), put(setEditorResult(error.response.data))]);
    }
  });
}

function* deleteTargetSaga(): Generator {
  yield takeEvery(TargetsActions.START_DELETE_TARGET, function*(action: PayloadAction): Generator {
    try {
      const target: ITarget = action.payload.target;
      yield call(() => axios.post(`/api/targets/delete/${target.id}`));

      yield all([
        put(KeyCache.updateKey(targetsCacheKeys.latestUpdate)),
        put(KeyCache.invalidateKey(targetsCacheKeys.allTargets)),
        put(KeyCache.invalidateKey(targetsCacheKeys.forTarget(target.id))),
      ]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* targetsSagas(): Generator {
  yield all([saveTargetSaga(), loadAllTargetsSaga(), deleteTargetSaga(), loadTargetSaga()]);
}

function targetsReducer(state = initialState, action: PayloadAction): ITargetsState {
  switch (action.type) {
    case TargetsActions.SET_EDITOR_BUSY:
      return {
        ...state,
        editorBusy: action.payload.editorBusy,
      };

    case TargetsActions.SET_EDITOR_RESULT:
      return {
        ...state,
        editorResult: action.payload.editorResult,
      };

    case TargetsActions.SET_TARGET:
      return ((): ITargetsState => {
        let newState = state;
        const target: ITarget = action.payload.target;

        // replace individual item
        newState = {
          ...newState,
          loadedTargets: {
            ...newState.loadedTargets,
            [target.id]: target,
          },
        };

        return newState;
      })();

    case TargetsActions.SET_ALL_TARGETS:
      return ((): ITargetsState => {
        let newState = state;
        const targets: ITarget[] = action.payload.targets;

        // replace the list of all items
        newState = {
          ...newState,
          allTargets: targets,
        };

        return newState;
      })();

    default:
      return state;
  }
}

export {
  ITargetsState,
  targetsCacheKeys,
  targetsReducer,
  targetsSagas,
  setEditorBusy,
  setEditorResult,
  startLoadTarget,
  startLoadAllTargets,
  startSaveTarget,
  startDeleteTarget,
};
