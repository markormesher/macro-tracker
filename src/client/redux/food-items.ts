import axios, { AxiosError } from "axios";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { CacheKeyUtil } from "@dragonlabs/redux-cache-key-util";
import { IFoodItem, mapFoodItemFromJson, mapFoodItemToJson } from "../../commons/models/IFoodItem";
import { IJsonArray } from "../../commons/models/IJsonArray";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { safeMapEntities } from "../../commons/utils/entities";
import { setError } from "./global";
import { ActionResult } from "./helpers/ActionResult";
import { PayloadAction } from "./helpers/PayloadAction";

interface IFoodItemsState {
  readonly editorBusy: boolean;
  readonly editorResult: ActionResult;
  readonly allFoodItems: IFoodItem[];
  readonly loadedFoodItems: { readonly [key: string]: IFoodItem };
  readonly lastFoodItemSaved?: IFoodItem;
}

const initialState: IFoodItemsState = {
  editorBusy: false,
  editorResult: undefined,
  allFoodItems: [],
  loadedFoodItems: {},
  lastFoodItemSaved: undefined,
};

enum FoodItemsActions {
  SET_EDITOR_BUSY = "FoodItemsActions.SET_EDITOR_BUSY",
  SET_EDITOR_RESULT = "FoodItemsActions.SET_EDITOR_RESULT",
  SET_FOOD_ITEM = "FoodItemsActions.SET_FOOD_ITEM",
  SET_ALL_FOOD_ITEMS = "FoodItemsActions.SET_ALL_FOOD_ITEMS",
  SET_LAST_FOOD_ITEM_SAVED = "FoodItemsActions.SET_LAST_FOOD_ITEM_SAVED",

  START_LOAD_FOOD_ITEM = "FoodItemsActions.START_LOAD_FOOD_ITEM",
  START_LOAD_ALL_FOOD_ITEMS = "FoodItemsActions.START_LOAD_ALL_FOOD_ITEMS",
  START_SAVE_FOOD_ITEM = "FoodItemsActions.START_SAVE_FOOD_ITEM",
  START_DELETE_FOOD_ITEM = "FoodItemsActions.START_DELETE_FOOD_ITEM",
}

const foodItemsCacheKeys = {
  latestUpdate: "food-items.latest-update",
  allItems: "food-items.all-items",
  forItem: (id: string): string => `food-items.item.${id}`,
};

function setEditorBusy(editorBusy: boolean): PayloadAction {
  return {
    type: FoodItemsActions.SET_EDITOR_BUSY,
    payload: { editorBusy },
  };
}

function setEditorResult(editorResult: ActionResult): PayloadAction {
  return {
    type: FoodItemsActions.SET_EDITOR_RESULT,
    payload: { editorResult },
  };
}

function setFoodItem(foodItem: IFoodItem): PayloadAction {
  return {
    type: FoodItemsActions.SET_FOOD_ITEM,
    payload: { foodItem },
  };
}

function setAllFoodItems(foodItems: IFoodItem[]): PayloadAction {
  return {
    type: FoodItemsActions.SET_ALL_FOOD_ITEMS,
    payload: { foodItems },
  };
}

function setLastFoodItemSaved(foodItem: IFoodItem): PayloadAction {
  return {
    type: FoodItemsActions.SET_LAST_FOOD_ITEM_SAVED,
    payload: { foodItem },
  };
}

function startLoadFoodItem(foodItemId: string): PayloadAction {
  return {
    type: FoodItemsActions.START_LOAD_FOOD_ITEM,
    payload: { foodItemId },
  };
}

function startLoadAllFoodItems(): PayloadAction {
  return {
    type: FoodItemsActions.START_LOAD_ALL_FOOD_ITEMS,
  };
}

function startSaveFoodItem(foodItem: IFoodItem): PayloadAction {
  return {
    type: FoodItemsActions.START_SAVE_FOOD_ITEM,
    payload: { foodItem },
  };
}

function startDeleteFoodItem(foodItem: IFoodItem): PayloadAction {
  return {
    type: FoodItemsActions.START_DELETE_FOOD_ITEM,
    payload: { foodItem },
  };
}

