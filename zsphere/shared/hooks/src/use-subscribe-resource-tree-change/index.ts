import type { ActionTaskResult } from "@zstack/zsphere-types/graphql";
import { useEffect } from "react";
import type { Subject } from "rxjs";
import { filter } from "rxjs/operators";

const useSubscribeOrgTreeChange: (params: any) => void = ({
  resourceTypeList = [],
  onProgress,
  onFinish,
}) => {
  const actionRespSubject = window.g_action_subscribe as Subject<{
    data: ActionTaskResult;
    type: "progress" | "finish";
  }>;
  useEffect(() => {
    if (resourceTypeList.length === 0) {
      return;
    }
    const subscription = actionRespSubject
      .pipe(
        filter(({ data }) => {
          const { type: resourceType } = data;
          if (resourceType) {
            return resourceTypeList.includes(resourceType);
          }
          return false;
        }),
      )
      .subscribe(({ data, type }: { data: any; type: any }) => {
        if (type === "progress") {
          onProgress?.(data);
        }
        if (type === "finish") {
          onFinish?.(data);
        }
      });
    return () => subscription.unsubscribe();
  }, [actionRespSubject, onFinish, onProgress, resourceTypeList]);
};

export default useSubscribeOrgTreeChange;
