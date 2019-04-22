import axios, { AxiosError } from "axios";
import { all, call, put, takeEvery } from "redux-saga/effects";
import { ITarget, mapTargetFromApi } from "../../commons/models/ITarget";
import { mapEntitiesFromApi } from "../../commons/utils/entities";
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

enum TargetsCacheKeys {
	LATEST_CACHE_TIME = "TargetsCacheKeys.LATEST_CACHE_TIME",
	ALL_TARGETS = "TargetsCacheKeys.ALL_TARGETS",
	LOADED_TARGET = "TargetsCacheKeys.LOADED_TARGET",
}

function getCacheKeyForLoadedTarget(id: string): string {
	return `${TargetsCacheKeys.LOADED_TARGET}_${id}`;
}

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

function startSaveTarget(target: Partial<ITarget>): PayloadAction {
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

function*loadTargetSaga(): Generator {
	yield takeEvery(TargetsActions.START_LOAD_TARGET, function*(action: PayloadAction): Generator {
		const targetId: string = action.payload.targetId;

		if (KeyCache.keyIsValid(getCacheKeyForLoadedTarget(targetId))) {
			return;
		}

		try {
			const target: ITarget = yield call(() => axios.get(`/api/targets/${targetId}`)
					.then((res) => {
						const raw: ITarget = res.data;
						return mapTargetFromApi(raw);
					}));

			yield all([
				put(setTarget(target)),
				put(KeyCache.updateKey(getCacheKeyForLoadedTarget(target.id))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*loadAllTargetsSaga(): Generator {
	yield takeEvery(TargetsActions.START_LOAD_ALL_TARGETS, function*(): Generator {
		if (KeyCache.keyIsValid(TargetsCacheKeys.ALL_TARGETS)) {
			return;
		}

		try {
			const targets: ITarget[] = yield call(() => axios.get("/api/targets/all")
					.then((res) => {
						const raw: ITarget[] = res.data;
						return mapEntitiesFromApi(mapTargetFromApi, raw);
					}));

			yield all([
				put(setAllTargets(targets)),
				KeyCache.updateKey(TargetsCacheKeys.ALL_TARGETS),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*saveTargetSaga(): Generator {
	yield takeEvery(TargetsActions.START_SAVE_TARGET, function*(action: PayloadAction): Generator {
		try {
			const target: Partial<ITarget> = action.payload.target;
			const targetId = target.id || "";
			yield all([
				put(setEditorBusy(true)),
				call(() => axios.post(`/api/targets/edit/${targetId}`, target)),
			]);

			yield all([
				put(setEditorBusy(false)),
				put(setEditorResult("success")),
				put(KeyCache.updateKey(TargetsCacheKeys.LATEST_CACHE_TIME)),
				put(KeyCache.invalidateKey(TargetsCacheKeys.ALL_TARGETS)),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedTarget(target.id))),
			]);
		} catch (rawError) {
			const error = rawError as AxiosError;
			yield all([
				put(setEditorBusy(false)),
				put(setEditorResult(error.response.data)),
			]);
		}
	});
}

function*deleteTargetSaga(): Generator {
	yield takeEvery(TargetsActions.START_DELETE_TARGET, function*(action: PayloadAction): Generator {
		try {
			const target: ITarget = action.payload.target;
			yield call(() => axios.post(`/api/targets/delete/${target.id}`));

			yield all([
				put(KeyCache.updateKey(TargetsCacheKeys.LATEST_CACHE_TIME)),
				put(KeyCache.invalidateKey(TargetsCacheKeys.ALL_TARGETS)),
				put(KeyCache.invalidateKey(getCacheKeyForLoadedTarget(target.id))),
			]);
		} catch (err) {
			yield put(setError(err));
		}
	});
}

function*targetsSagas(): Generator {
	yield all([
		saveTargetSaga(),
		loadAllTargetsSaga(),
		deleteTargetSaga(),
		loadTargetSaga(),
	]);
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
			return (() => {
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
			return (() => {
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
	TargetsCacheKeys,
	targetsReducer,
	targetsSagas,
	setEditorBusy,
	setEditorResult,
	startLoadTarget,
	startLoadAllTargets,
	startSaveTarget,
	startDeleteTarget,
};
