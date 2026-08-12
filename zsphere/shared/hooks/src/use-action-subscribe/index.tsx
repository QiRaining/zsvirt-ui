import type { IActionSubscribe } from "@zstack/zsphere-types";
import type { ActionTaskResult } from "@zstack/zsphere-types/graphql";
import { useEffect } from "react";
import type { Subject } from "rxjs";
import { filter } from "rxjs/operators";

const useActionSubscribe: (params: IActionSubscribe) => void = ({
  resourceTypeList = [],
  onProgress,
  onFinish,
  onlyCurrentWindow = false,
}) => {
  const actionRespSubject = (window as any).g_action_subscribe as Subject<{
    data: ActionTaskResult;
    type: "progress" | "finish";
    isCurrentWindow?: boolean;
  }>;
  useEffect(() => {
    const subscription = actionRespSubject
      .pipe(
        filter(({ data }) => {
          // 如果 resourceTypeList 为空，监听所有资源类型
          if (resourceTypeList.length === 0) {
            return true;
          }

          const { type: resourceType, listenerType } = data;
          let result = false;
          if (listenerType) {
            result = result || resourceTypeList.includes(listenerType);
          }
          if (resourceType) {
            result = result || resourceTypeList.includes(resourceType);
          }
          return result;
        }),
        filter(({ isCurrentWindow = true }) => {
          if (onlyCurrentWindow) {
            return isCurrentWindow;
          }
          return true;
        }),
      )
      .subscribe(
        ({
          data,
          type,
          isCurrentWindow = true,
        }: {
          data: ActionTaskResult;
          type: "progress" | "finish";
          isCurrentWindow?: boolean;
        }) => {
          if (type === "progress") {
            onProgress?.(data, isCurrentWindow);
          }
          if (type === "finish") {
            onFinish?.(data.type!, isCurrentWindow);
          }
        },
      );
    return () => subscription.unsubscribe();
  }, [
    actionRespSubject,
    onFinish,
    onProgress,
    resourceTypeList,
    onlyCurrentWindow,
  ]);
};

export default useActionSubscribe;
