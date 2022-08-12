import React, { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";
import { IMaterialIconProps, MaterialIcon, MaterialIconName } from "../MaterialIcon/MaterialIcon";

interface IIconBtnProps<Payload = unknown> {
  readonly icon: MaterialIconName;
  readonly iconProps?: Partial<IMaterialIconProps>;
  readonly text?: string;
  readonly btnProps?: React.HTMLProps<HTMLButtonElement>;
  readonly onClick?: (payload?: Payload) => void;
  readonly payload?: Payload;
}

class IconBtn<Payload = unknown> extends PureComponent<IIconBtnProps<Payload>> {
  constructor(props: IIconBtnProps<Payload>) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  public render(): ReactNode {
    const { icon, text, btnProps, iconProps } = this.props;
    const { className: btnClassName, ...otherBtnProps } = { ...btnProps };
    const iconClassName = combine(!!text && bs.me1, iconProps?.className);
    return (
      <button className={combine(bs.btn, btnClassName)} onClick={this.handleClick} type={"button"} {...otherBtnProps}>
        <MaterialIcon {...iconProps} icon={icon} className={iconClassName} />
        {text}
      </button>
    );
  }

  private handleClick(): void {
    const { onClick, payload } = this.props;
    if (onClick) {
      onClick(payload);
    }
  }
}

export { IIconBtnProps, IconBtn };
