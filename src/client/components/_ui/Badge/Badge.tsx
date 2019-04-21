import * as React from "react";
import { Component, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IBadgeProps {
	readonly className?: string;
	readonly marginLeft?: boolean;
	readonly marginRight?: boolean;
}

class Badge extends Component<IBadgeProps> {

	public render(): ReactNode {
		const { className, marginRight, marginLeft } = this.props;
		const classes = combine(bs.badge, className || bs.badgeLight, marginRight && bs.mr1, marginLeft && bs.ml1);
		return (
				<span className={classes}>
					{this.props.children}
				</span>
		);
	}
}

export {
	Badge,
};
