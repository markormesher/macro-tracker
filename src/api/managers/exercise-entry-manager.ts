import * as Moment from "moment";
import { SelectQueryBuilder } from "typeorm";
import { IExerciseEntry, validateExerciseEntry } from "../../commons/models/IExerciseEntry";
import { StatusError } from "../../commons/StatusError";
import { DbExerciseEntry } from "../db/models/DbExerciseEntry";
import { MomentDateTransformer } from "../db/MomentDateTransformer";

function getExerciseEntryQueryBuilder(): SelectQueryBuilder<DbExerciseEntry> {
	return DbExerciseEntry
			.createQueryBuilder("exercise_entry");
}

async function getExerciseEntry(id: string): Promise<DbExerciseEntry> {
	return getExerciseEntryQueryBuilder()
			.where("exercise_entry.deleted = FALSE")
			.andWhere("exercise_entry.id = :id")
			.setParameter("id", id)
			.getOne();
}

async function getExerciseEntriesForDate(date: Moment.Moment): Promise<DbExerciseEntry[]> {
	const minDate = date.clone().startOf("day");
	const maxDate = date.clone().endOf("day");

	return getExerciseEntryQueryBuilder()
			.where("exercise_entry.deleted = FALSE")
			.andWhere("exercise_entry.date >= :minDate")
			.andWhere("exercise_entry.date <= :maxDate")
			.setParameter("minDate", MomentDateTransformer.toDbFormat(minDate))
			.setParameter("maxDate", MomentDateTransformer.toDbFormat(maxDate))
			.getMany();
}

async function getAllExerciseLabels(): Promise<string[]> {
	const rawResults = await getExerciseEntryQueryBuilder()
			.select("DISTINCT label")
			.getRawMany() as Array<{ label: string }>;

	return rawResults.map((r) => r.label);
}

async function saveExerciseEntry(exerciseEntryId: string, values: Partial<IExerciseEntry>): Promise<DbExerciseEntry> {
	if (!validateExerciseEntry(values).isValid) {
		throw new StatusError(400, "The exercise entry was not valid");
	}

	const creatingNewEntity = !exerciseEntryId;
	return getExerciseEntry(exerciseEntryId)
			.then((exerciseEntry) => {
				if (!exerciseEntry && !creatingNewEntity) {
					throw new StatusError(404, "That exercise entry doesn't exist");
				}

				values = {
					...values,
					lastEdit: Moment(),
				};

				exerciseEntry = DbExerciseEntry.getRepository().merge(exerciseEntry || new DbExerciseEntry(), values);
				return exerciseEntry.save();
			});
}

async function deleteExerciseEntry(exerciseEntryId: string): Promise<void> {
	return getExerciseEntry(exerciseEntryId)
			.then((exerciseEntry) => {
				if (!exerciseEntry) {
					throw new StatusError(404, "That exercise entry doesn't exist");
				}

				exerciseEntry.deleted = true;
				return exerciseEntry.save();
			})
			.then(() => undefined);
}

export {
	getExerciseEntryQueryBuilder,
	getExerciseEntry,
	getExerciseEntriesForDate,
	getAllExerciseLabels,
	saveExerciseEntry,
	deleteExerciseEntry,
};
