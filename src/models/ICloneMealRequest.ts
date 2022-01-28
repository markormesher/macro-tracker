import { subDays } from "date-fns";
import { Meal } from "../utils/enums";
import { fixedDate } from "../utils/dates";
import { cleanString } from "../utils/strings";
import { IJsonObject } from "./IJsonObject";
import { IValidationResult } from "./IValidationResult";

interface ICloneMealRequest {
  readonly fromDate: Date;
  readonly fromMeal: Meal;
  readonly toDate: Date;
  readonly toMeal: Meal;
}

interface ICloneMealRequestValidationResult extends IValidationResult {
  readonly errors: {
    readonly fromDate?: string;
    readonly fromMeal?: string;
    readonly toDate?: string;
    readonly toMeal?: string;
  };
}

function mapCloneMealRequestFromJson(json?: IJsonObject): ICloneMealRequest {
  if (!json) {
    return null;
  }

  return {
    fromDate: json.fromDate ? fixedDate(cleanString(json.fromDate as string)) : null,
    fromMeal: cleanString(json.fromMeal as string) as Meal,
    toDate: json.toDate ? fixedDate(cleanString(json.toDate as string)) : null,
    toMeal: cleanString(json.toMeal as string) as Meal,
  };
}

function mapCloneMealRequestToJson(cloneMealRequest?: ICloneMealRequest): IJsonObject {
  if (!cloneMealRequest) {
    return null;
  }

  return {
    fromDate: cloneMealRequest.fromDate ? cloneMealRequest.fromDate.toISOString() : null,
    fromMeal: cloneMealRequest.fromMeal,
    toDate: cloneMealRequest.toDate ? cloneMealRequest.toDate.toISOString() : null,
    toMeal: cloneMealRequest.toMeal,
  };
}

function validateCloneMealRequest(cloneMealRequest?: Partial<ICloneMealRequest>): ICloneMealRequestValidationResult {
  if (!cloneMealRequest) {
    return { isValid: false, errors: {} };
  }

  let result: ICloneMealRequestValidationResult = { isValid: true, errors: {} };

  if (!cloneMealRequest.fromDate) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        fromDate: "A date must be selected",
      },
    };
  }

  if (!cloneMealRequest.fromMeal) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        fromMeal: "A meal must be selected",
      },
    };
  }

  if (!cloneMealRequest.toDate) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        toDate: "A date must be selected",
      },
    };
  }

  if (!cloneMealRequest.toMeal) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        toMeal: "A meal must be selected",
      },
    };
  }

  return result;
}

function getDefaultCloneMealRequest(): ICloneMealRequest {
  return {
    fromDate: subDays(fixedDate(), 1),
    fromMeal: undefined,
    toDate: fixedDate(),
    toMeal: undefined,
  };
}

export {
  ICloneMealRequest,
  ICloneMealRequestValidationResult,
  mapCloneMealRequestFromJson,
  mapCloneMealRequestToJson,
  validateCloneMealRequest,
  getDefaultCloneMealRequest,
};
