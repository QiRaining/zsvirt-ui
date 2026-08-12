import { useCallback } from "react";

import type { SubActionGroup } from "./types";
import { useActionRegistry } from "./use-action-registry";

/**
 * 获取资源类型的子操作配置
 * 独立于权限构建逻辑，仅提供子操作查询
 */
export function useSubAction() {
  const { subActionConfig } = useActionRegistry();

  const getSubAction = useCallback(
    (resourceType: string): Record<string, SubActionGroup> | undefined =>
      subActionConfig?.[resourceType],
    [subActionConfig],
  );

  return { getSubAction };
}
