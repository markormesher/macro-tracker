import { Entity, ManyToOne } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { Meal } from "../../utils/enums";
import { IDiaryEntry } from "../../models/IDiaryEntry";
import { DateTransformer } from "../DateTransformer";
import { BaseModel } from "./BaseModel";
import { DbFoodItem } from "./DbFoodItem";
import { DbServingSize } from "./DbServingSize";

@Entity()
class DbDiaryEntry extends BaseModel implements IDiaryEntry {
  @Column({
    type: "integer",
    transformer: new DateTransformer(),
  })
  public date: Date;

  @Column({ type: "character varying" })
  public meal: Meal;

  @Column({ type: "double precision" })
  public servingQty: number;

  @ManyToOne(
    () => DbFoodItem,
    (fi) => fi.diaryEntries,
  )
  public foodItem: DbFoodItem;

  @ManyToOne(
    () => DbServingSize,
    (ss) => ss.diaryEntries,
  )
  public servingSize: DbServingSize;
}

export { DbDiaryEntry };
