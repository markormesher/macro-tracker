import axios from "axios";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { IFoodItem, mapFoodItemFromJson } from "../../commons/models/IFoodItem";
import { IJsonArray } from "../../commons/models/IJsonArray";
import { IJsonObject } from "../../commons/models/IJsonObject";
import { safeMapEntities } from "../../commons/utils/entities";
import { setError } from "./global";
import { PayloadAction } from "./helpers/PayloadAction";
import { IRootState } from "./root";

interface IFoodSearchApiState {
	readonly upcSearchBusy: boolean;
	readonly searchedFoodItemsByUpc: { readonly [key: string]: IFoodItem[] };
}

const initialState: IFoodSearchApiState = {
	upcSearchBusy: false,
	searchedFoodItemsByUpc: {},
};

enum FoodSearchApiActions {
	SET_UPC_SEARCH_BUSY = "FoodSearchApiActions.SET_UPC_SEARCH_BUSY",
	SET_FOOD_ITEMS_BY_UPC = "FoodSearchApiActions.SET_FOOD_ITEMS_BY_UPC",

	START_SEARCH_FOOD_ITEMS_BY_UPC = "FoodSearchApiActions.START_SEARCH_FOOD_ITEMS_BY_UPC",
}

function setUpcSearchBusy(upcSearchBusy: boolean): PayloadAction {
	return {
		type: FoodSearchApiActions.SET_UPC_SEARCH_BUSY,
		payload: { upcSearchBusy },
	};
}

function setFoodItemsByUpc(upc: string, foodItems: IFoodItem[]): PayloadAction {
	return {
		type: FoodSearchApiActions.SET_FOOD_ITEMS_BY_UPC,
		payload: { upc, foodItems },
	};
}

function startSearchFoodItemByUpc(upc: string): PayloadAction {
	return {
		type: FoodSearchApiActions.START_SEARCH_FOOD_ITEMS_BY_UPC,
		payload: { upc },
	};
}

function*searchFoodItemByUpcSaga(): Generator {
	yield takeEvery(FoodSearchApiActions.START_SEARCH_FOOD_ITEMS_BY_UPC, function*(action: PayloadAction): Generator {
		const upc: string = action.payload.upc;

		const existingResults: IFoodItem[] = yield select((state: IRootState) => {
			return state.foodSearchApi.searchedFoodItemsByUpc[upc];
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
				const tescoFoodItems: IFoodItem[] = yield call(() => axios
						.get(`/api/tesco-api/search-upc/${upc}`)
						.then((res) => safeMapEntities(mapFoodItemFromJson, res.data as IJsonArray)));

				const nutritionixFoodItems: IFoodItem[] = yield call(() => axios
						.get(`/api/nutritionix-api/search-upc/${upc}`)
						.then((res) => safeMapEntities(mapFoodItemFromJson, res.data as IJsonArray)));

				const foodItems = [
					...tescoFoodItems,
					...nutritionixFoodItems,
				];

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

function*foodSearchApiSagas(): Generator {
	yield all([
		searchFoodItemByUpcSaga(),
	]);
}

function foodSearchApiReducer(state = initialState, action: PayloadAction): IFoodSearchApiState {
	switch (action.type) {

		case FoodSearchApiActions.SET_UPC_SEARCH_BUSY:
			return {
				...state,
				upcSearchBusy: action.payload.upcSearchBusy,
			};

		case FoodSearchApiActions.SET_FOOD_ITEMS_BY_UPC:
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
	IFoodSearchApiState,
	foodSearchApiReducer,
	foodSearchApiSagas,
	setUpcSearchBusy,
	startSearchFoodItemByUpc,
};
