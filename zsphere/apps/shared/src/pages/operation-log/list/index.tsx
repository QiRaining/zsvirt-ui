import { gql, useApolloClient } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import {
  UPLOAD_OPERATION_LOG_REFETCH_EVENT,
  useActionSubscribe,
} from "@zstack/zsphere-hooks";
import type { IListProps } from "@zstack/zsphere-types";
import type { OperationLog as IOperationLog } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";
import OperationDetail from "../detail";
import {
  OperationLogUploadSessionProvider,
  useOperationLogUploadSessions,
} from "../upload-session-context";
import {
  createOperationLogRefreshHandler,
  refetchOperationLogList,
} from "./operation-log-refresh";

export const QUERY_OPERATION_LOG_LIST = gql`
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
        loginIp
        actionId
        name
        status
        createDate
        lastOpDate
        accountName
        userName
        isValid
        progress
        longjobs {
          longJobUuid
          clientJobUuid
          jobName
          resourceType
          state
          progress
          data
          createDate
          lastOpDate
        }
        resourceNames
        operationTasks {
          actionId
          taskId
          status
          createDate
          lastOpDate
          operationApis {
            longjob {
              longJobUuid
              clientJobUuid
              jobName
              resourceType
              state
              progress
              createDate
              lastOpDate
            }
            resourceName
            taskId
            apiId
            name
            status
            req
            resp
            createDate
            lastOpDate
          }
        }
      }
    }
  }
`;

const OperationListContent: React.FC<
  IListProps<IOperationLog> &
    Pick<
      ITableListProps<IOperationLog>,
      "pagination" | "toolbar" | "fixHeaderOnTop" | "footer" | "disabledLoading"
    >
> = (props) => {
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [actionId, setActionId] = useState<string>("");
  const isModalOpen = useRef(false);
  const apolloClient = useApolloClient();
  const { refreshUploadSessions } = useOperationLogUploadSessions();
  const onVisibleChange = useCallback((visible: boolean) => {
    // 模态框打开时,停止刷新界面
    isModalOpen.current = visible;
  }, []);

  const queryConfig = useQueryConfig(props);
  const columnConfig = useColumnConfig({
    setActionId,
    setVisible: setDetailVisible,
    view: props.view,
  });
  const actionConfig = useActionConfig({ onVisibleChange });

  const _refetch = useMemo(
    () =>
      createOperationLogRefreshHandler({
        isBlocked: () => isModalOpen.current,
        refreshOperationLogs: () => refetchOperationLogList(apolloClient),
        refreshRunningTasks: () => bus.emit("action:refetch:running"),
        refreshUploadSessions,
      }),
    [apolloClient, refreshUploadSessions],
  );
  const _refetchUploadSessions = useMemo(
    () =>
      createOperationLogRefreshHandler({
        isBlocked: () => isModalOpen.current,
        refreshOperationLogs: () => refetchOperationLogList(apolloClient),
        refreshRunningTasks: () => bus.emit("action:refetch:running"),
        refreshUploadSessions,
        includeUploadSessions: true,
      }),
    [apolloClient, refreshUploadSessions],
  );

  useEffect(() => {
    bus.addListener("operationLogProgress", _refetch);
    bus.addListener(UPLOAD_OPERATION_LOG_REFETCH_EVENT, _refetchUploadSessions);
    return () => {
      bus.removeListener("operationLogProgress", _refetch);
      bus.removeListener(
        UPLOAD_OPERATION_LOG_REFETCH_EVENT,
        _refetchUploadSessions,
      );
    };
  }, [_refetch, _refetchUploadSessions]);

  useActionSubscribe({
    resourceTypeList: ["Image", "VmInstance"], // 监听所有资源类型
    onFinish() {
      _refetch();
    },
  });

  return (
    <>
      <TableList
        rowKey="actionId"
        {...props}
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={QUERY_OPERATION_LOG_LIST}
        type="running"
        resource="operation.log"
        fixHeaderOnTop={true}
      />
      <OperationDetail
        visible={detailVisible}
        setVisible={setDetailVisible}
        actionId={actionId}
      />
    </>
  );
};

const OperationList: typeof OperationListContent = (props) => (
  <OperationLogUploadSessionProvider>
    <OperationListContent {...props} />
  </OperationLogUploadSessionProvider>
);

export default React.memo(OperationList);
