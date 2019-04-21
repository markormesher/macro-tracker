import { ConnectedRouter, connectRouter, routerMiddleware } from "connected-react-router";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";
import { App } from "./components/App/App";
import { history } from "./helpers/single-history";
import { KeyCache } from "./redux/helpers/KeyCache";
import { rootReducers, rootSaga } from "./redux/root";

// "require" forces webpack to include entire stylesheets; "import" only works for named exports
require("./global-styles/Bootstrap.scss"); // tslint:disable-line:no-var-requires
require("./global-styles/Global.scss"); // tslint:disable-line:no-var-requires

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
		combineReducers({
			...rootReducers,
			router: connectRouter(history),
		}),
		composeWithDevTools(
				applyMiddleware(
						routerMiddleware(history),
						sagaMiddleware,
				),
		),
);

KeyCache.setStore(store);

sagaMiddleware.run(rootSaga);

// TODO store.dispatch(startLoadCurrentUser());

ReactDOM.render(
		<Provider store={store}>
			<ConnectedRouter history={history}>
				<App/>
			</ConnectedRouter>
		</Provider>,
		document.getElementById("root"),
);
