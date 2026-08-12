import type { DocumentNode } from "@apollo/client";
import type {
  IActionParams,
  ITaskResult,
  IActionResult,
} from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";

interface FormatDoActionParams {
  action: {
    name: string;
    total: number;
  };
  payload: any;
  onProgress?: (arg: ITaskResult) => void;
  onFinish?: (arg: IActionResult) => void;
  type?: string;
}

export const formatDoActionParams = (
  params: FormatDoActionParams,
  mutation: DocumentNode,
): IActionParams => {
  const {
    action: { name, total },
    payload,
    onProgress,
    onFinish,
    type,
  } = params;

  return {
    mutation,
    payload,
    name,
    total,
    onProgress,
    onFinish,
    type,
  };
};

export const useFormatDoAction = (
  params: FormatDoActionParams,
  mutation: DocumentNode,
) => {
  const doAction = useAction();
  return () => doAction(formatDoActionParams(params, mutation));
};

export const textAreaLength = 256;

export function mergeQuery(
  src?: IQuery,
  dest?: IQuery,
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

  // console.log('query', query)
  return query;
}
