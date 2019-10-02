import React, { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

class FormNote extends PureComponent {
  public render(): ReactNode {
    return <span className={combine(bs.formText, bs.textMuted, bs.small)}>{this.props.children}</span>;
  }
}

export { FormNote };
