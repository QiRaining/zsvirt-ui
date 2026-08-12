import type { ZsvRole } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { isSodOrResourceViewerRole } from "zsv_administration_shared/role/utils";

import { getRoleFilterConfig } from "./role-config-resolver";
import type { RoleFilterConfig } from "./types";

/**
 * 角色过滤配置 Hook
 * 根据角色类型返回对应的菜单/操作过滤配置
 */
export function useRoleFilterConfig(detail?: ZsvRole): RoleFilterConfig {
  const isSodOrViewer = isSodOrResourceViewerRole(detail?.uuid as string);

  return useMemo(() => getRoleFilterConfig(isSodOrViewer), [isSodOrViewer]);
}
