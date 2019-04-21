import * as React from "react";
import { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { combine } from "../../../helpers/style-helpers";

class ContentWrapper extends PureComponent {
	public render(): ReactNode {
		return (
				<div className={bs.containerFluid}>
					<main role="main">
						<div className={combine(bs.row, bs.pt3)}>
							<div className={combine(bs.col12, bs.colMd10, bs.offsetMd1, bs.pb2, bs.mb3)}>
								{this.props.children}
							</div>
						</div>
					</main>
				</div>
		);
	}
}

export {
	ContentWrapper,
};
