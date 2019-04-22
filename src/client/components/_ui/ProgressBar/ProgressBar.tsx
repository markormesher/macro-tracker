import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { FoodMeasurementUnit } from "../../../../commons/enums";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { formatLargeNumber, formatMeasurement, formatPercent } from "../../../helpers/formatters";
import { combine } from "../../../helpers/style-helpers";

interface IProgressBarProps {
	readonly label?: string;
	readonly value: number;
	readonly total: number;
	readonly unit?: FoodMeasurementUnit;
	readonly showPercent?: boolean;
	readonly wrapperClasses?: string;
	readonly barClasses?: string;
}

class ProgressBar extends PureComponent<IProgressBarProps> {

	public render(): ReactNode {
		const { label, value, total, unit, showPercent, wrapperClasses, barClasses } = this.props;
		const percent = value / total * 100;

		return (
				<div className={combine(bs.progress, wrapperClasses)}>
					<div
							className={combine(bs.progressBar, barClasses)}
							style={{ width: `${percent}%` }}
					>
								<span>
									{label ? `${label}: ` : ""}
									{unit ? formatMeasurement(value, unit) : formatLargeNumber(value)}
									{" / "}
									{unit ? formatMeasurement(total, unit) : formatLargeNumber(total)}
									{showPercent && ` (${formatPercent(percent)})`}
								</span>
					</div>
				</div>
		);
	}
}

export {
	ProgressBar,
};
