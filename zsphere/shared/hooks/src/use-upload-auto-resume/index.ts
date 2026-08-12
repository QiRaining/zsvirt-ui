import type {
  UploadError,
  UploadRecoverableErrorContext,
  UploadWorkerConfig,
} from "@zstack/zsphere-utils";
import { bus } from "@zstack/zsphere-utils";
import { useCallback } from "react";

import {
  UPLOAD_OPERATION_LOG_REFETCH_EVENT,
  getResumableUploadSessions,
  getUploadSessionOffset,
  updateUploadFileAvailability,
  updateUploadSession,
} from "../use-upload-session";
import useUploadTargetTime, {
  type UploadTargetTimeType,
} from "../use-upload-target-time";

type UploadHashCheckPath = string | ((hash: string) => string);

interface UploadAutoResumeOptions {
  uploadType: UploadTargetTimeType;
  hash: string;
  hashCheckPath: UploadHashCheckPath;
  jobId?: string;
}

interface UploadHashCheckResponse {
  artifactUuid?: string | null;
  hash?: string | null;
  imageUploadUrl?: string | null;
  imageUuid?: string | null;
  offset?: string | number | null;
  longJobUuid?: string | null;
  nextRetryAt?: string | Date | null;
  previousLongJobUuid?: string | null;
  replacedFromLongJobUuid?: string | null;
  rootSessionId?: string | null;
  softwarePackageUploadUrl?: string | null;
  softwarePackageUuid?: string | null;
  status?: string | null;
  uploadUrl?: string | null;
}

interface UploadAutoResumeEntry extends UploadAutoResumeOptions {
  key: string;
  attempt: number;
  upload: UploadRecoverableErrorContext["upload"];
  getUploadTargetTime: (uploadType: UploadTargetTimeType) => Promise<number>;
  timer?: ReturnType<typeof setTimeout>;
  fileAvailabilityTimer?: ReturnType<typeof setInterval>;
}

interface UploadFileAvailabilityEntry {
  key: string;
  timer?: ReturnType<typeof setInterval>;
  upload: UploadRecoverableErrorContext["upload"];
  options: UploadAutoResumeOptions;
}

const UPLOAD_AUTO_RESUME_DELAYS = [
  30 * 1000,
  2 * 60 * 1000,
  5 * 60 * 1000,
  15 * 60 * 1000,
  30 * 60 * 1000,
];
const FILE_AVAILABILITY_HEARTBEAT_INTERVAL = 60 * 1000;
const BFF_RETRY_PENDING_STATUSES = new Set([
  "WAITING_FOR_FILE",
  "WAITING_FOR_FILE_CHECK",
  "RETRY_WAITING",
  "RETRYING",
]);
const BFF_RECREATED_RUNNING_STATUSES = new Set(["RETRY_READY"]);
const DEFAULT_FETCH_TIMEOUT = 15 * 1000;
export { UPLOAD_OPERATION_LOG_REFETCH_EVENT };

const uploadAutoResumeEntries = new Map<string, UploadAutoResumeEntry>();
const uploadFileAvailabilityEntries = new Map<
  string,
  UploadFileAvailabilityEntry
>();
let onlineListenerRegistered = false;
let pageLifecycleListenerRegistered = false;

export const getUploadAutoResumeDelay = (attempt: number) =>
  UPLOAD_AUTO_RESUME_DELAYS[
    Math.min(Math.max(attempt, 0), UPLOAD_AUTO_RESUME_DELAYS.length - 1)
  ];

export const isUploadAutoResumeError = (
  error?: Pick<UploadError, "retryable" | "status">,
) => Boolean(error?.retryable);

export const resolveUploadHashCheckOffset = (
  response?: Pick<UploadHashCheckResponse, "offset">,
) => {
  const offset = Number(response?.offset);
  if (!Number.isFinite(offset) || offset < 0) {
    return 0;
  }
  return offset;
};

const resolveHashCheckPath = (
  hashCheckPath: UploadHashCheckPath,
  hash: string,
) =>
  typeof hashCheckPath === "function" ? hashCheckPath(hash) : hashCheckPath;

