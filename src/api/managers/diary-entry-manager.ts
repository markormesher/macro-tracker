import { SelectQueryBuilder } from "typeorm";
import { IDiaryEntry, validateDiaryEntry } from "../../commons/models/IDiaryEntry";
import { StatusError } from "../../commons/StatusError";
import { DateTransformer } from "../db/DateTransformer";
import { DbDiaryEntry } from "../db/models/DbDiaryEntry";

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

async function getDiaryEntriesForDate(date: Date): Promise<DbDiaryEntry[]> {
	return getDiaryEntryQueryBuilder()
			.where("diary_entry.deleted = FALSE")
			.andWhere("diary_entry.date = :date")
			.setParameter("date", DateTransformer.toDbFormat(date))
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
					lastEdit: new Date(),

					// remove serving size on non-measured food items
					servingSize: values.foodItem.measurementUnit === "single_serving" ? null : values.servingSize,
				};

				diaryEntry = DbDiaryEntry.getRepository().merge(diaryEntry || new DbDiaryEntry(), values);

				// typeorm doesn't merge nulls properly
				// TODO: make this less property-specific
				if (values.servingSize === null) {
					diaryEntry.servingSize = null;
				}

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
