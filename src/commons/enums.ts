type FoodMeasurementUnit = "g" | "ml" | "single_serving";

type Meal = "snacks_1"
		| "breakfast"
		| "snacks_2"
		| "lunch"
		| "snacks_3"
		| "dinner"
		| "snacks_4";

const ALL_MEAL_VALUES: Meal[] = [
	"snacks_1",
	"breakfast",
	"snacks_2",
	"lunch",
	"snacks_3",
	"dinner",
	"snacks_4",
];

export {
	FoodMeasurementUnit,
	Meal,
	ALL_MEAL_VALUES,
};
