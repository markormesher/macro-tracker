import { RouterState } from "connected-react-router";
import { all } from "redux-saga/effects";
import { diaryEntriesReducer, diaryEntriesSagas, IDiaryEntriesState } from "./diary-entries";
import { foodItemsReducer, foodItemsSagas, IFoodItemsState } from "./food-items";
import { globalReducer, IGlobalState } from "./global";
import { KeyCache } from "./helpers/KeyCache";

interface IRootState {
	readonly diaryEntries: IDiaryEntriesState;
	readonly foodItems: IFoodItemsState;
	readonly global: IGlobalState;

	// from connected-react-router
	readonly router?: RouterState;
}

const rootReducers = {
	[KeyCache.STATE_KEY]: KeyCache.reducer,
	diaryEntries: diaryEntriesReducer,
	foodItems: foodItemsReducer,
	global: globalReducer,
};

function*rootSaga(): Generator {
	yield all([
		diaryEntriesSagas(),
		foodItemsSagas(),
	]);
}

export {
	IRootState,
	rootReducers,
	rootSaga,
};
