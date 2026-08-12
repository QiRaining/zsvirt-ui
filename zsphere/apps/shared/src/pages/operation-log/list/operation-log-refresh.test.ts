import { describe, expect, it, vi } from "vitest";

import {
  createOperationLogRefreshHandler,
  OPERATION_LOG_LIST_QUERY_NAME,
  refetchOperationLogList,
} from "./operation-log-refresh";

describe("operation log refresh bridge", () => {
  it("refetches the active operationLogList query by operation name", () => {
    const client = {
      refetchQueries: vi.fn(),
    };

    refetchOperationLogList(client);

    expect(client.refetchQueries).toHaveBeenCalledWith({
      include: [OPERATION_LOG_LIST_QUERY_NAME],
    });
  });

  it("lets Apollo refresh every active operationLogList instance by query name", () => {
    const client = {
      refetchQueries: vi.fn(() => ["top-table", "bottom-drawer"]),
    };

    expect(refetchOperationLogList(client)).toEqual([
      "top-table",
      "bottom-drawer",
    ]);
    expect(client.refetchQueries).toHaveBeenCalledWith({
      include: [OPERATION_LOG_LIST_QUERY_NAME],
    });
  });

  it("refreshes operation logs and running tasks without refreshing upload sessions by default", () => {
    const refreshOperationLogs = vi.fn();
    const refreshRunningTasks = vi.fn();
    const refreshUploadSessions = vi.fn();
    const handler = createOperationLogRefreshHandler({
      isBlocked: () => false,
      refreshOperationLogs,
      refreshRunningTasks,
      refreshUploadSessions,
    });

    handler();

    expect(refreshRunningTasks).toHaveBeenCalledTimes(1);
    expect(refreshOperationLogs).toHaveBeenCalledTimes(1);
    expect(refreshUploadSessions).not.toHaveBeenCalled();
  });

  it("refreshes upload sessions with force when explicitly configured", () => {
    const refreshOperationLogs = vi.fn();
    const refreshRunningTasks = vi.fn();
    const refreshUploadSessions = vi.fn();
    const handler = createOperationLogRefreshHandler({
      isBlocked: () => false,
      refreshOperationLogs,
      refreshRunningTasks,
      refreshUploadSessions,
      includeUploadSessions: true,
    });

    handler();

    expect(refreshRunningTasks).toHaveBeenCalledTimes(1);
    expect(refreshOperationLogs).toHaveBeenCalledTimes(1);
    expect(refreshUploadSessions).toHaveBeenCalledWith({ force: true });
  });

  it("skips refresh while operation detail modal is open", () => {
    const refreshOperationLogs = vi.fn();
    const refreshRunningTasks = vi.fn();
    const refreshUploadSessions = vi.fn();
    const handler = createOperationLogRefreshHandler({
      isBlocked: () => true,
      refreshOperationLogs,
      refreshRunningTasks,
      refreshUploadSessions,
    });

    handler();

    expect(refreshRunningTasks).not.toHaveBeenCalled();
    expect(refreshOperationLogs).not.toHaveBeenCalled();
    expect(refreshUploadSessions).not.toHaveBeenCalled();
  });
});
