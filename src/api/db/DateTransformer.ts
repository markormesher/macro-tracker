import { format } from "date-fns";
import { FindOperator, ValueTransformer } from "typeorm";
import { fixedDate } from "../../commons/utils/dates";

class DateTransformer implements ValueTransformer {

	public static toDbFormat(value: Date): string {
		if (value === undefined) {
			return undefined;
		} else if (value === null) {
			return null;
		} else {
			return format(value, "YYYY-MM-DD");
		}
	}

	public static fromDbFormat(value: string): Date {
		return !!value ? fixedDate(value) : null;
	}

	public to(value: Date | FindOperator<any>): string | FindOperator<any> {
		if (value instanceof FindOperator) {
			return value;
		}

		return DateTransformer.toDbFormat(value);
	}

	public from(value: string): Date {
		return DateTransformer.fromDbFormat(value);
	}
}

export {
	DateTransformer,
};
