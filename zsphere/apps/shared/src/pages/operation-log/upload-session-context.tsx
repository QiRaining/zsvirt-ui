import {
  type UploadSession,
  type ResumableUploadSessionRefreshOptions,
  type UploadSessionStatus,
  useResumableUploadSessions,
} from "@zstack/zsphere-hooks";
import React, { createContext, useCallback, useContext, useMemo } from "react";

const ACTIVE_UPLOAD_SESSION_STATUSES: UploadSessionStatus[] = [
  "UPLOADING",
  "WAITING_FOR_FILE_CHECK",
  "RETRY_WAITING",
  "RETRYING",
  "RETRY_READY",
  "WAITING_FOR_FILE",
  "PAUSED",
  "RETRY_EXHAUSTED",
];

interface OperationLogUploadSessionContextValue {
  uploadSessions: UploadSession[];
  getUploadSession: (longJobUuid?: string) => UploadSession | undefined;
  refreshUploadSessions: (
    options?: ResumableUploadSessionRefreshOptions,
  ) => Promise<void>;
}

const OperationLogUploadSessionContext =
  createContext<OperationLogUploadSessionContextValue>({
    uploadSessions: [],
    getUploadSession: () => undefined,
    refreshUploadSessions: async () => {},
  });

export const OperationLogUploadSessionProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const { sessions: uploadSessions, refreshUploadSessions } =
    useResumableUploadSessions();

  const uploadSessionMap = useMemo(() => {
    return uploadSessions.reduce<Record<string, UploadSession>>(
      (sessionMap, session) => {
        if (
          session.longJobUuid &&
          session.resumable &&
          ACTIVE_UPLOAD_SESSION_STATUSES.includes(session.status)
        ) {
          sessionMap[session.longJobUuid] = session;
        }
        return sessionMap;
      },
      {},
    );
  }, [uploadSessions]);

  const getUploadSession = useCallback(
    (longJobUuid?: string) =>
      longJobUuid ? uploadSessionMap[longJobUuid] : undefined,
    [uploadSessionMap],
  );

  const value = useMemo(
    () => ({
      uploadSessions,
      getUploadSession,
      refreshUploadSessions,
    }),
    [getUploadSession, refreshUploadSessions, uploadSessions],
  );

  return (
    <OperationLogUploadSessionContext.Provider value={value}>
      {children}
    </OperationLogUploadSessionContext.Provider>
  );
};

export const useOperationLogUploadSessions = () =>
  useContext(OperationLogUploadSessionContext);
