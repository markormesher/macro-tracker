import * as Moment from "moment";
import { Entity } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { IExerciseEntry } from "../../../commons/models/IExerciseEntry";
import { MomentDateTransformer } from "../MomentDateTransformer";
import { BaseModel } from "./BaseModel";

@Entity()
class DbExerciseEntry extends BaseModel implements IExerciseEntry {

	@Column({
		type: "integer",
		transformer: new MomentDateTransformer(),
	})
	public date: Moment.Moment;

	@Column({
		type: "integer",
		transformer: new MomentDateTransformer(),
	})
	public lastEdit: Moment.Moment;

	@Column({ type: "character varying" })
	public label: string;

	@Column({ type: "double precision" })
	public caloriesBurned: number;
}

export {
	DbExerciseEntry,
};
