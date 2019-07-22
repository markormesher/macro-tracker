import * as Dayjs from "dayjs";
import { Entity } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { IExerciseEntry } from "../../../commons/models/IExerciseEntry";
import { DayjsDateTransformer } from "../DayjsDateTransformer";
import { BaseModel } from "./BaseModel";

@Entity()
class DbExerciseEntry extends BaseModel implements IExerciseEntry {

	@Column({
		type: "integer",
		transformer: new DayjsDateTransformer(),
	})
	public date: Dayjs.Dayjs;

	@Column({
		type: "integer",
		transformer: new DayjsDateTransformer(),
	})
	public lastEdit: Dayjs.Dayjs;

	@Column({ type: "character varying" })
	public label: string;

	@Column({ type: "double precision" })
	public caloriesBurned: number;
}

export {
	DbExerciseEntry,
};
