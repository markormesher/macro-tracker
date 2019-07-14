import * as React from "react";
import { FormEvent, PureComponent, ReactElement, ReactNode, SelectHTMLAttributes } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IControlledSelectInputProps {
	readonly id: string;
	readonly label: string | ReactElement<void>;
	readonly value: string | number;
	readonly onValueChange?: (newValue: string, id: string) => void;
	readonly disabled?: boolean;
	readonly error?: string;
	readonly selectProps?: Partial<SelectHTMLAttributes<HTMLSelectElement>>;
}

interface IControlledSelectInputState {
	readonly hasBeenTouched: boolean;
}

class ControlledSelectInput extends PureComponent<IControlledSelectInputProps, IControlledSelectInputState> {

	public constructor(props: IControlledSelectInputProps) {
		super(props);
		this.state = {
			hasBeenTouched: false,
		};

		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	public render(): ReactNode {
		const { id, label, value, disabled, error, selectProps } = this.props;
		const { hasBeenTouched } = this.state;
		return (
				<>
					{label && <label htmlFor={id}>{label}</label>}
					<select
							id={id}
							name={id}
							onChange={this.handleChange}
							disabled={disabled !== false}
							className={combine(bs.formControl, hasBeenTouched && error && bs.isInvalid)}
							value={value}
							onBlur={this.handleBlur}
							{...selectProps}
					>
						{this.props.children}
					</select>
					{error && hasBeenTouched && <div className={bs.invalidFeedback}>{error}</div>}
				</>
		);
	}

	private handleBlur(): void {
		this.setState({
			hasBeenTouched: true,
		});
	}

	private handleChange(event: FormEvent<HTMLSelectElement>): void {
		if (this.props.onValueChange) {
			this.props.onValueChange((event.target as HTMLSelectElement).value, this.props.id);
		}
	}
}

export {
	IControlledSelectInputProps,
	ControlledSelectInput,
};
