import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretUp } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon, Props as FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IRelativeChangeIconProps {
	readonly change: number;
	readonly iconProps?: Partial<FontAwesomeIconProps>;
}

class RelativeChangeIcon extends PureComponent<IRelativeChangeIconProps> {

	public render(): ReactNode {
		const { change, iconProps } = this.props;
		const { className: iconClassName, ...otherIconProps } = { ...iconProps };

		if (change === 0) {
			return null;
		}

		let changeIcon: IconProp;
		let changeClass: string;
		if (change < 0) {
			changeIcon = faCaretDown;
			changeClass = bs.textDanger;
		}
		if (change > 0) {
			changeIcon = faCaretUp;
			changeClass = bs.textSuccess;
		}

		return (
				<FontAwesomeIcon
						icon={changeIcon}
						fixedWidth={true}
						className={combine(changeClass, iconClassName)}
						{...otherIconProps}
				/>
		);
	}
}

export {
	RelativeChangeIcon,
};
