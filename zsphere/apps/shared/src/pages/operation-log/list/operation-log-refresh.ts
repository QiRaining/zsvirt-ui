export const OPERATION_LOG_LIST_QUERY_NAME = "operationLogList";

interface OperationLogQueryRefetcher {
  refetchQueries: (options: { include: string[] }) => unknown;
}

interface UploadSessionRefreshOptions {
  force?: boolean;
}

interface OperationLogRefreshHandlerOptions {
  isBlocked: () => boolean;
  refreshOperationLogs: () => unknown;
  refreshRunningTasks: () => unknown;
  refreshUploadSessions?: (options?: UploadSessionRefreshOptions) => unknown;
  includeUploadSessions?: boolean;
}

export const refetchOperationLogList = (client: OperationLogQueryRefetcher) => {
  return client.refetchQueries({
    include: [OPERATION_LOG_LIST_QUERY_NAME],
  });
};

export const createOperationLogRefreshHandler = ({
  isBlocked,
  refreshOperationLogs,
  refreshRunningTasks,
  refreshUploadSessions,
  includeUploadSessions = false,
}: OperationLogRefreshHandlerOptions) => {
  return () => {
    if (isBlocked()) {
      return;
    }

    refreshRunningTasks();
    void refreshOperationLogs();
    if (includeUploadSessions) {
      void refreshUploadSessions?.({ force: true });
    }
  };
};
