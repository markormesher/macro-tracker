import * as React from "react";
import { PureComponent, ReactNode } from "react";
import * as bs from "../../../global-styles/Bootstrap.scss";
import { BufferedTextInput } from "../BufferedTextInput/BufferedTextInput";
import { PagerBtns } from "../PagerBtns/PagerBtns";
import * as styles from "./DataTable.scss";

interface IDataTableOuterHeaderProps {
	readonly loading: boolean;
	readonly currentPage: number;
	readonly pageSize: number;
	readonly rowCount: number;
	readonly onPageChange?: (page: number) => void;
	readonly onSearchTermChange?: (term: string) => void;
}

class DataTableOuterHeader<Model> extends PureComponent<IDataTableOuterHeaderProps> {

	public render(): ReactNode {
		const { pageSize, loading, currentPage, rowCount } = this.props;
		const totalPages = rowCount === 0 ? 0 : Math.ceil(rowCount / pageSize);

		return (
				<div className={styles.tableHeader}>
					<div className={bs.floatLeft}>
						<PagerBtns
								disabled={loading}
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={this.props.onPageChange}
						/>
					</div>
					<div className={bs.floatRight}>
						<BufferedTextInput
								inputProps={{
									placeholder: "Search",
								}}
								onValueChange={this.props.onSearchTermChange}
						/>
					</div>
				</div>
		);
	}
}

export {
	DataTableOuterHeader,
};
