import { bus } from "@zstack/zsphere-utils";
import { useMount, useSessionStorageState } from "ahooks";
import _ from "lodash-es";
import { useReducer } from "react";

import { IAction, ICondition } from "./type";

export function useSearch(resource: string, view = "main") {
  const cacheName = `${resource}-${view}-search-conditions`;
  const [cache, setCache] = useSessionStorageState<ICondition[]>(cacheName);

  const searchReducer = (state: ICondition[], action: IAction) => {
    const { type, payload } = action;
    let result = state;
    switch (type) {
      case "add": {
        if (payload) {
          const { condition, sortBy } = payload;
          if (condition) {
            const conditionMap = new Map<string, ICondition>();
            state.forEach((item) => {
              conditionMap.set(item.name.key, item);
            });
            conditionMap.set(condition.name.key, condition);
            result = Array.from(conditionMap.values());
            if (sortBy) {
              result = _.sortBy(result, (item: ICondition) =>
                sortBy.findIndex((s) => s === item.name.key),
              );
            }
          }
        }
        break;
      }
      case "remove": {
        if (payload?.key) {
          result = state.filter((item) => item.name.key !== payload.key);

          if (payload?.type === "tag") bus.emit(`${cacheName}-tag-clear`);
        }
        break;
      }
      case "set": {
        if (payload) {
          const { conditions = [], sortBy } = payload;
          result = conditions;
          if (sortBy) {
            result = _.sortBy(result, (item: ICondition) =>
              sortBy.findIndex((s) => s === item.name.key),
            );
          }
        }
        break;
      }
      case "setFilter": {
        if (payload) {
          const { conditions = [] } = payload;
          const searchConditions = state.filter(
            (item) => item.type !== "fromFilter",
          );
          const filterConditions: ICondition[] = conditions.map((item) => ({
            ...item,
            type: "fromFilter",
          }));
          result = _.concat(searchConditions, filterConditions);
        }
        break;
      }
      case "clear": {
        result = [];
        bus.emit(`${cacheName}-tag-clear`);
        break;
      }
      default:
        throw new Error("No matching action type!");
    }
    setCache(result);
    return result;
  };
  const [conditions, dispatch] = useReducer(searchReducer, cache || []);

  // 清除缓存
  // 如果当前view是main，则需要清除resource不同的缓存
  // 如果当前view是sub，则不需要清除缓存
  useMount(() => {
    if (view === "main") {
      const clearList: string[] = [];
      for (const key in sessionStorage) {
        if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
          if (key.endsWith("search-conditions") && !key.startsWith(resource)) {
            clearList.push(key);
          }
        }
      }
      clearList.forEach((key) => {
        sessionStorage.removeItem(key);
      });
    }
  });

  return {
    searchId: cacheName,
    conditions,
    dispatch,
  };
}
