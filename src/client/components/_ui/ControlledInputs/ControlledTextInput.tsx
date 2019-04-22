import * as React from "react";
import { FormEvent, InputHTMLAttributes, PureComponent, ReactElement, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IControlledTextInputProps {
	readonly id: string;
	readonly label: string | ReactElement<void>;
	readonly placeholder?: string;
	readonly value: string | number;
	readonly onValueChange: (newValue: string, id: string) => void;
	readonly disabled?: boolean;
	readonly error?: string;
	readonly inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
}

interface IControlledTextInputState {
	readonly hasBeenTouched: boolean;
}

class ControlledTextInput extends PureComponent<IControlledTextInputProps, IControlledTextInputState> {

	public static safeNumericValue(value: number): string | number {
		if (isNaN(value) || value === null) { // isNaN(null) === false for some reason
			return "";
		} else {
			return value;
		}
	}

	public constructor(props: IControlledTextInputProps) {
		super(props);
		this.state = {
			hasBeenTouched: false,
		};

		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	public render(): ReactNode {
		const { id, label, placeholder, value, disabled, error, inputProps } = this.props;
		const { hasBeenTouched } = this.state;
		return (
				<>
					{label && <label htmlFor={id}>{label}</label>}
					<input
							id={id}
							name={id}
							type="text"
							onChange={this.handleChange}
							disabled={disabled !== false}
							className={combine(bs.formControl, hasBeenTouched && error && bs.isInvalid)}
							placeholder={placeholder || ""}
							value={value}
							onBlur={this.handleBlur}
							{...inputProps}
					/>
					{error && hasBeenTouched && <div className={bs.invalidFeedback}>{error}</div>}
				</>
		);
	}

	private handleBlur(): void {
		this.setState({
			hasBeenTouched: true,
		});
	}

	private handleChange(event: FormEvent<HTMLInputElement>): void {
		this.props.onValueChange((event.target as HTMLInputElement).value, this.props.id);
	}
}

export {
	IControlledTextInputProps,
	ControlledTextInput,
};
