import { faBarcodeScan, faPencil, faSearch } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { Link } from "react-router-dom";
import * as bs from "../../global-styles/Bootstrap.scss";
import { combine } from "../../helpers/style-helpers";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { IconBtn } from "../_ui/IconBtn/IconBtn";

class FoodItemEntryChooser extends PureComponent {

	public render(): ReactNode {
		return (
				<ContentWrapper>
					<div className={bs.row}>
						<div className={bs.col}>
							<h1>Create a Food Item</h1>
						</div>
					</div>
					<div className={bs.row}>
						<div className={bs.col}>
							<Link to={"/food-items/from-upc"}>
								<IconBtn
										icon={faBarcodeScan}
										text={"Scan UPC"}
										btnProps={{
											className: combine(bs.btnOutlineDark, bs.mb1),
											style: {
												width: "100%",
											},
										}}
								/>
							</Link>

							<Link to={"/food-items/from-search"}>
								<IconBtn
										icon={faSearch}
										text={"Search"}
										btnProps={{
											className: combine(bs.btnOutlineDark, bs.mb1),
											style: {
												width: "100%",
											},
										}}
								/>
							</Link>

							<Link to={"/food-items/edit"}>
								<IconBtn
										icon={faPencil}
										text={"Enter Manually"}
										btnProps={{
											className: combine(bs.btnOutlineDark, bs.mb1),
											style: {
												width: "100%",
											},
										}}
								/>
							</Link>
						</div>
					</div>
				</ContentWrapper>
		);
	}
}

export {
	FoodItemEntryChooser,
};
