import { ICloneMealRequest } from "../../commons/models/ICloneMealRequest";
import { IDiaryEntry } from "../../commons/models/IDiaryEntry";
import { DateTransformer } from "../db/DateTransformer";
import { getDiaryEntryQueryBuilder, saveDiaryEntry } from "./diary-entry-manager";

async function cloneMeal(request: ICloneMealRequest): Promise<void> {
	const entriesToCopy = await getDiaryEntryQueryBuilder()
			.andWhere("diary_entry.date = :fromDate")
			.andWhere("diary_entry.meal = :meal")
			.setParameter("fromDate", DateTransformer.toDbFormat(request.fromDate))
			.setParameter("meal", request.fromMeal)
			.getMany();

	const savePromises: Array<Promise<any>> = [];
	for (const originalEntry of entriesToCopy.filter((e) => !e.deleted)) {
		const entryToSave: IDiaryEntry = {
			...originalEntry,
			id: undefined,
			date: request.toDate,
			meal: request.toMeal,
		};

		savePromises.push(saveDiaryEntry(undefined, entryToSave));
	}

	return Promise.all(savePromises).then(() => null);
}

export {
	cloneMeal,
};
