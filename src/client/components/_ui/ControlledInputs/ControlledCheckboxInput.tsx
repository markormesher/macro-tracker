import * as React from "react";
import { FormEvent, InputHTMLAttributes, PureComponent, ReactElement, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IControlledCheckboxInputProps {
	readonly id: string;
	readonly label: string | ReactElement<void>;
	readonly checked: boolean;
	readonly onCheckedChange: (newValue: boolean, id: string) => void;
	readonly disabled?: boolean;
	readonly error?: string;
	readonly inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
}

interface IControlledCheckboxInputState {
	readonly hasBeenTouched: boolean;
}

class ControlledCheckboxInput extends PureComponent<IControlledCheckboxInputProps, IControlledCheckboxInputState> {

	public constructor(props: IControlledCheckboxInputProps) {
		super(props);
		this.state = {
			hasBeenTouched: false,
		};

		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	public render(): ReactNode {
		const { id, label, checked, disabled, error, inputProps } = this.props;
		const { hasBeenTouched } = this.state;
		return (
				<div className={combine(bs.formCheck, bs.formCheckInline)}>
					<input
							id={id}
							type="checkbox"
							checked={checked}
							className={combine(bs.formCheckInput, hasBeenTouched && error && bs.isInvalid)}
							disabled={disabled !== false}
							onChange={this.handleChange}
							onBlur={this.handleBlur}
							{...inputProps}
					/>
					<label className={bs.formCheckLabel} htmlFor={id}>{label}</label>
					{error && hasBeenTouched && <div className={bs.invalidFeedback}>{error}</div>}
				</div>
		);
	}

	private handleBlur(): void {
		this.setState({
			hasBeenTouched: true,
		});
	}

	private handleChange(event: FormEvent<HTMLInputElement>): void {
		this.props.onCheckedChange((event.target as HTMLInputElement).checked, this.props.id);
	}
}

export {
	ControlledCheckboxInput,
};
