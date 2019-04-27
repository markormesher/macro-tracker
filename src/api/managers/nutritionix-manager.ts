import axios, { AxiosResponse } from "axios";
import * as https from "https";
import { FoodMeasurementUnit } from "../../commons/enums";
import { getDefaultFoodItem, IFoodItem } from "../../commons/models/IFoodItem";
import { INutritionixFoodItem } from "../../commons/models/INutritionixFoodItem";
import { INutritionixItemSearchResponse } from "../../commons/models/INutritionixUpcSearchResponse";
import { isDev } from "../../commons/utils/env";
import { logger } from "../../commons/utils/logging";
import { roundToDp } from "../../commons/utils/utils";
import { getSecret } from "../config/config-loader";

async function getFoodItemsFromNutritionixByUpc(upc: string): Promise<IFoodItem[]> {
	const agent = new https.Agent({
		rejectUnauthorized: !isDev(), // ignore SSL errors in dev mode
	});

	const headers = {
		"x-app-id": getSecret("nutritionix.app.id"),
		"x-app-key": getSecret("nutritionix.app.key"),
		"x-user-id": 0,
	};

	try {
		const foods = await axios
				.get(`https://trackapi.nutritionix.com/v2/search/item?upc=${upc}`, { headers, httpsAgent: agent })
				.then((res: AxiosResponse<INutritionixItemSearchResponse>) => res.data.foods);

		return foods.map((f) => {
			logger.debug("Got food item from Nutritionix API", { foodItem: f });
			return mapFoodItemFromNutritionixApi(f, upc);
		});
	} catch (e) {
		if (isDev()) {
			logger.warn("Nutritionix UPC search failed", { error: e });
		}

		return [];
	}
}

function mapFoodItemFromNutritionixApi(foodItem?: INutritionixFoodItem, upc?: string): IFoodItem {
	if (!foodItem) {
		return null;
	}

	// work out what to multiply the per-serving nutrition values by
	let measurementUnit: FoodMeasurementUnit = "g";
	let conversionFactor = 0;
	if ((/ml( .*)?/i).test(foodItem.serving_unit)) {
		measurementUnit = "ml";
		conversionFactor = 100 / foodItem.serving_qty;
	} else if ((/fl\.? oz( .*)?/i).test(foodItem.serving_unit)) {
		measurementUnit = "ml";
		conversionFactor = 100 / (foodItem.serving_qty * 29.57); // 1 fl oz = 29.57 g
	} else if ((/g( .*)?/i).test(foodItem.serving_unit)) {
		measurementUnit = "g";
		conversionFactor = 100 / foodItem.serving_qty;
	} else if ((/oz( .*)?/i).test(foodItem.serving_unit)) {
		measurementUnit = "g";
		conversionFactor = 100 / (foodItem.serving_qty * 28.35); // 1 oz = 28.35 g
	} else {
		logger.debug(`Could not handle serving size: ${foodItem.serving_unit}`, { foodItem });
	}

	return {
		...(getDefaultFoodItem()),
		brand: foodItem.brand_name,
		name: foodItem.food_name,
		upc,
		measurementUnit,
		caloriesPer100: roundToDp(foodItem.nf_calories * conversionFactor, 1),
		fatPer100: roundToDp(foodItem.nf_total_fat * conversionFactor, 1),
		satFatPer100: roundToDp(foodItem.nf_saturated_fat * conversionFactor, 1),
		carbohydratePer100: roundToDp(foodItem.nf_total_carbohydrate * conversionFactor, 1),
		sugarPer100: roundToDp(foodItem.nf_sugars * conversionFactor, 1),
		fibrePer100: roundToDp(foodItem.nf_dietary_fiber * conversionFactor, 1),
		proteinPer100: roundToDp(foodItem.nf_protein * conversionFactor, 1),
		saltPer100: roundToDp(foodItem.nf_sodium * conversionFactor / 400, 1), // 1g salt ~= 400mg sodium
		servingSizes: [],
		diaryEntries: [],
	};
}

export {
	getFoodItemsFromNutritionixByUpc,
};
