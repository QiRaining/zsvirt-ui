import { gql, useQuery } from "@apollo/client";
import { useAuthMap } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { bus } from "@zstack/zsphere-utils";
import { useEffect, useState, useRef, useCallback } from "react";

// 原生实现 union - 合并数组并去重
function union<T>(...arrays: T[][]): T[] {
  return [...new Set(arrays.flat())];
}

const queryUIPrivilege = gql`
  query uiPrivilege {
    uiPrivilege {
      uiPrivileges
    }
  }
`;

// 使用 useRef 来避免 useAuthMap 的订阅导致的重渲染
export function useClearAuthCache() {
  const [, setAuthList] = useAuthMap();

  // 分开订阅，避免创建新数组导致不必要的重渲染
  const currentUser = usePlatformStore((state) => state.currentUser);
  const setAuthMap = usePlatformStore((state) => state.setAuthMap);

  const { sessionId } = currentUser ?? {};

  // 使用 ref 来追踪是否已经清理过，避免重复清理
  const hasClearedRef = useRef(false);

  useEffect(() => {
    if (!sessionId && !hasClearedRef.current) {
      hasClearedRef.current = true;
      setAuthList([], true);
      setAuthMap(undefined);

      localStorage.removeItem("debug-i18n");
      localStorage.removeItem("debug-auth");
      localStorage.removeItem("debug-tooltip");
      localStorage.removeItem("debug-config-type");
      localStorage.removeItem("experiment-navigation");
      localStorage.removeItem("debug-config-type-list");
      localStorage.removeItem("debug-branch");
      localStorage.removeItem("debug");

      sessionStorage.removeItem("global-alert");
    } else if (sessionId) {
      // 重置标记，以便下次登出时可以再次清理
      hasClearedRef.current = false;
    }
  }, [sessionId, setAuthList, setAuthMap]);
}

// 全局标记，防止多个组件实例重复初始化
let isAuthInitialized = false;

function useFetchAuthFromUIServer() {
  const { data, loading, refetch } = useQuery(queryUIPrivilege, {
    // 防止组件重新挂载时重复请求
    fetchPolicy: isAuthInitialized ? "cache-first" : "cache-and-network",
  });
  const [, setAuthList] = useAuthMap();
  // 直接订阅方法，避免创建新数组导致不必要的重渲染
  const setAuthMap = usePlatformStore((state) => state.setAuthMap);
  const [removeList, setRemoveList] = useState<string[]>([]);

  // 使用 ref 追踪事件监听器是否已注册
  const listenersRegistered = useRef(false);

  // 使用 useCallback 创建稳定的事件处理函数
  const handleAddRemoveAuthList = useCallback((authList: string[]) => {
    setRemoveList((prev) => union(authList.concat(prev)));
  }, []);

  const handleRefetchAuthList = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleClearRemoveAuthList = useCallback((authList: string[]) => {
    setRemoveList((prev) =>
      prev.filter((auth) => authList.indexOf(auth) === -1),
    );
  }, []);

  // 事件监听器只注册一次
  useEffect(() => {
    if (listenersRegistered.current) {
      return;
    }
    listenersRegistered.current = true;

    bus.addListener("ADD_REMOVE_AUTHLIST", handleAddRemoveAuthList);
    bus.addListener("REFETCH_AUTHLIST", handleRefetchAuthList);
    bus.addListener("CLEAR_REMOVE_AUTHLIST", handleClearRemoveAuthList);

    return () => {
      bus.removeListener("ADD_REMOVE_AUTHLIST", handleAddRemoveAuthList);
      bus.removeListener("CLEAR_REMOVE_AUTHLIST", handleClearRemoveAuthList);
      bus.removeListener("REFETCH_AUTHLIST", handleRefetchAuthList);
      listenersRegistered.current = false;
    };
  }, [
    handleAddRemoveAuthList,
    handleRefetchAuthList,
    handleClearRemoveAuthList,
  ]);

  // 使用 ref 来追踪是否已经设置过 authMap，避免重复设置
  const hasSetAuthMapRef = useRef(false);
  const prevDataRef = useRef<typeof data>(null);

  // 数据更新逻辑
  useEffect(() => {
    if (!loading && data) {
      // 只在数据实际变化时才更新
      if (data === prevDataRef.current && hasSetAuthMapRef.current) {
        return;
      }
      prevDataRef.current = data;
      hasSetAuthMapRef.current = true;

      const list = data?.uiPrivilege?.uiPrivileges.filter(
        (auth: string[]) => removeList.indexOf(auth[0]) === -1,
      );
      setAuthList(list);
      setAuthMap?.(new Map(list));
      localStorage.setItem("authList", JSON.stringify(list));
      isAuthInitialized = true;
    }
  }, [setAuthList, setAuthMap, data, loading, removeList]);
}

export function useAuth() {
  useFetchAuthFromUIServer();
}

// 用于在登出时重置初始化状态
export function resetAuthInitialized() {
  isAuthInitialized = false;
}
