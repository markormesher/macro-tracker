import { endOfDay, isAfter } from "date-fns";
import { Meal } from "../enums";
import { fixedDate } from "../utils/dates";
import { cleanUuid } from "../utils/entities";
import { cleanString } from "../utils/strings";
import { IBaseModel } from "./IBaseModel";
import { IFoodItem, mapFoodItemFromJson, mapFoodItemToJson } from "./IFoodItem";
import { IJsonObject } from "./IJsonObject";
import { IServingSize, mapServingSizeFromJson, mapServingSizeToJson } from "./IServingSize";
import { IValidationResult } from "./IValidationResult";

interface IDiaryEntry extends IBaseModel {
  readonly date: Date;
  readonly meal: Meal;
  readonly servingQty: number;

  readonly foodItem: IFoodItem;
  readonly servingSize: IServingSize;
}

interface IDiaryEntryValidationResult extends IValidationResult {
  readonly errors: {
    readonly date?: string;
    readonly meal?: string;
    readonly servingQty?: string;
    readonly foodItem?: string;
    readonly servingSize?: string;
  };
}

function mapDiaryEntryFromJson(json?: IJsonObject): IDiaryEntry {
  if (!json) {
    return null;
  }

  return {
    id: cleanUuid(json.id as string),
    deleted: json.deleted as boolean,
    date: json.date ? fixedDate(cleanString(json.date as string)) : null,
    meal: cleanString(json.meal as string) as Meal,
    servingQty: parseFloat(json.servingQty as string),
    foodItem: mapFoodItemFromJson(json.foodItem as IJsonObject),
    servingSize: mapServingSizeFromJson(json.servingSize as IJsonObject),
  };
}

function mapDiaryEntryToJson(diaryEntry?: IDiaryEntry): IJsonObject {
  if (!diaryEntry) {
    return null;
  }

  return {
    id: diaryEntry.id,
    deleted: diaryEntry.deleted,
    date: diaryEntry.date ? diaryEntry.date.toISOString() : null,
    meal: diaryEntry.meal,
    servingQty: diaryEntry.servingQty,
    foodItem: mapFoodItemToJson(diaryEntry.foodItem),
    servingSize: mapServingSizeToJson(diaryEntry.servingSize),
  };
}

function validateDiaryEntry(diaryEntry?: Partial<IDiaryEntry>): IDiaryEntryValidationResult {
  if (!diaryEntry) {
    return { isValid: false, errors: {} };
  }

  let result: IDiaryEntryValidationResult = { isValid: true, errors: {} };

  const now = endOfDay(fixedDate());
  if (!diaryEntry.date) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        date: "A date must be selected",
      },
    };
  } else if (isAfter(diaryEntry.date, now)) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        date: "The date must not be in the future",
      },
    };
  }

  if (!diaryEntry.meal) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        meal: "A meal must be selected",
      },
    };
  }

  if (!diaryEntry.servingQty && diaryEntry.servingQty !== 0) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        servingQty: "The serving quantity must be entered",
      },
    };
  } else if (isNaN(diaryEntry.servingQty)) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        servingQty: "The serving quantity must be numeric",
      },
    };
  } else if (diaryEntry.servingQty <= 0) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        servingQty: "The serving quantity must greater than zero",
      },
    };
  }

  if (!diaryEntry.foodItem) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        foodItem: "A food item must be selected",
      },
    };
  }

  // note: serving size can be null

  return result;
}

function getDefaultDiaryEntry(): IDiaryEntry {
  return {
    id: undefined,
    deleted: false,

    date: fixedDate(),
    meal: undefined,
    servingQty: 1,

    foodItem: undefined,
    servingSize: undefined,
  };
}

export {
  IDiaryEntry,
  IDiaryEntryValidationResult,
  mapDiaryEntryFromJson,
  mapDiaryEntryToJson,
  validateDiaryEntry,
  getDefaultDiaryEntry,
};
