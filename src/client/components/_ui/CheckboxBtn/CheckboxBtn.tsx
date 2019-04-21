import { faCheckSquare, faSquare } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { IconBtn } from "../IconBtn/IconBtn";

interface ICheckboxBtnProps<Payload = {}> {
	readonly text?: string;
	readonly checked?: boolean;
	readonly payload?: Payload;
	readonly onChange?: (checked: boolean, payload?: Payload) => void;
	readonly btnProps?: React.HTMLProps<HTMLButtonElement>;
}

class CheckboxBtn<Payload = {}> extends PureComponent<ICheckboxBtnProps<Payload>> {

	constructor(props: ICheckboxBtnProps<Payload>) {
		super(props);

		this.toggleChecked = this.toggleChecked.bind(this);
	}

	public render(): ReactNode {
		const { text, checked, btnProps } = this.props;
		const icon = checked ? faCheckSquare : faSquare;

		return (
				<IconBtn
						icon={icon}
						text={text}
						btnProps={{
							...btnProps,
							onClick: this.toggleChecked,
						}}
				/>
		);
	}

	private toggleChecked(): void {
		const { checked, onChange, payload } = this.props;
		const newState = !checked;
		if (onChange) {
			if (payload) {
				onChange(newState, payload);
			} else {
				onChange(newState);
			}
		}
	}

}

export {
	CheckboxBtn,
};