function* loadFoodItemSaga(): Generator {
  yield takeEvery(FoodItemsActions.START_LOAD_FOOD_ITEM, function*(action: PayloadAction): Generator {
    const foodItemId: string = action.payload.foodItemId;

    if (CacheKeyUtil.keyIsValid(foodItemsCacheKeys.forItem(foodItemId))) {
      return;
    }

    try {
      const foodItem: IFoodItem = yield call(() =>
        axios.get(`/api/food-items/${foodItemId}`).then((res) => mapFoodItemFromJson(res.data as IJsonObject)),
      );

      yield all([put(setFoodItem(foodItem)), put(CacheKeyUtil.updateKey(foodItemsCacheKeys.forItem(foodItemId)))]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* loadAllFoodItemsSaga(): Generator {
  yield takeEvery(FoodItemsActions.START_LOAD_ALL_FOOD_ITEMS, function*(): Generator {
    if (CacheKeyUtil.keyIsValid(foodItemsCacheKeys.allItems)) {
      return;
    }

    try {
      const foodItems: IFoodItem[] = yield call(() =>
        axios.get("/api/food-items/all").then((res) => safeMapEntities(mapFoodItemFromJson, res.data as IJsonArray)),
      );

      yield all([put(setAllFoodItems(foodItems)), CacheKeyUtil.updateKey(foodItemsCacheKeys.allItems)]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* saveFoodItemSaga(): Generator {
  yield takeEvery(FoodItemsActions.START_SAVE_FOOD_ITEM, function*(action: PayloadAction): Generator {
    try {
      const foodItem: IFoodItem = action.payload.foodItem;
      const foodItemId = foodItem.id || "";
      yield put(setEditorBusy(true));
      const savedFoodItem: IFoodItem = yield call(() =>
        axios
          .post(`/api/food-items/edit/${foodItemId}`, mapFoodItemToJson(foodItem))
          .then((res) => mapFoodItemFromJson(res.data as IJsonObject)),
      );

      // note: this should happen before the group below
      yield put(setLastFoodItemSaved(savedFoodItem));

      yield all([
        put(setEditorBusy(false)),
        put(setEditorResult("success")),
        put(CacheKeyUtil.updateKey(foodItemsCacheKeys.latestUpdate)),
        put(CacheKeyUtil.invalidateKey(foodItemsCacheKeys.allItems)),
        put(CacheKeyUtil.invalidateKey(foodItemsCacheKeys.forItem(foodItem.id))),
      ]);
    } catch (rawError) {
      const error = rawError as AxiosError;
      yield all([put(setEditorBusy(false)), put(setEditorResult(error.response.data))]);
    }
  });
}

function* deleteFoodItemSaga(): Generator {
  yield takeEvery(FoodItemsActions.START_DELETE_FOOD_ITEM, function*(action: PayloadAction): Generator {
    try {
      const foodItem: IFoodItem = action.payload.foodItem;
      yield call(() => axios.post(`/api/food-items/delete/${foodItem.id}`));

      yield all([
        put(CacheKeyUtil.updateKey(foodItemsCacheKeys.latestUpdate)),
        put(CacheKeyUtil.invalidateKey(foodItemsCacheKeys.allItems)),
        put(CacheKeyUtil.invalidateKey(foodItemsCacheKeys.forItem(foodItem.id))),
      ]);
    } catch (err) {
      yield put(setError(err));
    }
  });
}

function* foodItemsSagas(): Generator {
  yield all([saveFoodItemSaga(), loadAllFoodItemsSaga(), deleteFoodItemSaga(), loadFoodItemSaga()]);
}

function foodItemsReducer(state = initialState, action: PayloadAction): IFoodItemsState {
  switch (action.type) {
    case FoodItemsActions.SET_EDITOR_BUSY:
      return {
        ...state,
        editorBusy: action.payload.editorBusy,
      };

    case FoodItemsActions.SET_EDITOR_RESULT:
      return {
        ...state,
        editorResult: action.payload.editorResult,
      };

    case FoodItemsActions.SET_FOOD_ITEM:
      return ((): IFoodItemsState => {
        let newState = state;
        const foodItem: IFoodItem = action.payload.foodItem;

        // replace individual item
        newState = {
          ...newState,
          loadedFoodItems: {
            ...newState.loadedFoodItems,
            [foodItem.id]: foodItem,
          },
        };

        return newState;
      })();

    case FoodItemsActions.SET_ALL_FOOD_ITEMS:
      return ((): IFoodItemsState => {
        let newState = state;
        const foodItems: IFoodItem[] = action.payload.foodItems;

        // replace the list of all items
        newState = {
          ...newState,
          allFoodItems: foodItems,
        };

        return newState;
      })();

    case FoodItemsActions.SET_LAST_FOOD_ITEM_SAVED:
      return ((): IFoodItemsState => {
        let newState = state;
        const foodItem: IFoodItem = action.payload.foodItem;

        // replace individual item
        newState = {
          ...newState,
          lastFoodItemSaved: foodItem,
        };

        return newState;
      })();

    default:
      return state;
  }
}

export {
  IFoodItemsState,
  foodItemsCacheKeys,
  foodItemsReducer,
  foodItemsSagas,
  setEditorBusy,
  setEditorResult,
  startSaveFoodItem,
  startLoadAllFoodItems,
  startDeleteFoodItem,
  startLoadFoodItem,
};
