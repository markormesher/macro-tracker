import { faAngleLeft, faAngleRight } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addDays, endOfDay, isBefore, subDays } from "date-fns";
import React, { PureComponent, ReactNode } from "react";
import { fixedDate } from "../../../utils/dates";
import { formatDate } from "../../../utils/formatters";
import { combine } from "../../helpers/style-helpers";
import * as style from "./DateScroller.scss";

interface IDateScrollerProps {
  readonly currentDate: Date;
  readonly onDateChange: (date: Date) => void;
}

class DateScroller extends PureComponent<IDateScrollerProps> {
  constructor(props: IDateScrollerProps) {
    super(props);

    this.handlePrevBtnClick = this.handlePrevBtnClick.bind(this);
    this.handleNextBtnClick = this.handleNextBtnClick.bind(this);
  }

  public render(): ReactNode {
    const { currentDate } = this.props;

    const now = endOfDay(fixedDate());
    const nextBtnEnabled = isBefore(currentDate, now);

    return (
      <div className={style.wrapper}>
        <div className={style.btn} onClick={this.handlePrevBtnClick}>
          <FontAwesomeIcon icon={faAngleLeft} fixedWidth={true} />
        </div>
        <div className={style.display}>{formatDate(currentDate, "title")}</div>
        <div
          className={combine(style.btn, !nextBtnEnabled && style.disabled)}
          onClick={nextBtnEnabled ? this.handleNextBtnClick : null}
        >
          <FontAwesomeIcon icon={faAngleRight} fixedWidth={true} />
        </div>
      </div>
    );
  }

  private handlePrevBtnClick(): void {
    this.props.onDateChange(subDays(this.props.currentDate, 1));
  }

  private handleNextBtnClick(): void {
    this.props.onDateChange(addDays(this.props.currentDate, 1));
  }
}

export { DateScroller };
