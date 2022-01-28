import { INutritionixFoodItem } from "./INutritionixFoodItem";

interface INutritionixKeywordSearchResponse {
  readonly branded: INutritionixFoodItem[];
  readonly common: INutritionixFoodItem[];
}

export { INutritionixKeywordSearchResponse };
