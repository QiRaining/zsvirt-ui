import { bus } from "@zstack/zsphere-utils";

import {
  createResumableUploadSessionStore,
  type ResumableUploadSessionRefreshOptions,
  useResumableUploadSessionStore,
} from "./resumable-store";

export type UploadSessionType =
  | "image"
  | "storagePackage"
  | "migrationServicePackage";

export type UploadSessionStatus =
  | "UPLOADING"
  | "WAITING_FOR_FILE_CHECK"
  | "RETRY_WAITING"
  | "RETRYING"
  | "RETRY_READY"
  | "WAITING_FOR_FILE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED"
  | "RETRY_EXHAUSTED"
  | "EXPIRED";

export interface UploadSessionPayload {
  uploadType: UploadSessionType;
  hash: string;
  fileName?: string;
  fileSize?: number;
  lastModified?: number;
  longJobUuid: string;
  artifactUuid?: string;
  uploadUrl?: string;
  offset?: number;
  status?: UploadSessionStatus;
  errorReason?: string;
  jobName?: string;
  jobData?: string;
  actionName?: string;
  resourceType?: string;
  retryCount?: number;
  maxRetryCount?: number;
  nextRetryAt?: string | Date;
  lastRetryAt?: string | Date;
  retryStatus?: UploadSessionStatus | string;
  fileAvailable?: boolean;
  fileAvailableUntil?: string | Date;
  rootSessionId?: string;
  replacedFromLongJobUuid?: string;
  previousLongJobUuid?: string;
  retryOwner?: string;
  retryLockedUntil?: string | Date;
  expiresAt?: string | Date;
}

export interface UploadSessionUpdatePayload {
  offset?: number;
  status?: UploadSessionStatus;
  uploadUrl?: string;
  artifactUuid?: string;
  errorReason?: string;
  retryStatus?: UploadSessionStatus | string;
  fileAvailable?: boolean;
  fileAvailableUntil?: string | Date | null;
  nextRetryAt?: string | Date | null;
  expiresAt?: string | Date;
}

export interface UploadSession extends UploadSessionPayload {
  sessionId?: string;
  userUuid?: string;
  accountUuid?: string;
  status: UploadSessionStatus;
  offset: number;
  resumable: boolean;
  createDate?: string;
  lastOpDate?: string;
}

export const UPLOAD_OPERATION_LOG_REFETCH_EVENT =
  "upload:operation-log:refetch";

export const getUploadFileMetadata = (file: File) => ({
  fileName: file.name,
  fileSize: file.size,
  lastModified: file.lastModified,
});

const getSessionId = () => {
  if (typeof localStorage === "undefined") {
    return "";
  }
  return localStorage.getItem("sessionId") || "";
};

async function requestUploadSession<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-session-id": getSessionId(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Upload session request failed with ${response.status}`);
  }

  return response.json();
}

const notifyUploadSessionChanged = () => {
  try {
    bus?.emit("action:refetch:running");
    bus?.emit(UPLOAD_OPERATION_LOG_REFETCH_EVENT);
  } catch {
    // Notification failures should not change the upload-session request result.
  }

  try {
    void refreshResumableUploadSessions({ force: true }).catch(() => null);
  } catch {
    // Refresh is a best-effort side effect after the session mutation succeeds.
  }
};

export const registerUploadSession = (payload: UploadSessionPayload) =>
  requestUploadSession<UploadSession>("/api/upload-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((session) => {
    notifyUploadSessionChanged();
    return session;
  });

export const updateUploadSession = (
  longJobUuid: string | undefined,
  payload: UploadSessionUpdatePayload,
) => {
  if (!longJobUuid) {
    return Promise.resolve(null);
  }

  return requestUploadSession<UploadSession>(
    `/api/upload-sessions/${longJobUuid}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  ).then((session) => {
    notifyUploadSessionChanged();
    return session;
  });
};

export const updateUploadFileAvailability = (
  longJobUuid: string | undefined,
  fileAvailable: boolean,
) => {
  if (!longJobUuid) {
    return Promise.resolve(null);
  }

  return requestUploadSession<UploadSession>(
    `/api/upload-sessions/${longJobUuid}/file-availability`,
    {
      method: "PATCH",
      body: JSON.stringify({ fileAvailable }),
    },
  );
};

export const getUploadSessionOffset = (longJobUuid: string | undefined) => {
  if (!longJobUuid) {
    return Promise.resolve(null);
  }

  return requestUploadSession<UploadSession>(
    `/api/upload-sessions/${longJobUuid}/offset`,
    {
      method: "GET",
    },
  );
};

export const getResumableUploadSessions = () =>
  requestUploadSession<UploadSession[]>("/api/upload-sessions/resumable", {
    method: "GET",
  });

export { createResumableUploadSessionStore };
export type {
  ResumableUploadSessionRefreshOptions,
  ResumableUploadSessionStore,
} from "./resumable-store";

const resumableUploadSessionStore =
  createResumableUploadSessionStore<UploadSession>({
    fetchSessions: getResumableUploadSessions,
  });

export const refreshResumableUploadSessions = (
  options?: ResumableUploadSessionRefreshOptions,
) => resumableUploadSessionStore.refresh(options);

export const useResumableUploadSessions = () =>
  useResumableUploadSessionStore(resumableUploadSessionStore);
