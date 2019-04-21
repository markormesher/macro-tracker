import * as Moment from "moment";
import { FindOperator, ValueTransformer } from "typeorm";
import { StatusError } from "../../commons/StatusError";

class MomentDateTransformer implements ValueTransformer {

	public static toDbFormat(value: Moment.Moment): number {
		if (value === undefined) {
			return undefined;
		} else if (value === null) {
			return null;
		} else {
			if (value.isValid()) {
				return value.unix();
			} else {
				throw new StatusError(500, "Invalid Moment date");
			}
		}
	}

	public static fromDbFormat(value: number): Moment.Moment {
		return (value || value === 0) ? Moment(value * 1000) : null;
	}

	public to(value: Moment.Moment | FindOperator<any>): number | FindOperator<any> {
		if (value instanceof FindOperator) {
			return value;
		}

		return MomentDateTransformer.toDbFormat(value);
	}

	public from(value: number): Moment.Moment {
		return MomentDateTransformer.fromDbFormat(value);
	}
}

export {
	MomentDateTransformer,
};
