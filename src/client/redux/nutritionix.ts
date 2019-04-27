import axios from "axios";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { IFoodItem, mapFoodItemFromJson } from "../../commons/models/IFoodItem";
import { IJsonArray } from "../../commons/models/IJsonArray";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { safeMapEntities } from "../../commons/utils/entities";
import { setError } from "./global";
import { PayloadAction } from "./helpers/PayloadAction";
import { IRootState } from "./root";

interface INutritionixState {
	readonly upcSearchBusy: boolean;
	readonly keywordSearchBusy: boolean;
	readonly searchedFoodItemsByUpc: { readonly [key: string]: IFoodItem[] };
}

const initialState: INutritionixState = {
	upcSearchBusy: false,
	keywordSearchBusy: false,
	searchedFoodItemsByUpc: {},
};

enum NutritionixActions {
	SET_UPC_SEARCH_BUSY = "NutritionixActions.SET_UPC_SEARCH_BUSY",
	SET_KEYWORD_SEARCH_BUSY = "NutritionixActions.SET_KEYWORD_SEARCH_BUSY",
	SET_FOOD_ITEMS_BY_UPC = "NutritionixActions.SET_FOOD_ITEMS_BY_UPC",

	START_SEARCH_FOOD_ITEMS_BY_UPC = "NutritionixActions.START_SEARCH_FOOD_ITEMS_BY_UPC",
}

function setUpcSearchBusy(upcSearchBusy: boolean): PayloadAction {
	return {
		type: NutritionixActions.SET_UPC_SEARCH_BUSY,
		payload: { upcSearchBusy },
	};
}

function setKeywordSearchBusy(keywordSearchBusy: boolean): PayloadAction {
	return {
		type: NutritionixActions.SET_KEYWORD_SEARCH_BUSY,
		payload: { keywordSearchBusy },
	};
}

function setFoodItemsByUpc(upc: string, foodItems: IFoodItem[]): PayloadAction {
	return {
		type: NutritionixActions.SET_FOOD_ITEMS_BY_UPC,
		payload: { upc, foodItems },
	};
}

function startSearchFoodItemByUpc(upc: string): PayloadAction {
	return {
		type: NutritionixActions.START_SEARCH_FOOD_ITEMS_BY_UPC,
		payload: { upc },
	};
}

function*searchFoodItemByUpcSaga(): Generator {
	yield takeEvery(NutritionixActions.START_SEARCH_FOOD_ITEMS_BY_UPC, function*(action: PayloadAction): Generator {
		const upc: string = action.payload.upc;

		const existingResults: IFoodItem[] = yield select((state: IRootState) => {
			return state.nutritionix.searchedFoodItemsByUpc[upc];
		});
		if (existingResults !== undefined) {
			return;
		}

		yield put(setUpcSearchBusy(true));

		try {
			// check our own DB first
			const existingFoodItem: IFoodItem = yield call(() => axios
					.get(`/api/food-items/by-upc/${upc}`)
					.then((res) => mapFoodItemFromJson(res.data as IJsonObject)));

			if (existingFoodItem) {
				yield all([
					put(setFoodItemsByUpc(upc, [existingFoodItem])),
					put(setUpcSearchBusy(false)),
				]);
			} else {
				const foodItems: IFoodItem[] = yield call(() => axios
						.get(`/api/nutritionix/search-upc/${upc}`)
						.then((res) => safeMapEntities(mapFoodItemFromJson, res.data as IJsonArray)));

				yield all([
					put(setFoodItemsByUpc(upc, foodItems)),
					put(setUpcSearchBusy(false)),
				]);
			}
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*nutritionixSagas(): Generator {
	yield all([
		searchFoodItemByUpcSaga(),
	]);
}

function nutritionixReducer(state = initialState, action: PayloadAction): INutritionixState {
	switch (action.type) {

		case NutritionixActions.SET_UPC_SEARCH_BUSY:
			return {
				...state,
				upcSearchBusy: action.payload.upcSearchBusy,
			};

		case NutritionixActions.SET_KEYWORD_SEARCH_BUSY:
			return {
				...state,
				keywordSearchBusy: action.payload.keywordSearchBusy,
			};

		case NutritionixActions.SET_FOOD_ITEMS_BY_UPC:
			return (() => {
				let newState = state;

				const upc: string = action.payload.upc;
				const foodItems: IFoodItem[] = action.payload.foodItems;

				// replace individual item
				newState = {
					...newState,
					searchedFoodItemsByUpc: {
						...newState.searchedFoodItemsByUpc,
						[upc]: foodItems,
					},
				};

				return newState;
			})();

		default:
			return state;
	}
}

export {
	INutritionixState,
	nutritionixReducer,
	nutritionixSagas,
	setUpcSearchBusy,
	setKeywordSearchBusy,
	startSearchFoodItemByUpc,
};
