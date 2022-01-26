import { Column, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { ITarget, TargetMode } from "../../models/ITarget";
import { DateTransformer } from "../DateTransformer";
import { BaseModel } from "./BaseModel";

@Entity()
class DbTarget extends BaseModel implements ITarget {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({ default: false })
  public deleted: boolean;

  @Column({
    type: "integer",
    transformer: new DateTransformer(),
  })
  public startDate: Date;

  @Column({ type: "double precision" })
  public bodyWeightKg: number;

  @Column({ type: "double precision" })
  public maintenanceCalories: number;

  @Column({ type: "double precision" })
  public calorieAdjustment: number;

  @Column({ type: "character varying" })
  public carbohydratesTargetMode: TargetMode;

  @Column({ type: "double precision" })
  public carbohydratesTargetValue: number;

  @Column({ type: "character varying" })
  public fatTargetMode: TargetMode;

  @Column({ type: "double precision" })
  public fatTargetValue: number;

  @Column({ type: "character varying" })
  public proteinTargetMode: TargetMode;

  @Column({ type: "double precision" })
  public proteinTargetValue: number;
}

export { DbTarget };
