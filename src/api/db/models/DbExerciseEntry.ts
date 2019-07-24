import { Entity } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { IExerciseEntry } from "../../../commons/models/IExerciseEntry";
import { DateTransformer } from "../DateTransformer";
import { BaseModel } from "./BaseModel";

@Entity()
class DbExerciseEntry extends BaseModel implements IExerciseEntry {

	@Column({
		type: "integer",
		transformer: new DateTransformer(),
	})
	public date: Date;

	@Column({
		type: "integer",
		transformer: new DateTransformer(),
	})
	public lastEdit: Date;

	@Column({ type: "character varying" })
	public label: string;

	@Column({ type: "double precision" })
	public caloriesBurned: number;
}

export {
	DbExerciseEntry,
};
