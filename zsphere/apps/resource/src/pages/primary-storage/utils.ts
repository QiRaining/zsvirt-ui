import type {
  IQuery,
  PerformanceThresholdSymbolType,
} from "@zstack/zsphere-types";
import { PrimaryStorageType } from "@zstack/zsphere-types";

import type { ISubPrimaryStorageType } from "./create/type";

export const calculateStorageMetrics = (
  type: PrimaryStorageType,
  realSealStorageCapacity?: {
    totalPhysicalCapacity: number;
    availablePhysicalCapacity: number;
    reservedPhysicalCapacity: number;
    cephTotalPhysicalCapacity: number;
    cephAvailablePhysicalCapacity: number;
    thresholdPrimaryStoragePhysicalCapacity: number;
  },
): {
  totalNum: number;
  usedNum: number;
  availableNum: number;
  reservedNum: number;
} => {
  const {
    totalPhysicalCapacity = 0,
    availablePhysicalCapacity = 0,
    reservedPhysicalCapacity = 0,
    cephTotalPhysicalCapacity = 0,
    cephAvailablePhysicalCapacity = 0,
    thresholdPrimaryStoragePhysicalCapacity = 0.9,
  } = realSealStorageCapacity || {};

  const metricsCalculators = new Map([
    [
      PrimaryStorageType.Ceph,
      () => {
        const totalNum = cephTotalPhysicalCapacity;
        const availableNum = cephAvailablePhysicalCapacity;
        const reservedNum =
          cephTotalPhysicalCapacity *
          (1 - thresholdPrimaryStoragePhysicalCapacity);
        const usedNum = totalNum - availableNum;
        return { totalNum, availableNum, usedNum, reservedNum };
      },
    ],
    [
      PrimaryStorageType.LocalStorage,
      () => {
        const totalNum = totalPhysicalCapacity;
        const availableNum = availablePhysicalCapacity;
        const reservedNum = reservedPhysicalCapacity;
        const usedNum = totalNum - availableNum;
        return { totalNum, availableNum, usedNum, reservedNum };
      },
    ],
    // 可以继续添加其他需要额外处理的类型
  ]);

  // 默认使用本地存储的计算逻辑
  const calculateMetrics =
    metricsCalculators.get(type) ||
    metricsCalculators.get(PrimaryStorageType.LocalStorage);

  if (calculateMetrics) {
    return calculateMetrics();
  }

  return { totalNum: 0, usedNum: 0, availableNum: 0, reservedNum: 0 };
};

export type PrimaryStorageWithSubType =
  | PrimaryStorageType
  | "Ceph-ZCE";
export const getPrimaryStorageType = (
  type: PrimaryStorageType,
  subType: ISubPrimaryStorageType,
): PrimaryStorageWithSubType => {
  if (type === PrimaryStorageType.Ceph) {
    return `${type}-${subType}` as PrimaryStorageWithSubType;
  }
  return type;
};

interface IQueryPerformance extends IQuery {
  thresholdSymbol?: PerformanceThresholdSymbolType;
  startTime?: string;
  endTime?: string;
  thresholdNum?: string;
  thresholdMetric?: string;
  metrics?: string[];
}

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

  const query = { ...src, ...dest, conditions: c, extraConditions: dc };

  return query;
}
