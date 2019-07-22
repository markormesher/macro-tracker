import * as Dayjs from "dayjs";
import { FindOperator, ValueTransformer } from "typeorm";
import { StatusError } from "../../commons/StatusError";
import { utcDayjs } from "../../commons/utils/dates";

class DayjsDateTransformer implements ValueTransformer {

	public static toDbFormat(value: Dayjs.Dayjs): number {
		if (value === undefined) {
			return undefined;
		} else if (value === null) {
			return null;
		} else {
			if (value.isValid()) {
				return value.unix();
			} else {
				throw new StatusError(500, "Invalid Dayjs date");
			}
		}
	}

	public static fromDbFormat(value: number): Dayjs.Dayjs {
		return (value || value === 0) ? utcDayjs(value * 1000) : null;
	}

	public to(value: Dayjs.Dayjs | FindOperator<any>): number | FindOperator<any> {
		if (value instanceof FindOperator) {
			return value;
		}

		return DayjsDateTransformer.toDbFormat(value);
	}

	public from(value: number): Dayjs.Dayjs {
		return DayjsDateTransformer.fromDbFormat(value);
	}
}

export {
	DayjsDateTransformer,
};
