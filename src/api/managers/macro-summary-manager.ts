import { generateMacroSummary, IMacroSummary } from "../../commons/models/IMacroSummary";
import { getDefaultTarget } from "../../commons/models/ITarget";
import { getDiaryEntriesForDate } from "./diary-entry-manager";
import { getExerciseEntriesForDate } from "./exercise-entry-manager";
import { getTargetForDate } from "./targets-manager";

async function getMacroSummaryForDate(date: Date): Promise<IMacroSummary> {
	const [diaryEntries, exerciseEntries, target] = await Promise.all([
		getDiaryEntriesForDate(date),
		getExerciseEntriesForDate(date),
		getTargetForDate(date),
	]);

	return generateMacroSummary(
			diaryEntries || [],
			exerciseEntries || [],
			target || getDefaultTarget(),
	);
}

export {
	getMacroSummaryForDate,
};
