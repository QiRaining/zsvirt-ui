import type { ZsvRole } from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { isSodOrResourceViewerRole } from "zsv_administration_shared/role/utils";

import { usePrivilegeBuilder } from "./use-privilege-builder";
import { useRoleFilterConfig } from "./use-role-filter-config";
import { useSubAction } from "./use-sub-action";

// Re-export decomposed hooks for direct consumption
export { usePrivilegeBuilder } from "./use-privilege-builder";
export { useSubAction } from "./use-sub-action";
export { useRoleFilterConfig } from "./use-role-filter-config";
export type {
  UIPrivilegeMap,
  ResourcePrivilege,
  PrivilegeAction,
  PrivilegeView,
  RoleFilterConfig,
  BuildPrivilegeOptions,
} from "./types";

/**
 * UI权限管理Hook（向后兼容 facade）
 *
 * 推荐直接使用分解后的 hooks:
 * - usePrivilegeBuilder: 构建权限映射
 * - useSubAction: 获取子操作配置
 * - useRoleFilterConfig: 获取过滤配置
 */
const useUIPrivilege = (detail?: ZsvRole) => {
  const { buildPrivilegeMap } = usePrivilegeBuilder();
  const { getSubAction } = useSubAction();
  const { filteredMenuKeys } = useRoleFilterConfig(detail);
  const isSodOrViewer = isSodOrResourceViewerRole(detail?.uuid as string);

  const getUIPrivilege = useCallback(
    ({ roleUuid }: { roleUuid: string }) =>
      buildPrivilegeMap({ roleUuid, isSodOrViewer }),
    [buildPrivilegeMap, isSodOrViewer],
  );

  return { getUIPrivilege, getSubAction, filteredMenuKeys };
};

export { useUIPrivilege };
