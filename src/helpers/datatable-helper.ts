import { Request } from "express";
import { SelectQueryBuilder } from "typeorm";
import { IDataTableResponse } from "../models/IDataTableResponse";
import { BaseModel } from "../db/models/BaseModel";

type OrderStatement = Array<[string, "ASC" | "DESC"]>;

function getDataForTable<T extends BaseModel>(
  model: typeof BaseModel,
  req: Request,
  totalQuery: SelectQueryBuilder<T>,
  filteredQuery: SelectQueryBuilder<T>,
  preOrder?: OrderStatement,
  postOrder?: OrderStatement,
): Promise<IDataTableResponse<T>> {
  const start = parseInt(req.query.start, 10);
  const length = parseInt(req.query.length, 10);

  const rawOrder: OrderStatement = req.query.order;
  const order: OrderStatement = [];
  if (preOrder) {
    preOrder.forEach((o) => order.push(o));
  }
  if (rawOrder) {
    rawOrder.forEach((o) => order.push(o));
  }
  if (postOrder) {
    postOrder.forEach((o) => order.push(o));
  }

  filteredQuery = filteredQuery.skip(start).take(length);
  order.forEach((o) => (filteredQuery = filteredQuery.addOrderBy(o[0], o[1])));

  return Promise.all([totalQuery.getCount(), filteredQuery.getManyAndCount()]).then(
    ([totalRowCount, [data, filteredRowCount]]) => ({
      totalRowCount,
      filteredRowCount,
      data,
    }),
  );
}

export { OrderStatement, getDataForTable };
