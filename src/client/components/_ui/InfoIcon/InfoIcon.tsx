import { faInfoCircle } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";

interface IInfoIconPros {
  readonly hoverText: string;
}

class InfoIcon extends PureComponent<IInfoIconPros> {
  public render(): ReactNode {
    const { hoverText } = this.props;
    return (
      <span data-tooltip={hoverText}>
        <FontAwesomeIcon className={bs.textMuted} fixedWidth={true} icon={faInfoCircle} />
      </span>
    );
  }
}

export { InfoIcon };
