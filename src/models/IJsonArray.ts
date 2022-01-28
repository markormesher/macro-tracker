import { IJsonObject } from "./IJsonObject";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IJsonArray extends Array<string | number | boolean | Date | IJsonObject | IJsonArray> {}

export { IJsonArray };
