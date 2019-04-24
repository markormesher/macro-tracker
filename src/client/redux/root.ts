import { RouterState } from "connected-react-router";
import { all } from "redux-saga/effects";
import { diaryEntriesReducer, diaryEntriesSagas, IDiaryEntriesState } from "./diary-entries";
import { exerciseEntriesReducer, exerciseEntriesSagas, IExerciseEntriesState } from "./exercise-entries";
import { foodItemsReducer, foodItemsSagas, IFoodItemsState } from "./food-items";
import { globalReducer, IGlobalState } from "./global";
import { KeyCache } from "./helpers/KeyCache";
import { INutritionixState, nutritionixReducer, nutritionixSagas } from "./nutritionix";
import { ITargetsState, targetsReducer, targetsSagas } from "./targets";

interface IRootState {
	readonly diaryEntries: IDiaryEntriesState;
	readonly exerciseEntries: IExerciseEntriesState;
	readonly foodItems: IFoodItemsState;
	readonly global: IGlobalState;
	readonly nutritionix: INutritionixState;
	readonly targets: ITargetsState;

	// from connected-react-router
	readonly router?: RouterState;
}

const rootReducers = {
	[KeyCache.STATE_KEY]: KeyCache.reducer,
	diaryEntries: diaryEntriesReducer,
	exerciseEntries: exerciseEntriesReducer,
	foodItems: foodItemsReducer,
	global: globalReducer,
	nutritionix: nutritionixReducer,
	targets: targetsReducer,
};

function*rootSaga(): Generator {
	yield all([
		diaryEntriesSagas(),
		exerciseEntriesSagas(),
		foodItemsSagas(),
		nutritionixSagas(),
		targetsSagas(),
	]);
}

export {
	IRootState,
	rootReducers,
	rootSaga,
};
