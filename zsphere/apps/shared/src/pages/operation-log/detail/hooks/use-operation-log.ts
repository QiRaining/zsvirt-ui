import { useQuery } from "@apollo/client";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  OperationLog,
  QueryOperationLogResp,
} from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

import { QUERY_OPERATION_LOG_LIST } from "../../list";

export const useOperationLog = (actionId?: string) => {
  const query = useMemo<IQuery>(() => {
    return {
      conditions: [
        {
          key: "actionId",
          value: actionId,
          op: Op.eq,
        },
      ],
    };
  }, [actionId]);
  const { data, loading, refetch } = useQuery<
    { operationLogList: QueryOperationLogResp },
    IQuery
  >(QUERY_OPERATION_LOG_LIST, {
    variables: query,
  });

  const operationLog = useMemo<OperationLog | undefined>(() => {
    const { list = [] } = data?.operationLogList || {};
    return list[0];
  }, [data]);
  return { data, loading, refetch, operationLog };
};
