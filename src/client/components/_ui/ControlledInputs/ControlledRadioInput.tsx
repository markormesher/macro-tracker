import * as React from "react";
import { FormEvent, InputHTMLAttributes, PureComponent, ReactElement, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IControlledRadioInputProps {
	readonly id: string;
	readonly name: string;
	readonly value: string;
	readonly label: string | ReactElement<void>;
	readonly checked: boolean;
	readonly onValueChange: (newValue: string, id: string) => void;
	readonly disabled?: boolean;
	readonly error?: string;
	readonly inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
}

interface IControlledRadioInputState {
	readonly hasBeenTouched: boolean;
}

class ControlledRadioInput extends PureComponent<IControlledRadioInputProps, IControlledRadioInputState> {

	public constructor(props: IControlledRadioInputProps) {
		super(props);
		this.state = {
			hasBeenTouched: false,
		};

		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	public render(): ReactNode {
		const { id, name, value, label, checked, disabled, error, inputProps } = this.props;
		const { hasBeenTouched } = this.state;
		return (
				<div className={combine(bs.formCheck, bs.formCheckInline)}>
					<input
							id={id}
							name={name}
							value={value}
							type="radio"
							checked={checked}
							className={combine(bs.formCheckInput, hasBeenTouched && error && bs.isInvalid)}
							disabled={disabled === true}
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
		if ((event.target as HTMLInputElement).checked) {
			this.props.onValueChange((event.target as HTMLInputElement).value, this.props.id);
		}
	}
}

export {
	ControlledRadioInput,
};
