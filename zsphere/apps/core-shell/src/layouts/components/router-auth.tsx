import { usePlatformStore } from "@zstack/zsphere-platform-store";
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router";

import Loader from "../../loader";
import { formatter } from "../../utils/use-formatter";
import { useRouterAuth } from "../hooks";

interface RouterAuthProps {
  children: React.ReactNode;
}

const RouterAuth: React.FC<RouterAuthProps> = ({ children }) => {
  const location = useLocation();
  const { hasRouterAuth, configLoading } = useRouterAuth();

  // 分开订阅每个状态字段，避免订阅整个 store
  const currentUser = usePlatformStore((state) => state.currentUser);
  const recentVisitHistoryMap = usePlatformStore(
    (state) => state.recentVisitHistoryMap,
  );
  const setRecentVisitHistoryMap = usePlatformStore(
    (state) => state.setRecentVisitHistoryMap,
  );

  // 使用 useEffect 来处理无权限路由的移除，避免在渲染过程中修改状态
  useEffect(() => {
    if (!hasRouterAuth && !configLoading) {
      const { pathname } = location;
      const userUuid = currentUser?.userUuid;
      if (pathname && formatter(pathname) && userUuid) {
        const currentHistoryList = recentVisitHistoryMap?.[userUuid] ?? [];
        const filteredList = currentHistoryList?.filter(
          (it: string) => it !== pathname,
        );

        // 只有当列表确实发生变化时才更新状态
        if (currentHistoryList.length !== filteredList.length) {
          setRecentVisitHistoryMap({
            ...recentVisitHistoryMap,
            [userUuid]: filteredList,
          });
        }
      }
    }
  }, [
    hasRouterAuth,
    configLoading,
    location,
    currentUser,
    recentVisitHistoryMap,
    setRecentVisitHistoryMap,
  ]);

  if (configLoading) {
    return <Loader loading />;
  }

  if (!hasRouterAuth) {
    return (
      <Navigate
        to="/exception/401"
        replace
        state={{
          search: location.search,
          pathname: location.pathname,
          state: location.state,
        }}
      />
    );
  }

  return <>{children}</>;
};

export default RouterAuth;
