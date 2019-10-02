import React, { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IContentWrapperProps {
  readonly disableBottomPadding?: boolean;
}

class ContentWrapper extends PureComponent<IContentWrapperProps> {
  public render(): ReactNode {
    const { disableBottomPadding } = this.props;

    return (
      <div className={bs.containerFluid}>
        <main role="main">
          <div className={combine(bs.row, bs.pt3)}>
            <div className={combine(bs.col12, bs.colMd10, bs.offsetMd1, !disableBottomPadding && bs.pb2, bs.mb3)}>
              {this.props.children}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export { ContentWrapper };
