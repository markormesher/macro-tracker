import { Action } from "redux";

class PayloadAction implements Action<string> {
	public type: string;
	public payload?: { [key: string]: any } = undefined;
}

export {
	PayloadAction,
};
