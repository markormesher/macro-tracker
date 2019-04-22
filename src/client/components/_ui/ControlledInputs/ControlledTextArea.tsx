import * as React from "react";
import { FormEvent, InputHTMLAttributes, PureComponent, ReactElement, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IControlledTextAreaProps {
	readonly id: string;
	readonly label: string | ReactElement<void>;
	readonly placeholder?: string;
	readonly value: string | number;
	readonly onValueChange: (newValue: string, id: string) => void;
	readonly disabled?: boolean;
	readonly error?: string;
	readonly inputProps?: Partial<InputHTMLAttributes<HTMLTextAreaElement>>;
}

interface IControlledTextAreaState {
	readonly hasBeenTouched: boolean;
}

class ControlledTextArea extends PureComponent<IControlledTextAreaProps, IControlledTextAreaState> {

	public constructor(props: IControlledTextAreaProps) {
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
					<textarea
							id={id}
							name={id}
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

	private handleChange(event: FormEvent<HTMLTextAreaElement>): void {
		this.props.onValueChange((event.target as HTMLTextAreaElement).value, this.props.id);
	}
}

export {
	ControlledTextArea,
};
