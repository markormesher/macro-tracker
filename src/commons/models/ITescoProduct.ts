interface ITescoProduct {
  readonly brand: string;
  readonly description: string;
  readonly calcNutrition: {
    readonly per100Header: string;
    readonly calcNutrients: Array<{
      readonly name: string;
      readonly valuePer100: string;
    }>;
  };
}

export { ITescoProduct };

/*
Example (irrelevant parts omitted):

{
  "gtin": "05018374442215",
  "tpnb": "051338329",
  "tpnc": "259061829",
  "description": "Tesco Red Kidney Beans 400G",
  "brand": "TESCO",
  "qtyContents": {
	"quantity": 240.0,
	"totalQuantity": 240.0,
	"quantityUom": "g",
	"drainedWtUnitSize": "240",
	"drainedWeight": "240g",
	"netContents": "400g e"
  },
  "calcNutrition": {
	"per100Header": "Per 100g",
	"perServingHeader": "½ of a can (120g)",
	"calcNutrients": [
	  {
		"name": "Energy (kJ)",
		"valuePer100": "468",
		"valuePerServing": "561"
	  },
	  {
		"name": "Energy (kcal)",
		"valuePer100": "111",
		"valuePerServing": "134"
	  },
	  {
		"name": "Fat (g)",
		"valuePer100": "0.8",
		"valuePerServing": "1"
	  },
	  {
		"name": "Saturates (g)",
		"valuePer100": "0.2",
		"valuePerServing": "0.2"
	  },
	  {
		"name": "Carbohydrate (g)",
		"valuePer100": "13.5",
		"valuePerServing": "16.2"
	  },
	  {
		"name": "Sugars (g)",
		"valuePer100": "0.7",
		"valuePerServing": "0.8"
	  },
	  {
		"name": "Fibre (g)",
		"valuePer100": "9.6",
		"valuePerServing": "11.5"
	  },
	  {
		"name": "Protein (g)",
		"valuePer100": "7.7",
		"valuePerServing": "9.3"
	  },
	  {
		"name": "Salt (g)",
		"valuePer100": "0.01",
		"qualPer100": "<",
		"valuePerServing": "0.1"
	  }
	]
  }
}
*/
