import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity } from "@zstack/zsphere-types";
import { useMemo } from "react";

export default function useUserIdentity() {
  const currentUser = usePlatformStore((state) => state.currentUser);

  // 系统管理员
  const isSystemAdmin = useMemo(() => {
    return (
      currentUser.currentIdentity === Identity.Admin &&
      currentUser?.accountUuid === "36c27e8ff05c4780bf6d2fa65700f22e"
    );
  }, [currentUser]);

  // 基于IAM1创建管理员
  const isPlatformAdmin = useMemo(() => {
    return (
      currentUser.currentIdentity === Identity.Admin &&
      currentUser?.accountUuid !== "36c27e8ff05c4780bf6d2fa65700f22e"
    );
  }, [currentUser]);

  const isNormalAccount = useMemo(() => {
    return currentUser.currentIdentity === Identity.NormalAccount;
  }, [currentUser]);

  return {
    isSystemAdmin,
    isPlatformAdmin,
    isNormalAccount,
  };
}
