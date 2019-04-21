import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faCircleNotch, faSave, faTimes } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { PureComponent, ReactElement, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";
import { IconBtn } from "../IconBtn/IconBtn";
import * as styles from "./Modal.scss";

enum ModalBtnType {
	SAVE = "save",
	CANCEL = "cancel",
	OK = "ok",
}

interface IModalBtn {
	readonly type: ModalBtnType;
	readonly disabled?: boolean;
	readonly onClick?: () => void;
}

interface IModalProps {
	readonly title?: string;
	readonly buttons?: IModalBtn[];
	readonly modalBusy?: boolean;
	readonly onCloseRequest?: () => void;
}

interface IModalState {
	readonly shown?: boolean;
}

class Modal extends PureComponent<IModalProps, IModalState> {

	public static resetLastClose(): void {
		this.lastClose = 0;
	}

	private static lastClose = 0;

	private static shouldAnimateEntrance(): boolean {
		// only animate the entrance if this modal isn't immediately reappearing
		return new Date().getTime() - Modal.lastClose > 10;
	}

	private static renderBtn(btn: IModalBtn): ReactElement<void> {
		let icon: IconProp;
		let label: string;
		let className: string;
		switch (btn.type) {
			case ModalBtnType.SAVE:
				icon = faSave;
				label = "Save";
				className = bs.btnSuccess;
				break;

			case ModalBtnType.CANCEL:
				icon = faTimes;
				label = "Cancel";
				className = bs.btnOutlineDark;
				break;

			case ModalBtnType.OK:
				icon = faCheck;
				label = "OK";
				className = bs.btnPrimary;
				break;
		}
		return (
				<IconBtn
						key={btn.type.toString()}
						icon={icon}
						text={label}
						btnProps={{
							className,
							onClick: btn.onClick,
							disabled: btn.disabled,
						}}
				/>
		);
	}

	private animateDelay: NodeJS.Timer = undefined;

	constructor(props: IModalProps) {
		super(props);
		this.state = {
			shown: !Modal.shouldAnimateEntrance(),
		};
		this.handleKeyDown = this.handleKeyDown.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener("keydown", this.handleKeyDown);
		if (Modal.shouldAnimateEntrance()) {
			this.animateDelay = global.setTimeout(() => this.setState({ shown: true }), 10);
		}
	}

	public componentWillUnmount(): void {
		Modal.lastClose = new Date().getTime();
		document.removeEventListener("keydown", this.handleKeyDown);
		global.clearTimeout(this.animateDelay);
	}

	public render(): ReactNode {
		const { title, buttons, modalBusy, onCloseRequest } = this.props;
		const { shown } = this.state;

		return (
				<>
					<div className={combine(bs.modal, bs.fade, bs.dBlock, shown && bs.show)}>
						<div className={combine(bs.modalDialog, styles.modalDialog)}>
							<div className={bs.modalContent}>
								{
									title
									&& <div className={bs.modalHeader}>
										<h5 className={bs.modalTitle}>{title}</h5>
										<button className={bs.close} onClick={onCloseRequest}>
											<span aria-hidden="true">&times;</span>
										</button>
									</div>
								}
								{
									this.props.children
									&& <div className={bs.modalBody}>
										{this.props.children}
									</div>
								}
								{
									buttons
									&& buttons.length > 0
									&& <div className={combine(bs.modalFooter, styles.modalFooter)}>
										{modalBusy && <FontAwesomeIcon icon={faCircleNotch} spin={true} size={"2x"}/>}
										{!modalBusy && buttons.map(Modal.renderBtn)}
									</div>
								}
							</div>
						</div>
					</div>

					<div className={combine(bs.modalBackdrop, bs.fade, shown && bs.show)}/>
				</>
		);
	}

	private handleKeyDown(evt: KeyboardEvent): void {
		// abort if this event was already cancelled before it reached us
		if (evt.defaultPrevented) {
			return;
		}

		if (evt.key === "Esc" || evt.key === "Escape") {
			if (this.props.onCloseRequest) {
				this.props.onCloseRequest();
			}
		}
	}
}

export {
	IModalProps,
	IModalBtn,
	Modal,
	ModalBtnType,
};
