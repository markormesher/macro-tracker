import { faBarcodeScan, faTimes } from "@fortawesome/pro-light-svg-icons";
import { BrowserBarcodeReader } from "@zxing/library";
import * as React from "react";
import { FormEvent, InputHTMLAttributes, PureComponent, ReactElement, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";
import { IconBtn } from "../IconBtn/IconBtn";
import * as style from "./ControlledBarcodeInput.scss";

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
	readonly scannerOpen: boolean;
}

class ControlledBarcodeInput extends PureComponent<IControlledBarcodeInputProps, IControlledBarcodeInputState> {

	private barcodeReader: BrowserBarcodeReader = null;

	public constructor(props: IControlledBarcodeInputProps) {
		super(props);
		this.state = {
			hasBeenTouched: false,
			scannerOpen: false,
		};

		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.openScanner = this.openScanner.bind(this);
		this.closeScanner = this.closeScanner.bind(this);
	}

	public render(): ReactNode {
		const { id, label, placeholder, value, disabled, error, inputProps } = this.props;
		const { hasBeenTouched, scannerOpen } = this.state;
		return (
				<>
					<div className={combine(style.scanner, scannerOpen && style.show)}>
						<div className={style.wrapper}>
							<p className={combine(bs.small, bs.textMuted, bs.mb2)}>
								Frame the barcode within the viewfinder below.
							</p>
							<video id={"barcode-scanner-video"}/>
							<p className={bs.mt2}>
								<IconBtn
										icon={faTimes}
										text={"Cancel"}
										onClick={this.closeScanner}
										btnProps={{
											className: combine(bs.btnOutlineDark, bs.flexGrow0),
										}}
								/>
							</p>
						</div>
					</div>
					{label && <label htmlFor={id}>{label}</label>}
					<div className={bs.dFlex}>
						<input
								id={id}
								name={id}
								type="barcode"
								onChange={this.handleChange}
								disabled={disabled !== false}
								className={combine(bs.flexGrow1, bs.formControl, hasBeenTouched && error && bs.isInvalid)}
								placeholder={placeholder || ""}
								value={value}
								onBlur={this.handleBlur}
								{...inputProps}
						/>
						<IconBtn
								icon={faBarcodeScan}
								text={"Scan"}
								onClick={this.openScanner}
								btnProps={{
									className: combine(bs.btnOutlineDark, bs.flexGrow0, bs.ml1),
								}}
						/>
					</div>
					{error && hasBeenTouched && <div className={bs.invalidFeedback}>{error}</div>}
				</>
		);
	}

	public componentDidUpdate(
			prevProps: Readonly<IControlledBarcodeInputProps>,
			prevState: Readonly<IControlledBarcodeInputState>,
			snapshot?: any,
	): void {
		if (this.state.scannerOpen && !prevState.scannerOpen) {
			this.barcodeReader = new BrowserBarcodeReader();
			this.barcodeReader.decodeFromInputVideoDevice(undefined, "barcode-scanner-video")
					.then((result) => {
						this.props.onValueChange(result.getText(), this.props.id);
						this.closeScanner();
					})
					.catch(() => {
						this.closeScanner();
					});
		}
	}

	public componentWillUnmount(): void {
		if (this.barcodeReader) {
			this.barcodeReader.reset();
		}
	}

	private handleBlur(): void {
		this.setState({
			hasBeenTouched: true,
		});
	}

	private handleChange(event: FormEvent<HTMLInputElement>): void {
		this.props.onValueChange((event.target as HTMLInputElement).value, this.props.id);
	}

	private openScanner(): void {
		this.setState({ scannerOpen: true });
	}

	private closeScanner(): void {
		this.setState({ scannerOpen: false });
		if (this.barcodeReader) {
			this.barcodeReader.reset();
		}
	}
}

export {
	IControlledBarcodeInputProps,
	ControlledBarcodeInput,
};
