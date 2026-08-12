import { bus } from "@zstack/utils";
import { useEffect } from "react";

interface ActionTaskResult {
  type?: string;
  listenerType?: string;
  [key: string]: any;
}

interface IActionSubscribe {
  resourceTypeList?: string[];
  onProgress?: (result: ActionTaskResult, isCurrentWindow?: boolean) => void;
  onFinish?: (type: string, isCurrentWindow?: boolean) => void;
  onlyCurrentWindow?: boolean;
}

/**
 * useActionSubscribe Hook
 *
 * 订阅 Action 事件（进度和完成）
 *
 * 重构说明：
 * - ❌ 移除 RxJS Subject
 * - ✅ 改用 bus.addListener('action:event')
 * - ✅ 手动过滤逻辑（替代 RxJS pipe + filter）
 */
export const useActionSubscribe: (params: IActionSubscribe) => void = ({
  resourceTypeList = [],
  onProgress,
  onFinish,
  onlyCurrentWindow = false,
}) => {
  useEffect(() => {
    if (resourceTypeList.length === 0) {
      return;
    }

    const handler = (event: {
      data: ActionTaskResult;
      type: "progress" | "finish";
      isCurrentWindow?: boolean;
    }) => {
      const { data, type, isCurrentWindow = true } = event;

      // 过滤 1：资源类型匹配
      const { type: resourceType, listenerType } = data;
      let isMatch = false;
      if (listenerType) {
        isMatch = isMatch || resourceTypeList.includes(listenerType);
      }
      if (resourceType) {
        isMatch = isMatch || resourceTypeList.includes(resourceType);
      }
      if (!isMatch) {
        return;
      }

      // 过滤 2：窗口匹配
      if (onlyCurrentWindow && !isCurrentWindow) {
        return;
      }

      // 触发回调
      if (type === "progress") {
        onProgress?.(data, isCurrentWindow);
      }
      if (type === "finish") {
        onFinish?.(data.type!, isCurrentWindow);
      }
    };

    bus.addListener("action:event", handler);
    return () => bus.removeListener("action:event", handler);
  }, [onFinish, onProgress, resourceTypeList, onlyCurrentWindow]);
};
