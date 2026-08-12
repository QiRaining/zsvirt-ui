import * as _ from "lodash";

import { ZStackApiBase } from "./zstack-api-base";

export enum Op {
  eq = "eq",
  ne = "ne",
  gte = "gte",
  gt = "gt",
  lte = "lte",
  lt = "lt",
  like = "like",
  notLike = "notLike",
  exactLike = "exactLike",
  exactNotLike = "notExactLike",
  is = "is",
  not = "not",
  in = "in",
  notIn = "notIn",
  has = "has",
  notHas = "notHas",
  query = "query",
  getapi = "getapi",
  and = "and",
  or = "or",
}

export class QueryBase extends ZStackApiBase {
  handleConditions(conditions = [], connector = "q"): string {
    const q = [];
    for (const _ of conditions) {
      if (typeof _ === "object") {
        const { value, key, op = Op.eq, values = [] } = _;
        let _value = "";
        const isValidate = !!key;
        if (isValidate) {
          _value = encodeURIComponent(value);
        }
        let _values = "";
        if (isValidate) {
          _values = values.map((it) => encodeURIComponent(it)).join(",");
        }
        const opActionCallback = {
          [Op.gt]: () => isValidate && q.push(`${key}>${_value}`),
          [Op.lt]: () => isValidate && q.push(`${key}<${_value}`),
          [Op.gte]: () => isValidate && q.push(`${key}>=${_value}`),
          [Op.lte]: () => isValidate && q.push(`${key}<=${_value}`),
          [Op.eq]: () => isValidate && q.push(`${key}=${_value}`),
          [Op.ne]: () => isValidate && q.push(`${key}!=${_value}`),
          [Op.like]: () => isValidate && q.push(`${key}~=%25${_value}%25`),
          [Op.notLike]: () => isValidate && q.push(`${key}!~=%25${_value}%25`),
          [Op.exactLike]: () => isValidate && q.push(`${key}~=${_value}`),
          [Op.exactNotLike]: () => isValidate && q.push(`${key}!~=${_value}`),
          [Op.in]: () => isValidate && q.push(`${key}?=${_values}`),
          [Op.notIn]: () => isValidate && q.push(`${key}!?=${_values}`),
          [Op.is]: () => isValidate && q.push(`${key} is null`),
          [Op.not]: () => isValidate && q.push(`${key} not null`),
          [Op.notHas]: () => isValidate && q.push(`${key} not has ${_values}`),
          [Op.has]: () => isValidate && q.push(`${key} has ${_values}`),
        };
        opActionCallback?.[op]?.();
      }
    }
    return q.map((it) => `${connector}=${it}`).join("&");
  }
  buildQuery(url, param: QueryParam) {
    let query = `${url}?`;
    if (param.conditions && param.conditions.length > 0) {
      query += this.handleConditions(param.conditions);
      query += "&";
    }
    if (param.limit !== undefined) {
      query += `limit=${param.limit}&`;
    }
    if (param.start !== undefined) {
      query += `start=${param.start}&`;
    }
    if (param.count !== undefined) {
      query += `count=${param.count.toString()}&`;
    }
    if (param.groupBy !== undefined) {
      query += `groupBy=${param.groupBy}&`;
    }
    if (param.replyWithCount !== undefined) {
      query += `replyWithCount=${param.replyWithCount.toString()}&`;
    }
    if (param.sortBy !== undefined) {
      if (param.sortDirection !== undefined) {
        query += `sort=${param.sortDirection === "asc" ? "+" : "-"}${
          param.sortBy
        }&`;
      } else {
        query += `sort=${param.sortBy}&`;
      }
    }
    if (param.fields && param.fields.length > 0) {
      query += "fields=";
      query += param.fields.map((field) => `${field}`).join(",");
      query += "&";
    }
    if (query[query.length - 1] === "&") {
      query = query.slice(0, -1);
    }
    if (query[query.length - 1] === "?") {
      query = query.slice(0, -1);
    }
    return query;
  }
}

// extractAndRemoveExtraCondition 会直接修改传入的conditions的值，如需保持传入conditions不变需在传入前cloneDeep
export function extractAndRemoveExtraCondition<T extends string>(
  conditions: Condition[],
  keys: T[],
): [Condition[], { [key in T]?: Condition }] {
  const extraCondition = _.remove(conditions, (condition) =>
    _.includes(keys, condition.key),
  );
  const extraConditionMap = _.reduce(
    extraCondition,
    (obj, item) => {
      if (
        !(
          item.key === "accountName" &&
          item.op === "eq" &&
          item.value === "all"
        )
      ) {
        obj[item.key] = item;
      }
      return obj;
    },
    Object.create(null),
  );
  return [conditions, extraConditionMap];
}

export function conditionsToObject(conditoins: Condition[]) {
  const result = {};
  conditoins.forEach((condition) => {
    result[condition.key] = condition.value || condition.values;
  });
  return result;
}

export interface Condition {
  key?: string;
  value?: any;
  values?: any[];
  op?: Op;
}

export interface QueryParam {
  conditions?: Condition[];
  limit?: number;
  start?: number;
  count?: boolean;
  groupBy?: string;
  replyWithCount?: boolean;
  sortBy?: string;
  sortDirection?: string;
  fields?: string[];
  timeout?: number;
}
