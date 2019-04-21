import { Store } from "redux";

interface IKeyCacheState {
	readonly [key: string]: number;
}

interface IKeyCacheAction {
	readonly type: KeyCacheActions | "@@INIT";
	readonly key?: string;
}

enum KeyCacheActions {
	UPDATE = "KeyCacheActions.UPDATE",
	INVALIDATE = "KeyCacheActions.INVALIDATE",
}

const MIN_VALID_KEY = 0;
const INVALID_KEY = MIN_VALID_KEY - 1;

class KeyCache<State> {

	public static STATE_KEY = "__cache";
	public static store?: Store;

	public static setStore(store: Store): void {
		KeyCache.store = store;
	}

	public static updateKey(key: string): IKeyCacheAction {
		KeyCache.checkStore();
		return {
			type: KeyCacheActions.UPDATE,
			key,
		};
	}

	public static invalidateKey(key: string): IKeyCacheAction {
		KeyCache.checkStore();
		return {
			type: KeyCacheActions.INVALIDATE,
			key,
		};
	}

	public static getKeyTime(key: string): number {
		KeyCache.checkStore();
		const state = KeyCache.store.getState()[this.STATE_KEY] as IKeyCacheState;
		return state[key] || INVALID_KEY;
	}

	public static keysAreValid(keys: string[], dependencies: string[] = []): boolean {
		KeyCache.checkStore();
		const minKeyTime = keys.map((key) => KeyCache.getKeyTime(key)).reduce((a, b) => Math.min(a, b), MIN_VALID_KEY);
		if (minKeyTime < MIN_VALID_KEY) {
			return false;
		}

		let valid = true;
		dependencies.forEach((d) => {
			if (KeyCache.getKeyTime(d) >= minKeyTime) {
				valid = false;
			}
		});
		return valid;
	}

	public static keyIsValid(key: string, dependencies: string[] = []): boolean {
		return this.keysAreValid([key], dependencies);
	}

	public static reducer(state: IKeyCacheState = {}, action: IKeyCacheAction): IKeyCacheState {
		switch (action.type) {
			case KeyCacheActions.UPDATE:
				return {
					...state,
					[action.key]: KeyCache.getTimestamp(),
				};

			case KeyCacheActions.INVALIDATE:
				return {
					...state,
					[action.key]: INVALID_KEY,
				};

			default:
				return state;
		}
	}

	private static maxTimestampGiven = 0;

	private static checkStore(): void {
		if (!KeyCache.store) {
			throw new Error("Store is not set");
		}
	}

	private static getTimestamp(): number {
		const raw = new Date().getTime();
		const output = raw > this.maxTimestampGiven ? raw : this.maxTimestampGiven + 1;
		this.maxTimestampGiven = output;
		return output;
	}

}

export {
	IKeyCacheState,
	IKeyCacheAction,
	KeyCacheActions,
	KeyCache,
};
