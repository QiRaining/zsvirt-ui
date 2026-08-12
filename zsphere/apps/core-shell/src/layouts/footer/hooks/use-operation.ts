import { useLazyQuery } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { QueryOperationLogResp } from "@zstack/zsphere-types/graphql";
import { useEffect, useMemo } from "react";

import { operationLogList } from "../../../gql/footer.gql";

export const useOperation = () => {
  // 分开订阅每个状态字段，避免订阅整个 currentUser 对象
  const currentUser = usePlatformStore((state) => state.currentUser);
  const userUuid = currentUser?.userUuid;

  const isAdmin = useMemo(
    () => userUuid === "36c27e8ff05c4780bf6d2fa65700f22e",
    [userUuid],
  );

  const specConditions: IQuery["conditions"] = useMemo(() => {
    if (isAdmin) {
      return [];
    }
    return [
      {
        key: "userId",
        op: Op.eq,
        value: userUuid,
      },
    ];
  }, [isAdmin, userUuid]);

  const [queryRunnningTask, { data: runnningTaskData }] = useLazyQuery<
    { operationLogList: QueryOperationLogResp },
    IQuery
  >(operationLogList, {
    variables: {
      conditions: [
        {
          key: "status",
          op: Op.in,
          values: ["Running", "Suspended"],
        },
        ...(specConditions as any),
      ],
      start: 0,
      limit: 50,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    queryRunnningTask();
  }, [specConditions, queryRunnningTask]);

  const runnningTaskCount: number = useMemo(
    () => runnningTaskData?.operationLogList?.list?.length || 0,
    [runnningTaskData],
  );

  return { runnningTaskCount, refetchRunningCount: queryRunnningTask };
};
