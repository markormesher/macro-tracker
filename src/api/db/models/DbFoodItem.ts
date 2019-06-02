import { Entity, OneToMany } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { ApiSource, FoodMeasurementUnit } from "../../../commons/enums";
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

	@Column({ nullable: true })
	public upc: string;

	@Column({ nullable: true, type: "character varying" })
	public apiSource: ApiSource;

	@Column({ nullable: true })
	public apiId: string;

	@Column({ type: "character varying" })
	public measurementUnit: FoodMeasurementUnit;

	@Column({ type: "double precision" })
	public caloriesPerBaseAmount: number;

	@Column({ type: "double precision" })
	public fatPerBaseAmount: number;

	@Column({ type: "double precision" })
	public satFatPerBaseAmount: number;

	@Column({ type: "double precision" })
	public carbohydratePerBaseAmount: number;

	@Column({ type: "double precision" })
	public sugarPerBaseAmount: number;

	@Column({ type: "double precision" })
	public fibrePerBaseAmount: number;

	@Column({ type: "double precision" })
	public proteinPerBaseAmount: number;

	@Column({ type: "double precision" })
	public saltPerBaseAmount: number;

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
