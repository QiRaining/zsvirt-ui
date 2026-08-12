import type {
  OperationApi,
  OperationTask,
} from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

import { CurrentApiListTile } from "../components/current-api-list-tile";

export const useCurrentApiList = (
  showApiDetail: (operationApi: OperationApi) => void,
  currentTask?: OperationTask,
) => {
  return useMemo(() => {
    return (
      currentTask?.operationApis?.map((operationApi: OperationApi) => ({
        label: operationApi.name ?? "",
        value: (
          <CurrentApiListTile
            operationApi={operationApi}
            showApiDetail={showApiDetail}
          />
        ),
      })) ?? []
    );
  }, [currentTask, showApiDetail]);
};
