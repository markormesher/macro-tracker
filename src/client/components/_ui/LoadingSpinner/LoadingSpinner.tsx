import { faCircleNotch } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";

interface ILoadingSpinnerProps {
	readonly centre?: boolean;
}

class LoadingSpinner extends PureComponent<ILoadingSpinnerProps> {

	public render(): ReactNode {
		const spinner = (<FontAwesomeIcon icon={faCircleNotch} spin={true} size={"2x"}/>);

		if (this.props.centre) {
			return (
					<div className={bs.textCenter}>
						{spinner}
					</div>
			);
		} else {
			return spinner;
		}
	}
}

export {
	LoadingSpinner,
};
