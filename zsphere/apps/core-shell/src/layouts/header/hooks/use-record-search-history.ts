import { usePlatformStore } from "@zstack/zsphere-platform-store";

/**
 * localstorage 存取 用户搜索历史
 * 使用原生方法替代 lodash 优化 bundle size
 */
const useRecordSearchHistory = () => {
  // 分开订阅，避免创建新对象导致不必要的重渲染
  // 该文件有可能在子应用下运行(逻辑可复用于 virtualization-administration 子应用), 所有加个判断
  // @ts-expect-error
  const currentUser = usePlatformStore((state) => state.currentUser);
  // @ts-expect-error
  const searchHistory = usePlatformStore((state) => state.searchHistory);
  // @ts-expect-error
  const setSearchHistory = usePlatformStore((state) => state.setSearchHistory);

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

  // 使用原生浅拷贝替代 cloneDeep，减少 bundle size
  const shallowClone = <T>(obj: T): T => {
    if (Array.isArray(obj)) {
      return [...obj] as unknown as T;
    }
    if (obj && typeof obj === "object") {
      return { ...obj } as T;
    }
    return obj;
  };

  // 使用原生 filter 替代 pull，减少依赖
  const removeItem = <T>(arr: T[], item: T): T[] => {
    return arr.filter((i) => i !== item);
  };

  return {
    getSearchHistory,
    setSearchHistory: (val: string, type: string) => {
      const currentUserSearchHistory = searchHistory?.[userUuid];
      const limit = getHistoryLengthLimit(type);
      let currentHistory = shallowClone(getSearchHistory(type));
      currentHistory = removeItem(currentHistory, val);
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

export default useRecordSearchHistory;
