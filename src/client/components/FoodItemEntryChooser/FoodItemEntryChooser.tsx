import React, { PureComponent, ReactNode } from "react";
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
          <div className={bs.col6}>
            <Link to={"/food-items/search"}>
              <IconBtn
                icon={"barcode"}
                text={"Search"}
                btnProps={{
                  className: combine(bs.btnOutlineDark, bs.mb1),
                  style: {
                    width: "100%",
                  },
                }}
              />
            </Link>
          </div>
          <div className={bs.col6}>
            <Link to={"/food-items/edit"}>
              <IconBtn
                icon={"edit"}
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

export { FoodItemEntryChooser };
