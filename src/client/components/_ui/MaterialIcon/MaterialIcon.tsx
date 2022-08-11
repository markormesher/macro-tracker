import React, { PureComponent, ReactNode } from "react";
import { combine } from "../../../helpers/style-helpers";
import * as style from "./MaterialIcon.scss";

type MaterialIconName = string;

interface IMaterialIconProps {
  readonly icon: MaterialIconName;
  readonly spin?: boolean;
  readonly scale?: number; // TODO: do something with this
  readonly className?: string;
}

class MaterialIcon extends PureComponent<IMaterialIconProps> {
  public render(): ReactNode {
    const { icon, spin, className } = this.props;
    return <span className={combine(style.materialSymbolsOutlined, spin && style.spin, className)}>{icon}</span>;
  }
}

export { IMaterialIconProps, MaterialIconName, MaterialIcon };
