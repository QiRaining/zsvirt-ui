import { IQuery, PerformanceThresholdSymbolType } from "@zstack/zsphere-types";

interface IQueryPerformance extends IQuery {
  thresholdSymbol?: PerformanceThresholdSymbolType;
  startTime?: string;
  endTime?: string;
  thresholdNum?: string;
  thresholdMetric?: string;
  metrics?: string[];
}

/**
 * 合并两个 IQuery 条件对象，自动去重
 * @param src 源查询条件
 * @param dest 目标查询条件
 * @param megreSameKey 是否合并相同 key+op 的条件（默认 true）
 */
export function mergeQuery(
  src?: IQueryPerformance,
  dest?: IQueryPerformance,
  megreSameKey = true,
): IQuery {
  const { conditions = [], extraConditions = [] } = src ?? {};
  const {
    conditions: destconditions = [],
    extraConditions: destextraConditions = [],
  } = dest ?? {};

  const arrayToMap = (arr: any[]) => {
    return arr.reduce((p, c: any) => {
      const key = megreSameKey
        ? `${c.key}-${c.op}`
        : `${c.key}-${c.op}-${c.value}`;
      p[key] = c;
      return p;
    }, {});
  };

  const mapToArray = (obj: object = {}) => {
    return Object.values(obj);
  };
  const map1 = arrayToMap(conditions);
  const map2 = arrayToMap(destconditions);

  const c = mapToArray({ ...map1, ...map2 });

  const extmap1 = arrayToMap(extraConditions);
  const extmap2 = arrayToMap(destextraConditions);
  const dc = mapToArray({ ...extmap1, ...extmap2 });

  const query = { ...src, ...dest, ...{ conditions: c, extraConditions: dc } };

  return query;
}
