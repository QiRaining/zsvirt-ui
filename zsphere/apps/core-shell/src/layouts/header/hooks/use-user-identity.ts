import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity } from "@zstack/zsphere-types";
import { useMemo } from "react";

export const useUserIdentity = () => {
  // 分开订阅，避免订阅整个 store
  // 该文件有可能在子应用下运行
  // @ts-expect-error platform-store selector type is not exported for sub-app usage.
  const currentUser = usePlatformStore((state) => state.currentUser);

  // 提取 primitive 依赖项，避免对象引用导致的重渲染
  const accountUuid = currentUser?.accountUuid;
  const currentIdentity = currentUser?.currentIdentity;
  const sessionId = currentUser?.sessionId;

  // 系统管理员
  const isSystemAdmin = useMemo(() => {
    return (
      currentIdentity === Identity.Admin &&
      accountUuid === "36c27e8ff05c4780bf6d2fa65700f22e"
    );
  }, [currentIdentity, accountUuid]);

  // 基于IAM1创建管理员
  const isPlatformAdmin = useMemo(() => {
    return (
      currentIdentity === Identity.Admin &&
      accountUuid !== "36c27e8ff05c4780bf6d2fa65700f22e"
    );
  }, [currentIdentity, accountUuid]);

  const isNormalAccount = useMemo(() => {
    return currentIdentity === Identity.NormalAccount;
  }, [currentIdentity]);

  return {
    isSystemAdmin,
    isPlatformAdmin,
    isNormalAccount,
    sessionId,
  };
};
