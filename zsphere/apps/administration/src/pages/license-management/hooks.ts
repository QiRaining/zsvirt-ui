import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity } from "@zstack/zsphere-types";
import _ from "lodash-es";
import { useMemo } from "react";

export const useUserIdentity = () => {
  // @ts-expect-error
  const runInMasterState = usePlatformStore();
  // @ts-expect-error
  const runInSlaveState = usePlatformStore();

  const { currentUser } = runInMasterState || runInSlaveState;

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
};

export const useLicenseAccess = (licenseInfo?: any) => {
  const { isSystemAdmin } = useUserIdentity();

  const isDualManagementNode =
    licenseInfo?.dualManagementNodeInfo?.licenses?.length > 1 ||
    licenseInfo?.hostNameList?.length > 1;

  // 双管理节点 MN 状态都是running 才是合法状态，单节点默认都是合法的。
  const isMnStateLegal = useMemo(() => {
    return (
      (isDualManagementNode &&
        _.every(licenseInfo?.statusList, (state) => state === "running")) ||
      !isDualManagementNode
    );
  }, [isDualManagementNode, licenseInfo?.statusList]);

  const noAccess = useMemo(() => {
    return !isSystemAdmin || !isMnStateLegal;
  }, [isSystemAdmin, isMnStateLegal]);

  return {
    isSystemAdmin,
    isMnStateLegal,
    noAccess,
  };
};
