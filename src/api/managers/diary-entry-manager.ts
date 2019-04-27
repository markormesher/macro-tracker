import * as Moment from "moment";
import { SelectQueryBuilder } from "typeorm";
import { IDiaryEntry, validateDiaryEntry } from "../../commons/models/IDiaryEntry";
import { StatusError } from "../../commons/StatusError";
import { DbDiaryEntry } from "../db/models/DbDiaryEntry";
import { MomentDateTransformer } from "../db/MomentDateTransformer";

function getDiaryEntryQueryBuilder(): SelectQueryBuilder<DbDiaryEntry> {
	return DbDiaryEntry
			.createQueryBuilder("diary_entry")
			.leftJoinAndSelect("diary_entry.foodItem", "food_item")
			.leftJoinAndSelect("food_item.servingSizes", "food_item_serving_sizes")
			.leftJoinAndSelect("diary_entry.servingSize", "serving_size");
}

async function getDiaryEntry(id: string): Promise<DbDiaryEntry> {
	return getDiaryEntryQueryBuilder()
			.where("diary_entry.deleted = FALSE")
			.andWhere("diary_entry.id = :id")
			.setParameter("id", id)
			.getOne();
}

async function getDiaryEntriesForDate(date: Moment.Moment): Promise<DbDiaryEntry[]> {
	const minDate = date.clone().startOf("day");
	const maxDate = date.clone().endOf("day");

	return getDiaryEntryQueryBuilder()
			.where("diary_entry.deleted = FALSE")
			.andWhere("diary_entry.date >= :minDate")
			.andWhere("diary_entry.date <= :maxDate")
			.setParameter("minDate", MomentDateTransformer.toDbFormat(minDate))
			.setParameter("maxDate", MomentDateTransformer.toDbFormat(maxDate))
			.getMany();
}

async function saveDiaryEntry(diaryEntryId: string, values: IDiaryEntry): Promise<DbDiaryEntry> {
	if (!validateDiaryEntry(values).isValid) {
		throw new StatusError(400, "The diary entry was not valid");
	}

	const creatingNewEntity = !diaryEntryId;
	return getDiaryEntry(diaryEntryId)
			.then((diaryEntry) => {
				if (!diaryEntry && !creatingNewEntity) {
					throw new StatusError(404, "That diary entry doesn't exist");
				}

				values = {
					...values,
					lastEdit: Moment(),
				};

				diaryEntry = DbDiaryEntry.getRepository().merge(diaryEntry || new DbDiaryEntry(), values);
				return diaryEntry.save();
			});
}

async function deleteDiaryEntry(diaryEntryId: string): Promise<void> {
	return getDiaryEntry(diaryEntryId)
			.then((diaryEntry) => {
				if (!diaryEntry) {
					throw new StatusError(404, "That diary entry doesn't exist");
				}

				diaryEntry.deleted = true;
				return diaryEntry.save();
			})
			.then(() => undefined);
}

export {
	getDiaryEntryQueryBuilder,
	getDiaryEntry,
	getDiaryEntriesForDate,
	saveDiaryEntry,
	deleteDiaryEntry,
};
