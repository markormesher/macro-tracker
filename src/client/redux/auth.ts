import axios from "axios";
import { all, call, put, select, take, takeEvery } from "redux-saga/effects";
import { IUser, mapUserFromApi } from "../../commons/models/IUser";
import { addWait, removeWait, setError } from "./global";
import { PayloadAction } from "./helpers/PayloadAction";
import { IRootState } from "./root";

interface IAuthState {
  readonly activeUser?: IUser;
}

const initialState: IAuthState = {
  activeUser: undefined,
};

enum AuthActions {
  START_LOAD_CURRENT_USER = "AuthActions.START_LOAD_CURRENT_USER",
  START_LOGOUT_CURRENT_USER = "AuthActions.START_LOGOUT_CURRENT_USER",
  SET_CURRENT_USER = "AuthActions.SET_CURRENT_USER",
  UNSET_CURRENT_USER = "AuthActions.UNSET_CURRENT_USER",
}

function startLoadCurrentUser(): PayloadAction {
  return {
    type: AuthActions.START_LOAD_CURRENT_USER,
  };
}

function startLogOutCurrentUser(): PayloadAction {
  return {
    type: AuthActions.START_LOGOUT_CURRENT_USER,
  };
}

function setCurrentUser(user: IUser): PayloadAction {
  return {
    type: AuthActions.SET_CURRENT_USER,
    payload: { user },
  };
}

function unsetCurrentUser(): PayloadAction {
  return {
    type: AuthActions.UNSET_CURRENT_USER,
  };
}

function* loadUserSaga(): Generator {
  yield takeEvery(AuthActions.START_LOAD_CURRENT_USER, function*(): Generator {
    // only use global waits if a user wasn't already loaded
    const currentUser = yield select((state: IRootState) => state.auth.activeUser);
    const useWaits = !currentUser;

    if (useWaits) {
      yield put(addWait("auth"));
    }
    try {
      const user: IUser = yield call(() =>
        axios.get("/api/auth/current-user").then((res) => {
          const raw: IUser = res.data;
          return mapUserFromApi(raw);
        }),
      );
      if (user !== undefined) {
        yield all([put(setCurrentUser(user)), useWaits && put(removeWait("auth"))]);
      } else {
        yield all([put(unsetCurrentUser()), useWaits && put(removeWait("auth"))]);
      }
    } catch (err) {
      yield all([put(setError(err)), useWaits && put(removeWait("auth"))]);
    }
  });
}

function* logOutCurrentUserSaga(): Generator {
  yield take(AuthActions.START_LOGOUT_CURRENT_USER);
  yield put(addWait("auth"));
  try {
    yield call(() => axios.post("/api/auth/logout"));
    yield all([put(unsetCurrentUser()), put(removeWait("auth"))]);
  } catch (err) {
    yield all([put(setError(err)), put(removeWait("auth"))]);
  }
}

function* authSagas(): Generator {
  yield all([loadUserSaga(), logOutCurrentUserSaga()]);
}

function authReducer(state = initialState, action: PayloadAction): IAuthState {
  switch (action.type) {
    case AuthActions.SET_CURRENT_USER:
      return {
        ...state,
        activeUser: action.payload.user,
      };

    case AuthActions.UNSET_CURRENT_USER:
      return {
        ...state,
        activeUser: undefined,
      };

    default:
      return state;
  }
}

export {
  IAuthState,
  AuthActions,
  authReducer,
  authSagas,
  loadUserSaga,
  logOutCurrentUserSaga,
  setCurrentUser,
  startLoadCurrentUser,
  startLogOutCurrentUser,
  unsetCurrentUser,
};
