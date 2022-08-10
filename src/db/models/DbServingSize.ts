import { BaseEntity, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { IServingSize } from "../../models/IServingSize";
import { DbDiaryEntry } from "./DbDiaryEntry";
import { DbFoodItem } from "./DbFoodItem";

@Entity()
class DbServingSize extends BaseEntity implements IServingSize {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ default: false })
  public deleted: boolean;

  @Column()
  public label: string;

  @Column({ type: "double precision" })
  public measurement: number;

  @ManyToOne(() => DbFoodItem, (f) => f.servingSizes)
  public foodItem: DbFoodItem;

  @OneToMany(() => DbDiaryEntry, (de) => de.servingSize)
  public diaryEntries: DbDiaryEntry[];
}

export { DbServingSize };
