import { RouterState } from "connected-react-router";
import { all } from "redux-saga/effects";
import { authReducer, authSagas, IAuthState } from "./auth";
import { diaryEntriesReducer, diaryEntriesSagas, IDiaryEntriesState } from "./diary-entries";
import { exerciseEntriesReducer, exerciseEntriesSagas, IExerciseEntriesState } from "./exercise-entries";
import { foodItemsReducer, foodItemsSagas, IFoodItemsState } from "./food-items";
import { foodSearchApiReducer, foodSearchApiSagas, IFoodSearchApiState } from "./food-search-api";
import { globalReducer, IGlobalState } from "./global";
import { KeyCache } from "./helpers/KeyCache";
import { IMacroSummariesState, macroSummariesReducer, macroSummariesSagas } from "./macro-summaries";
import { IMealCloningState, mealCloningReducer, mealCloningSagas } from "./meal-cloning";
import { ITargetsState, targetsReducer, targetsSagas } from "./targets";

interface IRootState {
	readonly auth: IAuthState;
	readonly diaryEntries: IDiaryEntriesState;
	readonly exerciseEntries: IExerciseEntriesState;
	readonly foodItems: IFoodItemsState;
	readonly foodSearchApi: IFoodSearchApiState;
	readonly global: IGlobalState;
	readonly macroSummaries: IMacroSummariesState;
	readonly mealCloning: IMealCloningState;
	readonly targets: ITargetsState;

	// from connected-react-router
	readonly router?: RouterState;
}

const rootReducers = {
	[KeyCache.STATE_KEY]: KeyCache.reducer,
	auth: authReducer,
	diaryEntries: diaryEntriesReducer,
	exerciseEntries: exerciseEntriesReducer,
	foodItems: foodItemsReducer,
	foodSearchApi: foodSearchApiReducer,
	global: globalReducer,
	macroSummaries: macroSummariesReducer,
	mealCloning: mealCloningReducer,
	targets: targetsReducer,
};

function*rootSaga(): Generator {
	yield all([
		authSagas(),
		diaryEntriesSagas(),
		exerciseEntriesSagas(),
		foodItemsSagas(),
		foodSearchApiSagas(),
		macroSummariesSagas(),
		mealCloningSagas(),
		targetsSagas(),
	]);
}

export {
	IRootState,
	rootReducers,
	rootSaga,
};
