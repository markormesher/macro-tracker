import { faBarcodeScan, faTimes } from "@fortawesome/pro-light-svg-icons";
import { BrowserBarcodeReader } from "@zxing/library";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";
import { IconBtn } from "../IconBtn/IconBtn";
import * as style from "./BarcodeScannerBtn.scss";

interface IControlledBarcodeInputProps {
	readonly onScan: (newValue: string) => void;
	readonly btnProps?: React.HTMLProps<HTMLButtonElement>;
}

interface IControlledBarcodeInputState {
	readonly scannerOpen: boolean;
}

class BarcodeScannerBtn extends PureComponent<IControlledBarcodeInputProps, IControlledBarcodeInputState> {

	private barcodeReader: BrowserBarcodeReader = null;

	public constructor(props: IControlledBarcodeInputProps) {
		super(props);
		this.state = {
			scannerOpen: false,
		};

		this.renderScanner = this.renderScanner.bind(this);
		this.openScanner = this.openScanner.bind(this);
		this.closeScanner = this.closeScanner.bind(this);
	}

	public render(): ReactNode {
		const { btnProps } = this.props;
		return (
				<>
					{this.renderScanner()}
					<IconBtn
							icon={faBarcodeScan}
							text={"Scan Food"}
							onClick={this.openScanner}
							btnProps={btnProps}
					/>
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
						this.props.onScan(result.getText());
						this.closeScanner();
					})
					.catch(() => {
						this.closeScanner();
					});
		}
	}

	private renderScanner(): ReactNode {
		const { scannerOpen } = this.state;
		if (!scannerOpen) {
			return null;
		}

		return (
				<div className={style.scanner}>
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
		);
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
	BarcodeScannerBtn,
};
