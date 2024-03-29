import React, { ErrorInfo, PureComponent, ReactElement, ReactNode } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import { IUser } from "../../../models/IUser";
import { DetailedError } from "../../helpers/errors/DetailedError";
import { Http404Error } from "../../helpers/errors/Http404Error";
import { IRootState } from "../../redux/root";
import { FullPageSpinner } from "../_ui/FullPageSpinner/FullPageSpinner";
import { CloneMealPage } from "../CloneMealPage/CloneMealPage";
import { DashboardPage } from "../DashboardPage/DashboardPage";
import { DiaryPage } from "../DiaryPage/DiaryPage";
import { EditDiaryEntryPage } from "../EditDiaryEntryPage/EditDiaryEntryPage";
import { EditExerciseEntryPage } from "../EditExerciseEntryPage/EditExerciseEntryPage";
import { EditFoodItemPage } from "../EditFoodItemPage/EditFoodItemPage";
import { EditTargetPage } from "../EditTargetPage/EditTargetPage";
import { ErrorPage } from "../ErrorPage/ErrorPage";
import { FoodItemEntryChooser } from "../FoodItemEntryChooser/FoodItemEntryChooser";
import { FoodItemSearchPage } from "../FoodItemSearchPage/FoodItemSearchPage";
import { FoodItemsPage } from "../FoodItemsPage/FoodItemsPage";
import { MealSketchPage } from "../MealSketchPage/MealSketchPage";
import { Nav } from "../Nav/Nav";
import { TargetsPage } from "../TargetsPage/TargetsPage";
import * as style from "./App.scss";

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
    const { waitingFor, globalError } = this.props;
    const { caughtError, caughtErrorInfo } = this.state;

    if (globalError) {
      return <ErrorPage error={globalError} fullPage={true} />;
    }

    if (caughtError) {
      return (
        <ErrorPage
          error={new DetailedError(caughtError.name, caughtError.message)}
          fullPage={true}
          stacks={[caughtError.stack, `Component stack:${caughtErrorInfo.componentStack}`]}
        />
      );
    }

    if (waitingFor.length > 0) {
      return <FullPageSpinner />;
    }

    return (
      <>
        <div className={style.navWrapper}>
          <Nav />
        </div>
        <div className={style.bodyWrapper}>
          <Switch>
            <Route exact={true} path="/" component={DashboardPage} />

            <Route path={"/clone-meal"} component={CloneMealPage} />

            <Route path={"/diary-entries/edit/:diaryEntryId?"} component={EditDiaryEntryPage} />
            <Route path={"/diary-entries/:date?"} component={DiaryPage} />
            <Route path={"/diary-entries"} component={DiaryPage} />

            <Route path={"/exercise-entries/edit/:exerciseEntryId?"} component={EditExerciseEntryPage} />

            <Route path={"/food-items/entry-chooser"} component={FoodItemEntryChooser} />
            <Route path={"/food-items/search"} component={FoodItemSearchPage} />
            <Route path={"/food-items/edit/:foodItemId?"} component={EditFoodItemPage} />
            <Route path={"/food-items"} component={FoodItemsPage} />

            <Route path={"/meal-sketch"} component={MealSketchPage} />

            <Route path={"/targets/edit/:targetId?"} component={EditTargetPage} />
            <Route path={"/targets"} component={TargetsPage} />

            {/* Adding a new route? Keep it above this one! */}
            <Route render={this.render404Error} />
          </Switch>
        </div>
      </>
    );
  }

  private render404Error(): ReactElement<void> {
    const { currentPath } = this.props;
    const error = new Http404Error(currentPath);
    return <ErrorPage error={error} />;
  }
}

export const App = connect(mapStateToProps)(UCApp);
