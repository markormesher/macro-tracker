import axios, { AxiosResponse } from "axios";
import * as https from "https";
import { IFoodItem, mapFoodItemFromNutritionixApi } from "../../commons/models/IFoodItem";
import { INutritionixItemSearchResponse } from "../../commons/models/INutritionixUpcSearchResponse";
import { isDev } from "../../commons/utils/env";
import { logger } from "../../commons/utils/logging";
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

		return foods.map((f) => mapFoodItemFromNutritionixApi(f));
	} catch (e) {
		if (isDev()) {
			logger.warn("Nutritionix UPC search failed", { error: e });
		}

		return [];
	}
}

export {
	getFoodItemsFromNutritionixByUpc,
};
