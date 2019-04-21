import { faAngleLeft, faAngleRight } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Moment from "moment";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { formatDate } from "../../helpers/formatters";
import { combine } from "../../helpers/style-helpers";
import * as style from "./DateScroller.scss";

interface IDateScrollerProps {
	readonly currentDate: Moment.Moment;
	readonly onDateChange: (date: Moment.Moment) => void;
}

class DateScroller extends PureComponent<IDateScrollerProps> {

	constructor(props: IDateScrollerProps, context: any) {
		super(props, context);

		this.handlePrevBtnClick = this.handlePrevBtnClick.bind(this);
		this.handleNextBtnClick = this.handleNextBtnClick.bind(this);
	}

	public render(): ReactNode {
		const { currentDate } = this.props;

		const now = Moment();
		const nextBtnEnabled = currentDate.isBefore(now, "day");

		return (
				<div className={style.wrapper}>
					<div
							className={style.btn}
							onClick={this.handlePrevBtnClick}
					>
						<FontAwesomeIcon
								icon={faAngleLeft}
								fixedWidth={true}
						/>
					</div>
					<div className={style.display}>
						{formatDate(currentDate, "title")}
					</div>
					<div
							className={combine(style.btn, !nextBtnEnabled && style.disabled)}
							onClick={nextBtnEnabled ? this.handleNextBtnClick : null}
					>
						<FontAwesomeIcon
								icon={faAngleRight}
								fixedWidth={true}
						/>
					</div>
				</div>
		);
	}

	private handlePrevBtnClick(): void {
		this.props.onDateChange(this.props.currentDate.clone().subtract(1, "day"));
	}

	private handleNextBtnClick(): void {
		this.props.onDateChange(this.props.currentDate.clone().add(1, "day"));
	}
}

export {
	DateScroller,
};
