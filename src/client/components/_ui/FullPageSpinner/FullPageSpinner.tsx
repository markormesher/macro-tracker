import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import * as styles from "./FullPageSpinner.scss";

class FullPageSpinner extends PureComponent {

	public render(): ReactNode {
		return (
				<div className={styles.spinnerWrapper}>
					<LoadingSpinner/>
				</div>
		);
	}
}

export {
	FullPageSpinner,
};
