import * as Moment from "moment";
import { Column, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { ITarget } from "../../../commons/models/ITarget";
import { MomentDateTransformer } from "../MomentDateTransformer";
import { BaseModel } from "./BaseModel";

@Entity()
class DbTarget extends BaseModel implements ITarget {

	@PrimaryGeneratedColumn("uuid")
	public id: string;

	@Column({ default: false })
	public deleted: boolean;

	@Column({ type: "double precision" })
	public baselineCaloriesPerDay: number;

	@Column({ type: "double precision" })
	public proportionCarbohydrates: number;

	@Column({ type: "double precision" })
	public proportionProtein: number;

	@Column({ type: "double precision" })
	public proportionFat: number;

	@Column({
		type: "integer",
		transformer: new MomentDateTransformer(),
	})
	public startDate: Moment.Moment;

}

export {
	DbTarget,
};
