import { faCalendar } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { DateModeOption } from "../../../../commons/models/ITransaction";
import { capitaliseFirstLetter } from "../../../helpers/formatters";
import { IconBtn } from "../IconBtn/IconBtn";

interface IDateModeToggleBtnProps {
	readonly value?: DateModeOption;
	readonly onChange?: (value: DateModeOption) => void;
	readonly btnProps?: React.HTMLProps<HTMLButtonElement>;
}

class DateModeToggleBtn extends PureComponent<IDateModeToggleBtnProps> {

	constructor(props: IDateModeToggleBtnProps) {
		super(props);

		this.toggleValue = this.toggleValue.bind(this);
	}

	public render(): ReactNode {
		const { value, btnProps } = this.props;
		const text = `Date Mode: ${capitaliseFirstLetter(value)} Date`;

		return (
				<IconBtn
						icon={faCalendar}
						text={text}
						btnProps={{
							...btnProps,
							onClick: this.toggleValue,
						}}
				/>
		);
	}

	private toggleValue(): void {
		const { value, onChange } = this.props;
		const newValue = value === "effective" ? "transaction" : "effective";
		if (onChange) {
			onChange(newValue);
		}
	}

}

export {
	DateModeToggleBtn,
};
