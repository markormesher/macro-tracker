import * as https from "https";
import axios, { AxiosResponse } from "axios";
import { getDefaultFoodItem, IFoodItem } from "../models/IFoodItem";
import { ITescoProduct } from "../models/ITescoProduct";
import { ITescoUpcSearchResponse } from "../models/ITescoUpcSearchResponse";
import { isDev } from "../utils/env";
import { logger } from "../utils/logging";
import { getFileConfig, getEnvConfig } from "../config/config-loader";

async function getFoodItemsFromTescoByUpc(upc: string): Promise<IFoodItem[]> {
  const agent = new https.Agent({
    rejectUnauthorized: !isDev(), // ignore SSL errors in dev mode
  });

  const headers = {
    "Ocp-Apim-Subscription-Key": getFileConfig(getEnvConfig("TESCO_API_SECRET_FILE")),
  };

  try {
    const products = await axios
      .get(`https://dev.tescolabs.com/product/?gtin=${upc}`, {
        headers,
        httpsAgent: agent,
      })
      .then((res: AxiosResponse<ITescoUpcSearchResponse>) => {
        logger.debug("Got Tesco API response", { data: res.data });
        return res.data.products;
      });

    return products.map((p) => {
      logger.debug("Got product from Tesco API", { product: p });
      return mapFoodItemFromTescoApi(p, upc);
    });
  } catch (e) {
    if (isDev()) {
      logger.warn("Tesco UPC search failed", { error: e });
    }

    return [];
  }
}

function mapFoodItemFromTescoApi(product?: ITescoProduct, upc?: string): IFoodItem {
  if (!product) {
    return null;
  }

  const cleanBrand = product.brand === "TESCO" ? "Tesco" : product.brand;
  const cleanDescription = product.description.replace(/( ?)tesco( ?)/i, "").replace(/( ?)([0-9]+)(ml|g)( ?)/i, "");

  let foodItem: IFoodItem = {
    ...getDefaultFoodItem(),
    brand: cleanBrand,
    name: cleanDescription,
    upcs: upc ? [upc] : null,
    apiSource: "tesco",
  };

  if (product.calcNutrition) {
    // work out the measurement unit
    if (product.calcNutrition.per100Header) {
      if (product.calcNutrition.per100Header.indexOf("g") >= 0) {
        foodItem = { ...foodItem, measurementUnit: "g" };
      } else if (product.calcNutrition.per100Header.indexOf("g") >= 0) {
        foodItem = { ...foodItem, measurementUnit: "ml" };
      } else {
        logger.debug(`Could not handle per-100 header: ${product.calcNutrition.per100Header}`, { product });
      }
    }

    // work out nutrition components
    if (product.calcNutrition.calcNutrients) {
      for (const nutrient of product.calcNutrition.calcNutrients) {
        if (!nutrient.name || !nutrient.valuePer100) {
          continue;
        }

        if (nutrient.name.indexOf("kcal") >= 0) {
          foodItem = {
            ...foodItem,
            caloriesPerBaseAmount: parseFloat(nutrient.valuePer100),
          };
        } else if (nutrient.name.indexOf("Fat") >= 0) {
          foodItem = {
            ...foodItem,
            fatPerBaseAmount: parseFloat(nutrient.valuePer100),
          };
        } else if (nutrient.name.indexOf("Saturates") >= 0) {
          foodItem = {
            ...foodItem,
            satFatPerBaseAmount: parseFloat(nutrient.valuePer100),
          };
        } else if (nutrient.name.indexOf("Carbohydrate") >= 0) {
          foodItem = {
            ...foodItem,
            carbohydratePerBaseAmount: parseFloat(nutrient.valuePer100),
          };
        } else if (nutrient.name.indexOf("Sugars") >= 0) {
          foodItem = {
            ...foodItem,
            sugarPerBaseAmount: parseFloat(nutrient.valuePer100),
          };
        } else if (nutrient.name.indexOf("Fibre") >= 0) {
          foodItem = {
            ...foodItem,
            fibrePerBaseAmount: parseFloat(nutrient.valuePer100),
          };
        } else if (nutrient.name.indexOf("Protein") >= 0) {
          foodItem = {
            ...foodItem,
            proteinPerBaseAmount: parseFloat(nutrient.valuePer100),
          };
        } else if (nutrient.name.indexOf("Salt") >= 0) {
          foodItem = {
            ...foodItem,
            saltPerBaseAmount: parseFloat(nutrient.valuePer100),
          };
        }
      }
    }
  } else {
    logger.debug(`Product did not have nutrition data`, { product });
  }

  return foodItem;
}

export { getFoodItemsFromTescoByUpc };
