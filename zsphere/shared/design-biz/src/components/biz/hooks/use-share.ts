"use client";

import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity } from "@zstack/zsphere-types";
import { useCallback } from "react";

/**
 * 资源对象接口
 */
export interface ShareResource {
  owner?: {
    uuid?: string;
  };
  [key: string]: unknown;
}

/**
 * useShare Hook 返回值
 */
export interface UseShareReturn {
  /** 判断资源列表是否为共享资源 */
  isShareResource: (resourceList: ShareResource[]) => boolean;
  /** 验证单个资源是否为共享资源 */
  verifyShareResource: (current: ShareResource) => boolean;
}

/**
 * useShare Hook
 *
 * 用于判断资源是否为共享资源（非当前用户所有）
 *
 * @example
 * ```tsx
 * const { isShareResource, verifyShareResource } = useShare();
 *
 * if (isShareResource(resourceList)) {
 *   // 处理共享资源逻辑
 * }
 * ```
 */
export const useShare = (): UseShareReturn => {
  const { currentUser } = usePlatformStore();

  const isShareResource = useCallback(
    (resourceList: ShareResource[]) =>
      [Identity.Admin, Identity.PlatformAdmin].indexOf(
        currentUser.currentIdentity!,
      ) === -1 &&
      resourceList.every(
        (resource) => resource?.owner?.uuid !== currentUser.accountUuid,
      ),
    [currentUser],
  );

  const verifyShareResource = useCallback(
    (current: ShareResource) =>
      [Identity.Admin, Identity.PlatformAdmin].indexOf(
        currentUser.currentIdentity!,
      ) === -1 && current?.owner?.uuid !== currentUser.accountUuid,
    [currentUser],
  );

  return { isShareResource, verifyShareResource };
};

export default useShare;
