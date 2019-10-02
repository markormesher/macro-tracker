import { faExclamationTriangle } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { PureComponent, ReactNode } from "react";
import * as bs from "../../global-styles/Bootstrap.scss";
import { DetailedError } from "../../helpers/errors/DetailedError";
import { combine } from "../../helpers/style-helpers";

interface IErrorPageProps {
  readonly error: DetailedError;
  readonly fullPage?: boolean;
  readonly stacks?: string[];
}

class ErrorPage extends PureComponent<IErrorPageProps> {
  private static renderStackTrace(idx: number, stack: string): ReactNode {
    return (
      <div key={`stack-${idx}`}>
        <h3>Stack #{idx}</h3>
        <pre>{stack}</pre>
      </div>
    );
  }

  public render(): ReactNode {
    const { error, fullPage, stacks } = this.props;

    const errorMessage = error.message || "Something went wrong";
    const errorDisplay = error.display;

    const wrapperClass = fullPage ? combine(bs.container, bs.pt5) : undefined;

    return (
      <div className={wrapperClass}>
        <div className={combine(bs.alert, bs.alertInfo)}>
          {/* The link is intentionally implemented as <a> rather than <Link> to force reloading the page */}
          You might want to try reloading the page, or <a href="/">going back to the homepage</a>.
        </div>

        <h1 className={bs.h2}>
          <FontAwesomeIcon icon={faExclamationTriangle} className={combine(bs.mr2, bs.textMuted)} />
          {errorMessage}
        </h1>

        {typeof errorDisplay === typeof "" ? <p>{errorDisplay}</p> : errorDisplay}

        {stacks && stacks.map((s, i) => ErrorPage.renderStackTrace(i, s))}
      </div>
    );
  }
}

export { ErrorPage };
