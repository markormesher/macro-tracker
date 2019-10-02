import * as https from "https";
import axios, { AxiosResponse } from "axios";
import { getDefaultFoodItem, IFoodItem } from "../../commons/models/IFoodItem";
import { INutritionixFoodItem } from "../../commons/models/INutritionixFoodItem";
import { INutritionixKeywordSearchResponse } from "../../commons/models/INutritionixKeywordSearchResponse";
import { INutritionixUpcSearchResponse } from "../../commons/models/INutritionixUpcSearchResponse";
import { isDev } from "../../commons/utils/env";
import { logger } from "../../commons/utils/logging";
import { roundToDp } from "../../commons/utils/utils";
import { getSecret } from "../config/config-loader";

async function getFoodItemsFromNutritionixByUpc(upc: string): Promise<IFoodItem[]> {
  const agent = new https.Agent({
    rejectUnauthorized: !isDev(), // ignore SSL errors in dev mode
  });

  const headers = {
    "x-app-id": getSecret("nutritionix-api.id"),
    "x-app-key": getSecret("nutritionix-api.key"),
    "x-user-id": 0,
  };

  try {
    const foods = await axios
      .get(`https://trackapi.nutritionix.com/v2/search/item?upc=${upc}`, {
        headers,
        httpsAgent: agent,
      })
      .then((res: AxiosResponse<INutritionixUpcSearchResponse>) => {
        logger.debug("Got Nutritionix API response", { data: res.data });
        return res.data.foods;
      });

    return foods.map((f) => {
      logger.debug("Got food item from Nutritionix API", { foodItem: f });
      return mapFoodItemFromNutritionixFoodItem(f, upc);
    });
  } catch (e) {
    if (isDev()) {
      logger.warn("Nutritionix UPC search failed", { error: e });
    }

    return [];
  }
}

async function getFoodItemSuggestionsFromNutritionixByKeyword(keyword: string): Promise<IFoodItem[]> {
  const agent = new https.Agent({
    rejectUnauthorized: !isDev(), // ignore SSL errors in dev mode
  });

  const headers = {
    "x-app-id": getSecret("nutritionix-api.id"),
    "x-app-key": getSecret("nutritionix-api.key"),
    "x-user-id": 0,
  };

  try {
    const foods = await axios
      .get(`https://trackapi.nutritionix.com/v2/search/instant?query=${keyword}&detailed=true`, {
        headers,
        httpsAgent: agent,
      })
      .then((res: AxiosResponse<INutritionixKeywordSearchResponse>) => {
        logger.debug("Got Nutritionix API response", { data: res.data });
        return [...res.data.common, ...res.data.branded];
      });

    return foods.map((f) => {
      logger.debug("Got food item from Nutritionix API", { foodItem: f });
      return mapFoodItemFromNutritionixFoodItem(f);
    });
  } catch (e) {
    if (isDev()) {
      logger.warn("Nutritionix keyword search failed", { error: e });
    }

    return [];
  }
}

function mapFoodItemFromNutritionixFoodItem(nutritionixFoodItem?: INutritionixFoodItem, upc?: string): IFoodItem {
  if (!nutritionixFoodItem) {
    return null;
  }

  let foodItem: IFoodItem = {
    ...getDefaultFoodItem(),
    brand: nutritionixFoodItem.brand_name || "Generic",
    name: nutritionixFoodItem.food_name.replace(/\b[a-z]/g, (c) => c.toUpperCase()),
    upcs: upc ? [upc] : null,
    apiSource: "nutritionix",
    apiId: nutritionixFoodItem.nix_item_id ? nutritionixFoodItem.nix_item_id : nutritionixFoodItem.tag_id,
  };

  // work out what to multiply the per-serving nutrition values by
  let conversionFactor = 0;
  if (nutritionixFoodItem.serving_weight_grams) {
    foodItem = { ...foodItem, measurementUnit: "g" };
    conversionFactor = 100 / nutritionixFoodItem.serving_weight_grams;
  } else if (/ml( .*)?/i.test(nutritionixFoodItem.serving_unit)) {
    foodItem = { ...foodItem, measurementUnit: "ml" };
    conversionFactor = 100 / nutritionixFoodItem.serving_qty;
  } else if (/fl\.? oz( .*)?/i.test(nutritionixFoodItem.serving_unit)) {
    foodItem = { ...foodItem, measurementUnit: "ml" };
    conversionFactor = 100 / (nutritionixFoodItem.serving_qty * 29.57); // 1 fl oz = 29.57 g
  } else if (/g( .*)?/i.test(nutritionixFoodItem.serving_unit)) {
    foodItem = { ...foodItem, measurementUnit: "g" };
    conversionFactor = 100 / nutritionixFoodItem.serving_qty;
  } else if (/oz( .*)?/i.test(nutritionixFoodItem.serving_unit)) {
    foodItem = { ...foodItem, measurementUnit: "g" };
    conversionFactor = 100 / (nutritionixFoodItem.serving_qty * 28.35); // 1 oz = 28.35 g
  } else {
    logger.debug(`Could not handle serving size: ${nutritionixFoodItem.serving_unit}`, { foodItem });
  }

  for (const nutrient of nutritionixFoodItem.full_nutrients) {
    switch (nutrient.attr_id) {
      case 208:
        foodItem = {
          ...foodItem,
          caloriesPerBaseAmount: roundToDp(nutrient.value * conversionFactor, 1),
        };
        break;

      case 204:
        foodItem = {
          ...foodItem,
          fatPerBaseAmount: roundToDp(nutrient.value * conversionFactor, 1),
        };
        break;

      case 606:
        foodItem = {
          ...foodItem,
          satFatPerBaseAmount: roundToDp(nutrient.value * conversionFactor, 1),
        };
        break;

      case 205:
        foodItem = {
          ...foodItem,
          carbohydratePerBaseAmount: roundToDp(nutrient.value * conversionFactor, 1),
        };
        break;

      case 269:
        foodItem = {
          ...foodItem,
          sugarPerBaseAmount: roundToDp(nutrient.value * conversionFactor, 1),
        };
        break;

      case 291:
        foodItem = {
          ...foodItem,
          fibrePerBaseAmount: roundToDp(nutrient.value * conversionFactor, 1),
        };
        break;

      case 203:
        foodItem = {
          ...foodItem,
          proteinPerBaseAmount: roundToDp(nutrient.value * conversionFactor, 1),
        };
        break;

      case 307:
        // value is mg of sodium, so divide because 400mg sodium ~= 1g salt
        foodItem = {
          ...foodItem,
          saltPerBaseAmount: roundToDp((nutrient.value * conversionFactor) / 400, 1),
        };
        break;
    }
  }

  return foodItem;
}

export { getFoodItemsFromNutritionixByUpc, getFoodItemSuggestionsFromNutritionixByKeyword };
