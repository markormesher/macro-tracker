import { SelectQueryBuilder } from "typeorm";
import { IServingSize, validateServingSize } from "../../commons/models/IServingSize";
import { StatusError } from "../../commons/StatusError";
import { DbServingSize } from "../db/models/DbServingSize";

function getServingSizeQueryBuilder(): SelectQueryBuilder<DbServingSize> {
	return DbServingSize
			.createQueryBuilder("serving_size");
}

async function getServingSize(id: string): Promise<DbServingSize> {
	return getServingSizeQueryBuilder()
			.where("serving_size.deleted = FALSE")
			.andWhere("serving_size.id = :id")
			.setParameter("id", id)
			.getOne();
}

async function saveServingSize(values: IServingSize, force: boolean = false): Promise<DbServingSize> {
	if (!validateServingSize(values).isValid) {
		throw new StatusError(400, "The serving size was not valid");
	}

	const servingSizeId = values.id;
	const creatingNewEntity = !servingSizeId;
	return getServingSize(servingSizeId)
			.then((servingSize) => {
				if (!servingSize && !(creatingNewEntity || force)) {
					throw new StatusError(404, "That serving size doesn't exist");
				}

				servingSize = DbServingSize.getRepository().merge(servingSize || new DbServingSize(), values);
				return servingSize.save();
			});
}

export {
	getServingSizeQueryBuilder,
	getServingSize,
	saveServingSize,
};
