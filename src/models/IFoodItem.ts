import { ApiSource, FoodMeasurementUnit } from "../utils/enums";
import { cleanUuid, safeMapEntities } from "../utils/entities";
import { cleanString } from "../utils/strings";
import { IBaseModel } from "./IBaseModel";
import { IDiaryEntry, mapDiaryEntryFromJson, mapDiaryEntryToJson } from "./IDiaryEntry";
import { IJsonArray } from "./IJsonArray";
import { IJsonObject } from "./IJsonObject";
import { IServingSize, mapServingSizeFromJson, mapServingSizeToJson } from "./IServingSize";
import { IValidationResult } from "./IValidationResult";

interface IFoodItem extends IBaseModel {
  readonly brand: string;
  readonly name: string;
  readonly upcs: string[];
  readonly apiSource: ApiSource;
  readonly apiId: string;
  readonly measurementUnit: FoodMeasurementUnit;
  readonly caloriesPerBaseAmount: number;
  readonly fatPerBaseAmount: number;
  readonly satFatPerBaseAmount: number;
  readonly carbohydratePerBaseAmount: number;
  readonly sugarPerBaseAmount: number;
  readonly fibrePerBaseAmount: number;
  readonly proteinPerBaseAmount: number;
  readonly saltPerBaseAmount: number;

  readonly servingSizes: IServingSize[];
  readonly diaryEntries: IDiaryEntry[];
}

interface IFoodItemValidationResult extends IValidationResult {
  readonly errors: IFoodItemValidationResultErrors;
}

// pulled into its own interface to help with validation type safety
interface IFoodItemValidationResultErrors {
  readonly brand?: string;
  readonly name?: string;
  readonly upcs?: string;
  readonly measurementUnit?: string;
  readonly caloriesPerBaseAmount?: string;
  readonly fatPerBaseAmount?: string;
  readonly satFatPerBaseAmount?: string;
  readonly carbohydratePerBaseAmount?: string;
  readonly sugarPerBaseAmount?: string;
  readonly fibrePerBaseAmount?: string;
  readonly proteinPerBaseAmount?: string;
  readonly saltPerBaseAmount?: string;
}

function mapFoodItemFromJson(json?: IJsonObject): IFoodItem {
  if (!json) {
    return null;
  }

  return {
    id: cleanUuid(json.id as string),
    deleted: json.deleted as boolean,
    brand: cleanString(json.brand as string),
    name: cleanString(json.name as string),
    upcs: safeMapEntities(cleanString, json.upcs as string[]),
    apiSource: cleanString(json.apiSource as string) as ApiSource,
    apiId: cleanString(json.apiId as string),
    measurementUnit: cleanString(json.measurementUnit as string) as FoodMeasurementUnit,
    caloriesPerBaseAmount: parseFloat(json.caloriesPerBaseAmount as string),
    fatPerBaseAmount: parseFloat(json.fatPerBaseAmount as string),
    satFatPerBaseAmount: parseFloat(json.satFatPerBaseAmount as string),
    carbohydratePerBaseAmount: parseFloat(json.carbohydratePerBaseAmount as string),
    sugarPerBaseAmount: parseFloat(json.sugarPerBaseAmount as string),
    fibrePerBaseAmount: parseFloat(json.fibrePerBaseAmount as string),
    proteinPerBaseAmount: parseFloat(json.proteinPerBaseAmount as string),
    saltPerBaseAmount: parseFloat(json.saltPerBaseAmount as string),
    servingSizes: safeMapEntities(mapServingSizeFromJson, json.servingSizes as IJsonArray),
    diaryEntries: safeMapEntities(mapDiaryEntryFromJson, json.diaryEntries as IJsonArray),
  };
}

