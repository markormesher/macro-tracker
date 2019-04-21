import { Entity, OneToMany } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { FoodMeasurementUnit } from "../../../commons/enums";
import { IFoodItem } from "../../../commons/models/IFoodItem";
import { BaseModel } from "./BaseModel";
import { DbDiaryEntry } from "./DbDiaryEntry";
import { DbServingSize } from "./DbServingSize";

@Entity()
class DbFoodItem extends BaseModel implements IFoodItem {

	@Column()
	public brand: string;

	@Column()
	public name: string;

	@Column({ type: "character varying" })
	public measurementUnit: FoodMeasurementUnit;

	@Column({ type: "double precision" })
	public caloriesPer100: number;

	@Column({ type: "double precision" })
	public carbohydratePer100: number;

	@Column({ type: "double precision" })
	public sugarPer100: number;

	@Column({ type: "double precision" })
	public fatPer100: number;

	@Column({ type: "double precision" })
	public satFatPer100: number;

	@Column({ type: "double precision" })
	public proteinPer100: number;

	@Column({ type: "double precision" })
	public fibrePer100: number;

	@Column({ type: "double precision" })
	public saltPer100: number;

	@OneToMany(
			/* istanbul ignore next */
			() => DbServingSize,
			/* istanbul ignore next */
			(s) => s.foodItem,
	)
	public servingSizes: DbServingSize[];

	@OneToMany(
			/* istanbul ignore next */
			() => DbDiaryEntry,
			/* istanbul ignore next */
			(de) => de.foodItem,
	)
	public diaryEntries: DbDiaryEntry[];

}

export {
	DbFoodItem,
};
