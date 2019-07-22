import { ICloneMealRequest } from "../../commons/models/ICloneMealRequest";
import { IDiaryEntry } from "../../commons/models/IDiaryEntry";
import { DayjsDateTransformer } from "../db/DayjsDateTransformer";
import { getDiaryEntryQueryBuilder, saveDiaryEntry } from "./diary-entry-manager";

async function cloneMeal(request: ICloneMealRequest): Promise<void> {
	const fromDateStart = request.fromDate.clone().startOf("day");
	const fromDateEnd = request.fromDate.clone().endOf("day");

	const entriesToCopy = await getDiaryEntryQueryBuilder()
			.where("diary_entry.date >= :startDate")
			.andWhere("diary_entry.date <= :endDate")
			.andWhere("diary_entry.meal = :meal")
			.setParameter("startDate", DayjsDateTransformer.toDbFormat(fromDateStart))
			.setParameter("endDate", DayjsDateTransformer.toDbFormat(fromDateEnd))
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
