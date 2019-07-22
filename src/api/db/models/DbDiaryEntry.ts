import * as Dayjs from "dayjs";
import { Entity, ManyToOne } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { Meal } from "../../../commons/enums";
import { IDiaryEntry } from "../../../commons/models/IDiaryEntry";
import { DayjsDateTransformer } from "../DayjsDateTransformer";
import { BaseModel } from "./BaseModel";
import { DbFoodItem } from "./DbFoodItem";
import { DbServingSize } from "./DbServingSize";

@Entity()
class DbDiaryEntry extends BaseModel implements IDiaryEntry {

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
	public meal: Meal;

	@Column({ type: "double precision" })
	public servingQty: number;

	@ManyToOne(
			/* istanbul ignore next */
			() => DbFoodItem,
			/* istanbul ignore next */
			(fi) => fi.diaryEntries,
	)
	public foodItem: DbFoodItem;

	@ManyToOne(
			/* istanbul ignore next */
			() => DbServingSize,
			/* istanbul ignore next */
			(ss) => ss.diaryEntries,
	)
	public servingSize: DbServingSize;

}

export {
	DbDiaryEntry,
};
