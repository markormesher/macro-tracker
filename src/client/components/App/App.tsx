import * as React from "react";
import { ErrorInfo, PureComponent, ReactElement, ReactNode } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router";
import { IUser } from "../../../commons/models/IUser";
import { DetailedError } from "../../helpers/errors/DetailedError";
import { Http404Error } from "../../helpers/errors/Http404Error";
import { IRootState } from "../../redux/root";
import { FullPageSpinner } from "../_ui/FullPageSpinner/FullPageSpinner";
import { DashboardPage } from "../DashboardPage/DashboardPage";
import { DiaryPage } from "../DiaryPage/DiaryPage";
import { EditDiaryEntryPage } from "../EditDiaryEntryPage/EditDiaryEntryPage";
import { EditExerciseEntryPage } from "../EditExerciseEntryPage/EditExerciseEntryPage";
import { EditFoodItemPage } from "../EditFoodItemPage/EditFoodItemPage";
import { ErrorPage } from "../ErrorPage/ErrorPage";
import { FoodItemEntryChooser } from "../FoodItemEntryChooser/FoodItemEntryChooser";
import { FoodItemsPage } from "../FoodItemsPage/FoodItemsPage";
import { LoginPage } from "../Login/LoginPage";
import { Nav } from "../Nav/Nav";
import { UpcFoodItemSearchPage } from "../UpcFoodItemSearchPage/UpcFoodItemSearchPage";

interface IAppProps {
	readonly waitingFor?: string[];
	readonly globalError?: Error;
	readonly activeUser?: IUser;
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
		activeUser: state.auth.activeUser,
		currentPath: state.router.location.pathname,
	};
}

class UCApp extends PureComponent<IAppProps, IAppState> {

	constructor(props: IAppProps) {
		super(props);
		this.state = {};
		this.render404Error = this.render404Error.bind(this);
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		this.setState({
			caughtError: error,
			caughtErrorInfo: errorInfo,
		});
	}

	public render(): ReactNode {
		const { waitingFor, globalError, activeUser } = this.props;
		const { caughtError, caughtErrorInfo } = this.state;

		if (globalError) {
			return (
					<ErrorPage error={globalError} fullPage={true}/>
			);
		}

		if (caughtError) {
			return (
					<ErrorPage
							error={new DetailedError(caughtError.name, caughtError.message)}
							fullPage={true}
							stacks={[
								caughtError.stack,
								`Component stack:${caughtErrorInfo.componentStack}`,
							]}
					/>
			);
		}

		if (waitingFor.length > 0) {
			return (
					<FullPageSpinner/>
			);
		}

		if (!activeUser) {
			return (
					<Switch>
						<Route exact={true} path="/auth/login" component={LoginPage}/>
						<Redirect to="/auth/login"/>
					</Switch>
			);
		}

		return (
				<>
					<Nav/>
					<Switch>
						<Route exact={true} path="/" component={DashboardPage}/>

						<Route path={"/diary-entries/edit/:diaryEntryId?"} component={EditDiaryEntryPage}/>
						<Route path={"/diary-entries/:date?"} component={DiaryPage}/>
						<Route path={"/diary-entries"} component={DiaryPage}/>

						<Route path={"/exercise-entries/edit/:exerciseEntryId?"} component={EditExerciseEntryPage}/>

						<Route path={"/food-items/entry-chooser"} component={FoodItemEntryChooser}/>
						<Route path={"/food-items/from-upc"} component={UpcFoodItemSearchPage}/>
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
