import * as React from "react";
import { FormEvent, PureComponent, ReactNode } from "react";

interface IControlledFormProps {
	readonly onSubmit?: () => void;
}

class ControlledForm extends PureComponent<IControlledFormProps> {

	constructor(props: IControlledFormProps) {
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener("keydown", this.handleKeyPress);
	}

	public componentWillUnmount(): void {
		document.removeEventListener("keydown", this.handleKeyPress);
	}

	public render(): ReactNode {
		return (
				<form onSubmit={this.handleSubmit}>
					{this.props.children}
				</form>
		);
	}

	private handleSubmit(event?: FormEvent): void {
		if (event) {
			event.preventDefault();
		}

		if (this.props.onSubmit) {
			this.props.onSubmit();
		}
	}

	private handleKeyPress(evt: KeyboardEvent): void {
		if ((evt.ctrlKey || evt.metaKey) && evt.key === "Enter") {
			this.handleSubmit();
		}
	}
}

export {
	ControlledForm,
};
