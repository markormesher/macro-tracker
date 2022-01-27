import React, { FormEvent, InputHTMLAttributes, PureComponent, ReactElement, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";
import { BarcodeScannerBtn } from "../BarcodeScannerBtn/BarcodeScannerBtn";

interface IControlledBarcodeInputProps {
  readonly id: string;
  readonly label: string | ReactElement<void>;
  readonly placeholder?: string;
  readonly value: string | number;
  readonly onValueChange: (newValue: string, id: string) => void;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
}

interface IControlledBarcodeInputState {
  readonly hasBeenTouched: boolean;
}

class ControlledBarcodeInput extends PureComponent<IControlledBarcodeInputProps, IControlledBarcodeInputState> {
  public constructor(props: IControlledBarcodeInputProps) {
    super(props);
    this.state = {
      hasBeenTouched: false,
    };

    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleScan = this.handleScan.bind(this);
  }

  public render(): ReactNode {
    const { id, label, placeholder, value, disabled, error, inputProps } = this.props;
    const { hasBeenTouched } = this.state;
    return (
      <>
        {label && (
          <label htmlFor={id} className={bs.formLabel}>
            {label}
          </label>
        )}
        <div className={bs.inputGroup}>
          <input
            id={id}
            name={id}
            type="barcode"
            onChange={this.handleChange}
            disabled={disabled !== false}
            className={combine(bs.formControl, hasBeenTouched && error && bs.isInvalid)}
            placeholder={placeholder || ""}
            value={value}
            onBlur={this.handleBlur}
            {...inputProps}
          />
          <BarcodeScannerBtn
            onScan={this.handleScan}
            btnProps={{
              className: bs.btnOutlineDark,
            }}
          />
        </div>
        {error && hasBeenTouched && <div className={combine(bs.invalidFeedback, bs.dBlock)}>{error}</div>}
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

  private handleScan(value: string): void {
    this.props.onValueChange(value, this.props.id);
  }
}

export { IControlledBarcodeInputProps, ControlledBarcodeInput };
