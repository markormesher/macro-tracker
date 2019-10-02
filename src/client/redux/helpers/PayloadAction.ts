import { Action } from "redux";

class PayloadAction implements Action<string> {
  public readonly type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly payload?: { readonly [key: string]: any } = undefined;
}

export { PayloadAction };
