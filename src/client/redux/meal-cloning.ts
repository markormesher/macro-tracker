import axios, { AxiosError } from "axios";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { CacheKeyUtil } from "@dragonlabs/redux-cache-key-util";
import { ICloneMealRequest, mapCloneMealRequestToJson } from "../../models/ICloneMealRequest";
import { diaryEntriesCacheKeys } from "./diary-entries";
import { ActionResult } from "./helpers/ActionResult";
import { PayloadAction } from "./helpers/PayloadAction";
import { macroSummariesCacheKeys } from "./macro-summaries";

interface IMealCloningState {
  readonly editorBusy?: boolean;
  readonly editorResult?: ActionResult;
  readonly lastCloneMealRequest: ICloneMealRequest;
}

const initialState: IMealCloningState = {
  editorBusy: false,
  editorResult: undefined,
  lastCloneMealRequest: undefined,
};

enum MealCloningActions {
  SET_EDITOR_BUSY = "MealCloningActions.SET_EDITOR_BUSY",
  SET_EDITOR_RESULT = "MealCloningActions.SET_EDITOR_RESULT",
  SET_LAST_CLONE_MEAL_REQUEST = "MealCloningActions.SET_LAST_CLONE_MEAL_REQUEST",

  START_CLONE_MEAL = "MealCloningActions.START_CLONE_MEAL",
}

function setEditorBusy(editorBusy: boolean): PayloadAction {
  return {
    type: MealCloningActions.SET_EDITOR_BUSY,
    payload: { editorBusy },
  };
}

function setEditorResult(editorResult: ActionResult): PayloadAction {
  return {
    type: MealCloningActions.SET_EDITOR_RESULT,
    payload: { editorResult },
  };
}

function setLastCloneMealRequest(cloneMealRequest: ICloneMealRequest): PayloadAction {
  return {
    type: MealCloningActions.SET_LAST_CLONE_MEAL_REQUEST,
    payload: { cloneMealRequest },
  };
}

function startCloneMeal(cloneMealRequest: ICloneMealRequest): PayloadAction {
  return {
    type: MealCloningActions.START_CLONE_MEAL,
    payload: { cloneMealRequest },
  };
}

function* saveCloneMealSaga(): Generator {
  yield takeEvery(MealCloningActions.START_CLONE_MEAL, function*(action: PayloadAction): Generator {
    const cloneMealRequest: ICloneMealRequest = action.payload.cloneMealRequest;
    try {
      yield put(setEditorBusy(true));

      yield call(() => axios.post("/api/clone-meal", mapCloneMealRequestToJson(cloneMealRequest)));

      // note: this should happen before the group below
      yield put(setLastCloneMealRequest(cloneMealRequest));

      yield all([
        put(setEditorBusy(false)),
        put(setEditorResult("success")),
        put(CacheKeyUtil.invalidateKey(diaryEntriesCacheKeys.forEntriesByDate(cloneMealRequest.toDate))),
        put(CacheKeyUtil.invalidateKey(macroSummariesCacheKeys.forDate(cloneMealRequest.toDate))),
      ]);
    } catch (rawError) {
      const error = rawError as AxiosError;
      yield all([put(setEditorBusy(false)), put(setEditorResult(error.response.data))]);
    }
  });
}

function* mealCloningSagas(): Generator {
  yield all([saveCloneMealSaga()]);
}

function mealCloningReducer(state = initialState, action: PayloadAction): IMealCloningState {
  switch (action.type) {
    case MealCloningActions.SET_EDITOR_BUSY:
      return {
        ...state,
        editorBusy: action.payload.editorBusy,
      };

    case MealCloningActions.SET_EDITOR_RESULT:
      return {
        ...state,
        editorResult: action.payload.editorResult,
      };

    case MealCloningActions.SET_LAST_CLONE_MEAL_REQUEST:
      return {
        ...state,
        lastCloneMealRequest: action.payload.cloneMealRequest,
      };

    default:
      return state;
  }
}

export { IMealCloningState, mealCloningReducer, mealCloningSagas, setEditorBusy, setEditorResult, startCloneMeal };
