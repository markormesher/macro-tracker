import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { connect } from "react-redux";
import { IRootState } from "../../redux/root";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";

interface IDashboardPageProps {
	// TODO
}

function mapStateToProps(state: IRootState, props: IDashboardPageProps): IDashboardPageProps {
	return {
		...props,
	};
}

class UCDashboardPage extends PureComponent<IDashboardPageProps> {

	constructor(props: IDashboardPageProps, context: any) {
		super(props, context);
	}

	public render(): ReactNode {
		return (
				<ContentWrapper>
					<p>TODO: dashboard</p>
				</ContentWrapper>
		);
	}
}

export const DashboardPage = connect(mapStateToProps)(UCDashboardPage);
