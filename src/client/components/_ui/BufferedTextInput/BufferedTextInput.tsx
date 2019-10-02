import React, { Component, ReactElement } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

interface IBufferedTextInputProps {
  readonly delay?: number;
  readonly onValueChange?: (value: string) => void;
  readonly inputProps?: React.HTMLProps<HTMLInputElement>;
}

class BufferedTextInput extends Component<IBufferedTextInputProps> {
  private valueChangeTimeout: NodeJS.Timer = undefined;

  constructor(props: IBufferedTextInputProps) {
    super(props);

    this.handleValueChange = this.handleValueChange.bind(this);
  }

  public render(): ReactElement<void> {
    const { inputProps } = this.props;
    return (
      <input className={combine(bs.formControl, bs.formControlSm)} onKeyUp={this.handleValueChange} {...inputProps} />
    );
  }

  private handleValueChange(event: React.KeyboardEvent): void {
    const { delay, onValueChange } = this.props;
    global.clearTimeout(this.valueChangeTimeout);
    const searchTerm = (event.target as HTMLInputElement).value;
    this.valueChangeTimeout = global.setTimeout(() => onValueChange(searchTerm), delay || 200);
  }
}

export { BufferedTextInput };