const getSessionId = () => {
  if (typeof localStorage === "undefined") {
    return "";
  }
  return localStorage.getItem("sessionId") || "";
};

const getCurrentUploadJobId = (
  upload?: UploadRecoverableErrorContext["upload"],
  fallbackJobId?: string,
) => upload?.getRealUuid?.() ?? fallbackJobId;

const getUploadUrlFromResponse = (response: UploadHashCheckResponse) =>
  response.uploadUrl ??
  response.imageUploadUrl ??
  response.softwarePackageUploadUrl ??
  undefined;

const getArtifactUuidFromResponse = (response: UploadHashCheckResponse) =>
  response.artifactUuid ??
  response.imageUuid ??
  response.softwarePackageUuid ??
  undefined;

const matchesExpectedLongJob = (
  response: Pick<
    UploadHashCheckResponse,
    "longJobUuid" | "previousLongJobUuid" | "replacedFromLongJobUuid"
  >,
  expectedJobId?: string,
) => {
  if (!response.longJobUuid || !expectedJobId) {
    return true;
  }

  return (
    response.longJobUuid === expectedJobId ||
    response.previousLongJobUuid === expectedJobId ||
    response.replacedFromLongJobUuid === expectedJobId
  );
};

async function fetchJson<T>(url: string): Promise<T> {
  const controller =
    typeof AbortController === "undefined" ? undefined : new AbortController();
  const timeout = controller
    ? setTimeout(() => controller.abort(), DEFAULT_FETCH_TIMEOUT)
    : undefined;
  try {
    const response = await fetch(url, {
      headers: { "x-session-id": getSessionId() },
      signal: controller?.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

async function resolveRecreatedUploadSession({
  hash,
  jobId,
}: Pick<UploadAutoResumeOptions, "hash" | "jobId">): Promise<
  UploadHashCheckResponse | undefined
> {
  if (!jobId) {
    return undefined;
  }

  try {
    const sessions = await getResumableUploadSessions();
    if (!Array.isArray(sessions)) {
      return undefined;
    }
    const recreatedSession = sessions.find(
      (session) =>
        session.hash === hash &&
        session.status === "RETRY_READY" &&
        (session.longJobUuid === jobId ||
          session.previousLongJobUuid === jobId ||
          session.replacedFromLongJobUuid === jobId),
    );

    if (!recreatedSession?.longJobUuid) {
      return undefined;
    }

    try {
      const resolvedSession = await getUploadSessionOffset(
        recreatedSession.longJobUuid,
      );
      return {
        ...recreatedSession,
        ...resolvedSession,
        longJobUuid:
          resolvedSession?.longJobUuid ?? recreatedSession.longJobUuid,
        previousLongJobUuid: recreatedSession.previousLongJobUuid,
        replacedFromLongJobUuid: recreatedSession.replacedFromLongJobUuid,
      };
    } catch {
      return recreatedSession;
    }
  } catch {
    return undefined;
  }
}

export async function resolveUploadAutoResumeCheck({
  hash,
  hashCheckPath,
  jobId,
}: Pick<
  UploadAutoResumeOptions,
  "hash" | "hashCheckPath" | "jobId"
>): Promise<UploadHashCheckResponse> {
  if (jobId) {
    try {
      const session = await getUploadSessionOffset(jobId);
      if (session) {
        return session;
      }
    } catch {
      // Fall through to the legacy hashcheck endpoint.
    }

    const recreatedSession = await resolveRecreatedUploadSession({
      hash,
      jobId,
    });
    if (recreatedSession) {
      return recreatedSession;
    }
  }

  return fetchJson<UploadHashCheckResponse>(
    resolveHashCheckPath(hashCheckPath, hash),
  );
}

export const assertUploadLongJobMatches = (
  response: Pick<
    UploadHashCheckResponse,
    "longJobUuid" | "previousLongJobUuid" | "replacedFromLongJobUuid"
  >,
  expectedJobId?: string,
) => {
  if (!matchesExpectedLongJob(response, expectedJobId)) {
    throw new Error("Upload hash belongs to another long job");
  }
};

const isBrowserOffline = () =>
  typeof navigator !== "undefined" && navigator.onLine === false;

const resolveBffRetryPendingDelay = (
  response: Pick<UploadHashCheckResponse, "nextRetryAt">,
) => {
  if (!response.nextRetryAt) {
    return undefined;
  }
  const nextRetryAt = new Date(response.nextRetryAt).getTime();
  if (!Number.isFinite(nextRetryAt)) {
    return undefined;
  }
  return Math.max(5 * 1000, nextRetryAt - Date.now() + 1000);
};

const clearEntryTimer = (entry: UploadAutoResumeEntry) => {
  if (entry.timer) {
    clearTimeout(entry.timer);
    entry.timer = undefined;
  }
};

const clearEntryFileAvailabilityTimer = (entry: UploadAutoResumeEntry) => {
  if (entry.fileAvailabilityTimer) {
    clearInterval(entry.fileAvailabilityTimer);
    entry.fileAvailabilityTimer = undefined;
  }
};

const reportUploadFileAvailability = (
  longJobUuid: string | undefined,
  fileAvailable: boolean,
) => {
  if (!longJobUuid) {
    return;
  }
  void updateUploadFileAvailability(longJobUuid, fileAvailable).catch(
    () => null,
  );
};

const notifyOperationLogRefresh = () => {
  bus.emit("action:refetch:running");
  bus.emit(UPLOAD_OPERATION_LOG_REFETCH_EVENT);
};

const markUploadWaitingForFile = (jobId: string | undefined) => {
  if (!jobId || typeof fetch === "undefined") {
    return;
  }
  void fetch(`/api/upload-sessions/${jobId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-session-id": getSessionId(),
    },
    body: JSON.stringify({
      status: "WAITING_FOR_FILE",
      fileAvailable: false,
      fileAvailableUntil: null,
    }),
    keepalive: true,
  }).catch(() => null);
};

const markActiveUploadsWaitingForFile = () => {
  uploadFileAvailabilityEntries.forEach((entry) => {
    markUploadWaitingForFile(
      getCurrentUploadJobId(entry.upload, entry.options.jobId),
    );
  });
};

const shouldResumeLongJob = (
  response: Pick<UploadHashCheckResponse, "status">,
) => !(response.status && BFF_RECREATED_RUNNING_STATUSES.has(response.status));

const startFileAvailabilityHeartbeat = (entry: UploadAutoResumeEntry) => {
  clearEntryFileAvailabilityTimer(entry);
  if (!entry.jobId) {
    return;
  }
  reportUploadFileAvailability(entry.jobId, true);
  entry.fileAvailabilityTimer = setInterval(() => {
    reportUploadFileAvailability(entry.jobId, true);
  }, FILE_AVAILABILITY_HEARTBEAT_INTERVAL);
};

const clearUploadFileAvailabilityEntry = (
  entry?: UploadFileAvailabilityEntry,
) => {
  if (!entry) {
    return;
  }
  if (entry.timer) {
    clearInterval(entry.timer);
  }
};

const stopActiveFileAvailabilityHeartbeat = (
  options: UploadAutoResumeOptions,
  upload?: UploadRecoverableErrorContext["upload"],
) => {
  const jobId = getCurrentUploadJobId(upload, options.jobId);
  const keys = new Set([
    getUploadAutoResumeKey(options),
    getUploadAutoResumeKey({ ...options, jobId }),
  ]);

  keys.forEach((key) => {
    const entry = uploadFileAvailabilityEntries.get(key);
    clearUploadFileAvailabilityEntry(entry);
    uploadFileAvailabilityEntries.delete(key);
  });
};

const startActiveFileAvailabilityHeartbeat = (
  options: UploadAutoResumeOptions,
  upload: UploadRecoverableErrorContext["upload"],
) => {
  const jobId = getCurrentUploadJobId(upload, options.jobId);
  if (!jobId) {
    return;
  }

  stopActiveFileAvailabilityHeartbeat(options, upload);
  const key = getUploadAutoResumeKey({ ...options, jobId });
  const entry: UploadFileAvailabilityEntry = {
    key,
    options: { ...options, jobId },
    upload,
  };
  ensurePageLifecycleListener();
  reportUploadFileAvailability(jobId, true);
  entry.timer = setInterval(() => {
    reportUploadFileAvailability(
      getCurrentUploadJobId(entry.upload, entry.options.jobId),
      true,
    );
  }, FILE_AVAILABILITY_HEARTBEAT_INTERVAL);
  uploadFileAvailabilityEntries.set(key, entry);
};

export const cancelUploadAutoResume = (key: string) => {
  const activeEntry = uploadFileAvailabilityEntries.get(key);
  clearUploadFileAvailabilityEntry(activeEntry);
  uploadFileAvailabilityEntries.delete(key);

  const entry = uploadAutoResumeEntries.get(key);
  if (!entry) {
    return;
  }
  clearEntryTimer(entry);
  clearEntryFileAvailabilityTimer(entry);
  uploadAutoResumeEntries.delete(key);
};

async function resumeUpload(entry: UploadAutoResumeEntry): Promise<void> {
  if (isBrowserOffline()) {
    scheduleUploadAutoResume(entry);
    return;
  }

  try {
    const hashCheckResponse = await resolveUploadAutoResumeCheck(entry);
    const jobId = hashCheckResponse.longJobUuid ?? entry.jobId;
    assertUploadLongJobMatches(hashCheckResponse, entry.jobId);
    const offset = resolveUploadHashCheckOffset(hashCheckResponse);

    if (
      hashCheckResponse.status &&
      BFF_RETRY_PENDING_STATUSES.has(hashCheckResponse.status)
    ) {
      startFileAvailabilityHeartbeat(entry);
      scheduleUploadAutoResume(
        entry,
        resolveBffRetryPendingDelay(hashCheckResponse),
      );
      return;
    }

    if (jobId && jobId !== getCurrentUploadJobId(entry.upload, entry.jobId)) {
      const uploadUrl = getUploadUrlFromResponse(hashCheckResponse);
      const artifactUuid = getArtifactUuidFromResponse(hashCheckResponse);
      if (!uploadUrl || !artifactUuid) {
        throw new Error("Recreated upload job is missing upload target");
      }
      entry.upload.rebindUploadTarget({
        artifactUuid,
        offset,
        realUuid: jobId,
        uploadType: entry.uploadType,
        uploadUrl,
      });
      notifyOperationLogRefresh();
      entry.jobId = jobId;
    }

    if (jobId && shouldResumeLongJob(hashCheckResponse)) {
      await fetchJson(`/api/resumelongjob/${jobId}`).catch(() => null);
    }

    const targetUploadTime = await entry.getUploadTargetTime(entry.uploadType);
    entry.upload.setTargetUploadTime(targetUploadTime);
    if (jobId) {
      void updateUploadSession(jobId, {
        status: "UPLOADING",
        offset,
      }).catch(() => null);
    }
    entry.upload.resume(offset);
    cancelUploadAutoResume(entry.key);
  } catch {
    scheduleUploadAutoResume(entry);
  }
}

function scheduleUploadAutoResume(
  entry: UploadAutoResumeEntry,
  delayOverride?: number,
) {
  clearEntryTimer(entry);
  const delay = delayOverride ?? getUploadAutoResumeDelay(entry.attempt);
  entry.attempt += 1;
  entry.timer = setTimeout(() => {
    void resumeUpload(entry);
  }, delay);
}

function resumeAllUploadEntries() {
  uploadAutoResumeEntries.forEach((entry) => {
    clearEntryTimer(entry);
    void resumeUpload(entry);
  });
}

function ensureOnlineListener() {
  if (onlineListenerRegistered || typeof window === "undefined") {
    return;
  }
  window.addEventListener("online", resumeAllUploadEntries);
  onlineListenerRegistered = true;
}

function ensurePageLifecycleListener() {
  if (pageLifecycleListenerRegistered || typeof window === "undefined") {
    return;
  }
  window.addEventListener("pagehide", markActiveUploadsWaitingForFile);
  window.addEventListener("beforeunload", markActiveUploadsWaitingForFile);
  pageLifecycleListenerRegistered = true;
}

function getUploadAutoResumeKey(options: UploadAutoResumeOptions) {
  return `${options.uploadType}:${options.jobId ?? ""}:${options.hash}`;
}

function registerUploadAutoResume(
  options: UploadAutoResumeOptions & {
    getUploadTargetTime: (uploadType: UploadTargetTimeType) => Promise<number>;
  },
  context: UploadRecoverableErrorContext,
) {
  if (!isUploadAutoResumeError(context.error)) {
    return;
  }

  ensureOnlineListener();
  const key = getUploadAutoResumeKey(options);
  const existingEntry = uploadAutoResumeEntries.get(key);

  if (existingEntry) {
    existingEntry.upload = context.upload;
    existingEntry.jobId = options.jobId;
    existingEntry.hashCheckPath = options.hashCheckPath;
    existingEntry.getUploadTargetTime = options.getUploadTargetTime;
    startFileAvailabilityHeartbeat(existingEntry);
    scheduleUploadAutoResume(existingEntry);
    return;
  }

  const entry: UploadAutoResumeEntry = {
    ...options,
    key,
    attempt: 0,
    upload: context.upload,
  };
  uploadAutoResumeEntries.set(key, entry);
  startFileAvailabilityHeartbeat(entry);
  scheduleUploadAutoResume(entry);
}

export default function useUploadAutoResume() {
  const getUploadTargetTime = useUploadTargetTime();

  return useCallback(
    (options: UploadAutoResumeOptions): Partial<UploadWorkerConfig> => {
      const key = getUploadAutoResumeKey(options);

      return {
        fileHash: options.hash,
        onLaunch: (context) => {
          startActiveFileAvailabilityHeartbeat(options, context.upload);
        },
        onRecoverableUploadError: (context) => {
          const jobId = getCurrentUploadJobId(context.upload, options.jobId);
          stopActiveFileAvailabilityHeartbeat(options, context.upload);
          registerUploadAutoResume(
            { ...options, getUploadTargetTime, jobId },
            context,
          );
        },
        onManualPause: (context) => {
          const jobId = getCurrentUploadJobId(context.upload, options.jobId);
          const currentKey = getUploadAutoResumeKey({ ...options, jobId });
          stopActiveFileAvailabilityHeartbeat(options, context.upload);
          cancelUploadAutoResume(key);
          if (currentKey !== key) {
            cancelUploadAutoResume(currentKey);
          }
          void updateUploadSession(jobId, {
            status: "PAUSED",
            fileAvailable: false,
            fileAvailableUntil: null,
            nextRetryAt: null,
          }).catch(() => null);
        },
        onDestroy: (context) => {
          const jobId = getCurrentUploadJobId(context.upload, options.jobId);
          const currentKey = getUploadAutoResumeKey({ ...options, jobId });
          stopActiveFileAvailabilityHeartbeat(options, context.upload);
          cancelUploadAutoResume(key);
          if (currentKey !== key) {
            cancelUploadAutoResume(currentKey);
          }
          reportUploadFileAvailability(jobId, false);
        },
        onComplete: (context) => {
          const jobId = getCurrentUploadJobId(context.upload, options.jobId);
          const currentKey = getUploadAutoResumeKey({ ...options, jobId });
          stopActiveFileAvailabilityHeartbeat(options, context.upload);
          cancelUploadAutoResume(key);
          if (currentKey !== key) {
            cancelUploadAutoResume(currentKey);
          }
          void updateUploadSession(jobId, {
            status: "COMPLETED",
          }).catch(() => null);
        },
      };
    },
    [getUploadTargetTime],
  );
}
