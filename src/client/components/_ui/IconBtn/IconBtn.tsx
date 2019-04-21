import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon, Props as FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IIconBtnProps<Payload = {}> {
	readonly icon: IconProp;
	readonly text?: string;
	readonly btnProps?: React.HTMLProps<HTMLButtonElement>;
	readonly iconProps?: Partial<FontAwesomeIconProps>;
	readonly onClick?: (payload?: Payload) => void;
	readonly payload?: Payload;
}

class IconBtn<Payload = {}> extends PureComponent<IIconBtnProps<Payload>> {

	constructor(props: IIconBtnProps<Payload>) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	public render(): ReactNode {
		const { icon, text, btnProps, iconProps } = this.props;
		const { className: btnClassName, ...otherBtnProps } = { ...btnProps };
		return (
				<button
						className={combine(bs.btn, btnClassName)}
						onClick={this.handleClick}
						type={"button"}
						{...otherBtnProps}
				>
					<FontAwesomeIcon icon={icon} fixedWidth={true} className={bs.mr1} {...iconProps}/>
					{text}
				</button>
		);
	}

	private handleClick(): void {
		const { onClick, payload } = this.props;
		if (onClick) {
			if (payload) {
				onClick(payload);
			} else {
				onClick();
			}
		}
	}
}

export {
	IIconBtnProps,
	IconBtn,
};
