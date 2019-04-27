import { IJsonObject } from "./IJsonObject";

interface IJsonArray extends Array<string | number | boolean | Date | IJsonObject | IJsonArray> {
}

export {
	IJsonArray,
};
