import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { FoodMeasurementUnit } from "../../../../commons/enums";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { formatLargeNumber, formatMeasurement } from "../../../helpers/formatters";
import { combine } from "../../../helpers/style-helpers";

interface IProgressBarProps {
	readonly label?: string;
	readonly value: number;
	readonly total: number;
	readonly unit?: FoodMeasurementUnit;
	readonly wrapperClasses?: string;
	readonly barClasses?: string;
}

class ProgressBar extends PureComponent<IProgressBarProps> {

	public render(): ReactNode {
		const { label, value, total, unit, wrapperClasses, barClasses } = this.props;

		return (
				<div className={combine(bs.progress, wrapperClasses)}>
					<div
							className={combine(bs.progressBar, barClasses)}
							style={{ width: `${value / total * 100}%` }}
					>
								<span>
									{label ? `${label}: ` : ""}
									{unit ? formatMeasurement(value, unit) : formatLargeNumber(value)}
									{" / "}
									{unit ? formatMeasurement(total, unit) : formatLargeNumber(total)}
								</span>
					</div>
				</div>
		);
	}
}

export {
	ProgressBar,
};
