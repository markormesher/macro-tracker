import { faArrowLeft, faArrowRight } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { Component, ReactElement } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";
import { IconBtn } from "../IconBtn/IconBtn";

interface IPagerBtnsProps {
	// NB: currentPage is 0-indexed
	readonly currentPage: number;
	readonly totalPages: number;
	readonly disabled?: boolean;
	readonly onPageChange?: (page: number) => void;
}

class PagerBtns extends Component<IPagerBtnsProps> {

	constructor(props: IPagerBtnsProps, context: any) {
		super(props, context);

		this.handlePrevClick = this.handlePrevClick.bind(this);
		this.handleNextClick = this.handleNextClick.bind(this);
	}

	public render(): ReactElement<IPagerBtnsProps> {
		const { disabled, currentPage, totalPages } = this.props;

		const btnStyles = combine(bs.btn, bs.btnOutlineDark);

		const prevBtnDisabled = disabled || currentPage === 0;
		const nextBtnDisabled = disabled || currentPage >= totalPages - 1;

		return (
				<div className={combine(bs.btnGroup, bs.btnGroupSm)}>
					<IconBtn
							icon={faArrowLeft}
							onClick={this.handlePrevClick}
							btnProps={{
								className: bs.btnOutlineDark,
								disabled: prevBtnDisabled,
							}}
					/>
					<button className={btnStyles} disabled={true}>
						Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
					</button>
					<IconBtn
							icon={faArrowRight}
							onClick={this.handleNextClick}
							btnProps={{
								className: bs.btnOutlineDark,
								disabled: nextBtnDisabled,
							}}
					/>
				</div>
		);
	}

	private handlePrevClick(): void {
		const { currentPage, onPageChange } = this.props;
		if (currentPage > 0 && onPageChange) {
			onPageChange(currentPage - 1);
		}
	}

	private handleNextClick(): void {
		const { currentPage, totalPages, onPageChange } = this.props;
		if (currentPage < totalPages - 1 && onPageChange) {
			onPageChange(currentPage + 1);
		}
	}
}

export {
	PagerBtns,
};
