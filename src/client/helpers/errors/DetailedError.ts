import { ReactNode } from "react";

export class DetailedError extends Error {

	public readonly display?: string | ReactNode;
	public readonly httpStatus?: number;

	constructor(message?: string, display?: string | ReactNode, httpStatus?: number) {
		super(message);
		this.display = display;
		this.httpStatus = httpStatus;
	}
}
