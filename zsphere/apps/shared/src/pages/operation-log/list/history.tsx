import { useApolloClient } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import {
  UPLOAD_OPERATION_LOG_REFETCH_EVENT,
  useActionSubscribe,
} from "@zstack/zsphere-hooks";
import type { IListProps } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useColumnConfig, useActionConfig, useQueryConfig } from "../config";
import OperationDetail from "../detail";
import {
  OperationLogUploadSessionProvider,
  useOperationLogUploadSessions,
} from "../upload-session-context";
import { QUERY_OPERATION_LOG_LIST } from "./index";
import {
  createOperationLogRefreshHandler,
  refetchOperationLogList,
} from "./operation-log-refresh";

const OperationLogListContent: React.FC<IListProps<OperationLog>> = (props) => {
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [actionId, setActionId] = useState<string>("");
  const isModalOpen = useRef(false);
  const apolloClient = useApolloClient();
  const { refreshUploadSessions } = useOperationLogUploadSessions();

  const columnConfig = useColumnConfig({
    setActionId,
    setVisible: setDetailVisible,
    view: props.view,
  });

  const onVisibleChange = useCallback((visible: boolean) => {
    // 模态框打开时,停止刷新界面
    isModalOpen.current = visible;
  }, []);

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
    resourceTypeList: [], // 监听所有资源类型
    onFinish() {
      _refetch();
    },
  });

  const queryConfig = useQueryConfig(props);

  return (
    <>
      <TableList
        rowKey="actionId"
        type="OperationLog"
        rowSelection={false}
        toolbar={["search", "export"]}
        gql={QUERY_OPERATION_LOG_LIST}
        resource="operation.log"
        actionConfig={actionConfig}
        columnConfig={columnConfig}
        queryConfig={queryConfig}
        {...props}
      />
      <OperationDetail
        visible={detailVisible}
        setVisible={setDetailVisible}
        actionId={actionId}
      />
    </>
  );
};

const OperationLogList: typeof OperationLogListContent = (props) => (
  <OperationLogUploadSessionProvider>
    <OperationLogListContent {...props} />
  </OperationLogUploadSessionProvider>
);

export default OperationLogList;
