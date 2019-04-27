interface INutritionixFoodItem {
	readonly nix_item_id: string;
	readonly food_name: string;
	readonly brand_name: string;
	readonly serving_qty: number;
	readonly serving_unit: string;
	readonly serving_weight_grams: number;
	readonly nf_calories: number;
	readonly nf_total_fat: number;
	readonly nf_saturated_fat: number;
	readonly nf_total_carbohydrate: number;
	readonly nf_sugars: number;
	readonly nf_dietary_fiber: number;
	readonly nf_protein: number;
	readonly nf_sodium: number;
}

export {
	INutritionixFoodItem,
};

/*
Example response:

{
  "food_name": "High Protein Shake, Carb Killa, Peanut Nutter",
  "brand_name": "Grenade",
  "serving_qty": 330,
  "serving_unit": "ml",
  "serving_weight_grams": null,
  "nf_calories": 196.57000732421875,
  "nf_total_fat": 6.900000095367432,
  "nf_saturated_fat": 4.599999904632568,
  "nf_cholesterol": null,
  "nf_sodium": 252,
  "nf_total_carbohydrate": 9.199999809265137,
  "nf_dietary_fiber": 0.30000001192092896,
  "nf_sugars": 5.599999904632568,
  "nf_protein": 24,
  "nf_potassium": null,
  "nf_p": null,
  "full_nutrients": [
	{
	  "attr_id": 203,
	  "value": 24
	},
	{
	  "attr_id": 204,
	  "value": 6.9
	},
	{
	  "attr_id": 205,
	  "value": 9.2
	},
	{
	  "attr_id": 208,
	  "value": 196.57
	},
	{
	  "attr_id": 269,
	  "value": 5.6
	},
	{
	  "attr_id": 291,
	  "value": 0.3
	},
	{
	  "attr_id": 307,
	  "value": 252
	},
	{
	  "attr_id": 606,
	  "value": 4.6
	}
  ],
  "nix_brand_name": "Grenade",
  "nix_brand_id": "54fb34b86d153dfd4902f71d",
  "nix_item_name": "High Protein Shake, Carb Killa, Peanut Nutter",
  "nix_item_id": "5c88ac06cf773c8f38d3881e",
  "metadata": {},
  "source": 8,
  "ndb_no": null,
  "tags": null,
  "alt_measures": null,
  "lat": null,
  "lng": null,
  "photo": {
	"thumb": "https://d1r9wva3zcpswd.cloudfront.net/5c88ac0bcf773c8f38d38820.jpeg",
	"highres": null,
	"is_user_uploaded": false
  },
  "note": null,
  "updated_at": "2019-03-13T07:06:52+00:00",
  "nf_ingredient_statement": null
}
 */
