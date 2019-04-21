import * as React from "react";
import { DetailedError } from "./DetailedError";

class Http404Error extends DetailedError {

	constructor(path: string) {
		super(
				"Not Found",
				(<p>The path <code>{path}</code> could not be found.</p>),
				404,
		);
	}
}

export {
	Http404Error,
};
