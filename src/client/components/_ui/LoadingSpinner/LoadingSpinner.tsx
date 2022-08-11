import React, { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { MaterialIcon } from "../MaterialIcon/MaterialIcon";

interface ILoadingSpinnerProps {
  readonly centre?: boolean;
}

class LoadingSpinner extends PureComponent<ILoadingSpinnerProps> {
  public render(): ReactNode {
    const spinner = <MaterialIcon icon={"hourglass_empty"} spin={true} scale={2} />;

    if (this.props.centre) {
      return <div className={bs.textCenter}>{spinner}</div>;
    } else {
      return spinner;
    }
  }
}

export { LoadingSpinner };
