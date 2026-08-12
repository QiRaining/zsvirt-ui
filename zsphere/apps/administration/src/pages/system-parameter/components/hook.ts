import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { cloneDeep as _cloneDeep, pull as _pull } from "lodash-es";

/**
 * localstorage 存取 用户搜索历史
 */
export const useRecordSearchHistory = () => {
  // 该文件有可能在子应用下运行(逻辑可复用于 virtualization-administration 子应用), 所有加个判断
  // @ts-expect-error
  const runInSlaveState = usePlatformStore();
  const runInMasterState = usePlatformStore();
  const { currentUser, searchHistory, setSearchHistory } =
    runInMasterState || runInSlaveState;
  const userUuid = currentUser?.userUuid || "";

  const getHistoryLengthLimit = (type: string) => {
    switch (type) {
      case "header":
        return 10;
      case "doc":
        return 5;
      case "global-config":
        return 20;
      default:
        return 10;
    }
  };

  const getSearchHistory = (type: string) => {
    return searchHistory?.[userUuid]?.[type] ?? [];
  };

  return {
    getSearchHistory,
    setSearchHistory: (val: string, type: string) => {
      const currentUserSearchHistory = searchHistory?.[userUuid];
      const limit = getHistoryLengthLimit(type);
      let currentHistory = _cloneDeep(getSearchHistory(type));
      currentHistory = _pull(currentHistory, val);
      currentHistory.unshift(val);
      currentHistory = currentHistory.slice(0, limit);
      setSearchHistory({
        ...searchHistory,
        [userUuid]: {
          ...currentUserSearchHistory,
          [type]: currentHistory,
        },
      });
    },
    clearSearchHistory: (type: string) => {
      const currentUserSearchHistory = searchHistory?.[userUuid];
      setSearchHistory({
        ...searchHistory,
        [userUuid]: {
          ...currentUserSearchHistory,
          [type]: [],
        },
      });
    },
    clearHistory: () => {
      setSearchHistory({
        ...searchHistory,
        [userUuid]: {},
      });
    },
  };
};
