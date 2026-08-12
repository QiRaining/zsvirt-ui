import { gql, useLazyQuery } from "@apollo/client";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { QueryOperationLogResp } from "@zstack/zsphere-types/graphql";
import { useCallback, useEffect, useState } from "react";

import type { StepType, TaskStatus, MigrationPackageData } from "../types";

const operationLogList = gql`
  query operationLogList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    operationLogList(
      conditions: $conditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        actionId
        longjobs {
          jobName
        }
        operationTasks {
          operationApis {
            name
          }
        }
      }
    }
  }
`;

export const useOperationLogActionId = ({
  currentStep,
  taskStatus,
  packageData,
}: {
  currentStep: StepType;
  taskStatus: TaskStatus;
  packageData?: MigrationPackageData;
}) => {
  const [currentActionId, setCurrentActionId] = useState<string>("");

  const deriveActionId = useCallback(
    (operationLogs: QueryOperationLogResp["list"] = []) => {
      if (currentStep === "upload") {
        const operationLog = operationLogs.find((log) =>
          ["APIUploadSoftwarePackageToBackupStorageMsg"].includes(
            log?.longjobs?.[0]?.jobName ?? "",
          ),
        );
        return operationLog?.actionId ?? "";
      }

      if (currentStep === "install") {
        const operationLog = operationLogs.find((log) =>
          ["InstallSoftwarePackageAction"].includes(
            log?.operationTasks?.[0]?.operationApis?.[0]?.name ?? "",
          ),
        );
        return operationLog?.actionId ?? "";
      }

      return "";
    },
    [currentStep, packageData?.type],
  );

  const [loadOperationLogs, { loading }] = useLazyQuery<
    { operationLogList: QueryOperationLogResp },
    IQuery
  >(operationLogList, {
    variables: {
      conditions: [
        {
          key: "status",
          op: Op.in,
          values: ["Running", "Suspended", "Failed"],
        },
      ],
      start: 0,
      limit: 10,
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setCurrentActionId(deriveActionId(data?.operationLogList?.list));
    },
  });

  useEffect(() => {
    loadOperationLogs();
  }, [taskStatus, loadOperationLogs]);

  return {
    currentActionId,
    refreshActionLogs: loadOperationLogs,
    loading,
  };
};
