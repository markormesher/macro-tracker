import { IJsonArray } from "./IJsonArray";

interface IJsonObject {
	readonly [x: string]: string | number | boolean | Date | IJsonObject | IJsonArray;
}

export {
	IJsonObject,
};
