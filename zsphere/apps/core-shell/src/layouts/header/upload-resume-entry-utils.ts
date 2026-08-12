import type {
  UploadSession,
  UploadSessionStatus,
  UploadSessionType,
} from "@zstack/zsphere-hooks";
import { OperationLongjobStatus, OperationStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";

const CONTINUABLE_UPLOAD_SESSION_STATUSES: UploadSessionStatus[] = [
  "WAITING_FOR_FILE",
  "PAUSED",
  "RETRY_READY",
];

const UPLOAD_TYPE_JOB_NAME_MAP: Record<UploadSessionType, string> = {
  image: "APIAddImageMsg",
  storagePackage: "APIUploadSoftwarePackageMsg",
  migrationServicePackage: "APIUploadSoftwarePackageToBackupStorageMsg",
};

const resolveTime = (time?: string) => {
  if (!time) {
    return 0;
  }
  const timestamp = new Date(time).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const getUploadSessionProgressPercent = (session: UploadSession) => {
  if (!session.fileSize || session.fileSize <= 0) {
    return;
  }
  const offset = Number.isFinite(session.offset) ? session.offset : 0;
  return Math.min(
    100,
    Math.max(0, Math.floor((offset / session.fileSize) * 100)),
  );
};

export const getUploadSessionProgressLabel = (session: UploadSession) => {
  if (!session.fileSize || session.fileSize <= 0) {
    return;
  }
  const offset = Number.isFinite(session.offset) ? session.offset : 0;
  if (offset <= 0) {
    return "0%";
  }
  const percent = (offset / session.fileSize) * 100;
  if (percent > 0 && percent < 1) {
    return "<1%";
  }
  return `${Math.min(100, Math.max(0, Math.floor(percent)))}%`;
};

export const getHeaderResumableUploadSessions = (sessions: UploadSession[]) =>
  sessions
    .filter(
      (session) =>
        Boolean(session.longJobUuid) &&
        session.resumable &&
        CONTINUABLE_UPLOAD_SESSION_STATUSES.includes(session.status),
    )
    .sort(
      (prev, next) =>
        resolveTime(next.lastOpDate) - resolveTime(prev.lastOpDate),
    );

export const getUploadSessionDisplayName = (session: UploadSession) =>
  session.fileName || session.longJobUuid || "-";

export const buildUploadResumeOperationLog = (
  session: UploadSession,
): OperationLog => {
  const longJobUuid = session.longJobUuid;

  return {
    actionId: longJobUuid,
    name: getUploadSessionDisplayName(session),
    status: OperationStatus.Suspended,
    userId: session.userUuid || "",
    longjobs: [
      {
        clientJobUuid: longJobUuid,
        longJobUuid,
        jobName: UPLOAD_TYPE_JOB_NAME_MAP[session.uploadType],
        progress: getUploadSessionProgressPercent(session),
        state: OperationLongjobStatus.SUSPENDED,
      },
    ],
    uploadSession: session,
  } as OperationLog & { uploadSession: UploadSession };
};
