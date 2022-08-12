import React, { PureComponent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { MaterialIcon } from "../_ui/MaterialIcon/MaterialIcon";
import * as style from "./Nav.scss";

class Nav extends PureComponent {
  public render(): ReactNode {
    return (
      <div className={style.nav}>
        <Link to={"/"} className={style.navItem}>
          <MaterialIcon icon={"pie_chart"} />
        </Link>
        <Link to={"/diary-entries"} className={style.navItem}>
          <MaterialIcon icon={"today"} />
        </Link>
        <Link to={"/food-items"} className={style.navItem}>
          <MaterialIcon icon={"lunch_dining"} />
        </Link>
        <Link to={"/meal-sketch"} className={style.navItem}>
          <MaterialIcon icon={"architecture"} />
        </Link>
        <Link to={"/targets"} className={style.navItem}>
          <MaterialIcon icon={"sports_score"} />
        </Link>
      </div>
    );
  }
}

export { Nav };