function mapFoodItemToJson(foodItem?: IFoodItem): IJsonObject {
  if (!foodItem) {
    return null;
  }

  return {
    id: foodItem.id,
    deleted: foodItem.deleted,
    brand: foodItem.brand,
    name: foodItem.name,
    upcs: foodItem.upcs,
    apiSource: foodItem.apiSource,
    apiId: foodItem.apiId,
    measurementUnit: foodItem.measurementUnit,
    caloriesPerBaseAmount: foodItem.caloriesPerBaseAmount,
    fatPerBaseAmount: foodItem.fatPerBaseAmount,
    satFatPerBaseAmount: foodItem.satFatPerBaseAmount,
    carbohydratePerBaseAmount: foodItem.carbohydratePerBaseAmount,
    sugarPerBaseAmount: foodItem.sugarPerBaseAmount,
    fibrePerBaseAmount: foodItem.fibrePerBaseAmount,
    proteinPerBaseAmount: foodItem.proteinPerBaseAmount,
    saltPerBaseAmount: foodItem.saltPerBaseAmount,
    servingSizes: safeMapEntities(mapServingSizeToJson, foodItem.servingSizes),
    diaryEntries: safeMapEntities(mapDiaryEntryToJson, foodItem.diaryEntries),
  };
}

function validateFoodItem(foodItem?: Partial<IFoodItem>): IFoodItemValidationResult {
  if (!foodItem) {
    return { isValid: false, errors: {} };
  }

  let result: IFoodItemValidationResult = { isValid: true, errors: {} };

  if (!foodItem.brand || foodItem.brand.trim() === "") {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        brand: "A brand must be entered",
      },
    };
  }

  if (!foodItem.name || foodItem.name.trim() === "") {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        name: "A name must be entered",
      },
    };
  }

  if (foodItem.upcs && foodItem.upcs.some((upc) => !/[0-9]+/.test(upc))) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        upcs: "UPCs must contain numbers only",
      },
    };
  }

  if (!foodItem.measurementUnit) {
    result = {
      isValid: false,
      errors: {
        ...result.errors,
        measurementUnit: "A measurement unit must be entered",
      },
    };
  }

  const nutritionProperties: Array<[string, keyof IFoodItem & keyof IFoodItemValidationResultErrors]> = [
    ["calories", "caloriesPerBaseAmount"],
    ["fat", "fatPerBaseAmount"],
    ["sat. fat", "satFatPerBaseAmount"],
    ["carbohydrates", "carbohydratePerBaseAmount"],
    ["sugar", "sugarPerBaseAmount"],
    ["fibre", "fibrePerBaseAmount"],
    ["protein", "proteinPerBaseAmount"],
    ["salt", "saltPerBaseAmount"],
  ];

  nutritionProperties.forEach((property) => {
    const propertyValue = foodItem[property[1]] as number;

    if (isNaN(propertyValue) || propertyValue === null) {
      result = {
        isValid: false,
        errors: {
          ...result.errors,
          [property[1]]: `The ${property[0]} must be a valid number`,
        },
      };
    } else if (propertyValue < 0) {
      result = {
        isValid: false,
        errors: {
          ...result.errors,
          [property[1]]: `The ${property[0]} must be greater than or equal to zero`,
        },
      };
    }
  });

  return result;
}

function getDefaultFoodItem(): IFoodItem {
  return {
    id: undefined,
    deleted: false,

    brand: null,
    name: null,
    upcs: null,
    apiSource: null,
    apiId: null,
    measurementUnit: "g",
    caloriesPerBaseAmount: 0,
    fatPerBaseAmount: 0,
    satFatPerBaseAmount: 0,
    carbohydratePerBaseAmount: 0,
    sugarPerBaseAmount: 0,
    fibrePerBaseAmount: 0,
    proteinPerBaseAmount: 0,
    saltPerBaseAmount: 0,

    servingSizes: [],
    diaryEntries: [],
  };
}

function foodItemComparator(a: IFoodItem, b: IFoodItem): number {
  if (!a && !b) {
    return 0;
  } else if (!a) {
    return -1;
  } else if (!b) {
    return 1;
  } else {
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare === 0) {
      return a.brand.localeCompare(b.brand);
    } else {
      return nameCompare;
    }
  }
}

export {
  IFoodItem,
  IFoodItemValidationResult,
  mapFoodItemFromJson,
  mapFoodItemToJson,
  validateFoodItem,
  getDefaultFoodItem,
  foodItemComparator,
};
