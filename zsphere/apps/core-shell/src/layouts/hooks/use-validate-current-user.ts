import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useEffect } from "react";

import { isPublicPath } from "../../utils/isPublicPath";

export function useValidateCurrentUser() {
  // 使用选择器只订阅 currentUser，避免订阅整个 store
  const currentUser = usePlatformStore((state) => state.currentUser);

  useEffect(() => {
    // 将条件检查移入 useEffect 中，避免在组件主体中直接调用
    if (
      !currentUser?.accountUuid &&
      !isPublicPath() &&
      !window.location.pathname.startsWith("/virtualization-wizard")
    ) {
      console.log("No account info, redirect to login.");
      window.location.href = `/login?redirect=${window.location.pathname}${window.location.search}`;
    }
  }, [currentUser?.accountUuid]);
}
