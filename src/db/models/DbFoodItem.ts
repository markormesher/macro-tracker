import { Entity, OneToMany } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { ApiSource, FoodMeasurementUnit } from "../../utils/enums";
import { IFoodItem } from "../../models/IFoodItem";
import { BaseModel } from "./BaseModel";
import { DbDiaryEntry } from "./DbDiaryEntry";
import { DbServingSize } from "./DbServingSize";

@Entity()
class DbFoodItem extends BaseModel implements IFoodItem {
  @Column()
  public brand: string;

  @Column()
  public name: string;

  @Column({ nullable: true, type: "character varying", array: true })
  public upcs: string[];

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
    () => DbServingSize,
    (s) => s.foodItem,
  )
  public servingSizes: DbServingSize[];

  @OneToMany(
    () => DbDiaryEntry,
    (de) => de.foodItem,
  )
  public diaryEntries: DbDiaryEntry[];
}

export { DbFoodItem };
