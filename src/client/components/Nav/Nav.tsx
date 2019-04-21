import { faAppleAlt, faCalendarDay, faChartPie, faEllipsisH } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { Link } from "react-router-dom";
import * as style from "./Nav.scss";

class Nav extends PureComponent {

	public render(): ReactNode {
		return (
				<div className={style.nav}>
					<Link to={"/"} className={style.navItem}>
						<FontAwesomeIcon
								icon={faChartPie}
								fixedWidth={true}
						/>
					</Link>
					<Link to={"/diary-entries"} className={style.navItem}>
						<FontAwesomeIcon
								icon={faCalendarDay}
								fixedWidth={true}
						/>
					</Link>
					<Link to={"/food-items"} className={style.navItem}>
						<FontAwesomeIcon
								icon={faAppleAlt}
								fixedWidth={true}
						/>
					</Link>
					<Link to={"/"} className={style.navItem}> {/* TODO */}
						<FontAwesomeIcon
								icon={faEllipsisH}
								fixedWidth={true}
						/>
					</Link>
				</div>
		);
	}
}

export {
	Nav,
};
