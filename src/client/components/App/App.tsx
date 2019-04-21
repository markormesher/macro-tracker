import * as React from "react";
import { ErrorInfo, PureComponent, ReactElement, ReactNode } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import { Http404Error } from "../../helpers/errors/Http404Error";
import { IRootState } from "../../redux/root";
import { DashboardPage } from "../DashboardPage/DashboardPage";
import { DiaryPage } from "../DiaryPage/DiaryPage";
import { EditDiaryEntryPage } from "../EditDiaryEntryPage/EditDiaryEntryPage";
import { EditFoodItemPage } from "../EditFoodItemPage/EditFoodItemPage";
import { ErrorPage } from "../ErrorPage/ErrorPage";
import { FoodItemsPage } from "../FoodItemsPage/FoodItemsPage";
import { Nav } from "../Nav/Nav";

interface IAppProps {
	readonly waitingFor?: string[];
	readonly globalError?: Error;
	readonly currentPath?: string;
}

interface IAppState {
	readonly caughtError?: Error;
	readonly caughtErrorInfo?: ErrorInfo;
}

function mapStateToProps(state: IRootState, props: IAppProps): IAppProps {
	return {
		...props,
		waitingFor: state.global.waitingFor,
		globalError: state.global.error,
		currentPath: state.router.location.pathname,
	};
}

class UCApp extends PureComponent<IAppProps, IAppState> {

	constructor(props: IAppProps, context: any) {
		super(props, context);

		this.render404Error = this.render404Error.bind(this);
	}

	public render(): ReactNode {
		return (
				<>
					<Nav/>
					<Switch>
						<Route exact={true} path="/" component={DashboardPage}/>

						<Route path={"/diary-entries/edit/:diaryEntryId?"} component={EditDiaryEntryPage}/>
						<Route path={"/diary-entries"} component={DiaryPage}/>

						<Route path={"/food-items/edit/:foodItemId?"} component={EditFoodItemPage}/>
						<Route path={"/food-items"} component={FoodItemsPage}/>

						{/* Adding a new route? Keep it above this one! */}
						<Route render={this.render404Error}/>
					</Switch>
				</>
		);
	}

	private render404Error(): ReactElement<void> {
		const { currentPath } = this.props;
		const error = new Http404Error(currentPath);
		return (
				<ErrorPage error={error}/>
		);
	}

}

export const App = connect(mapStateToProps)(UCApp);
