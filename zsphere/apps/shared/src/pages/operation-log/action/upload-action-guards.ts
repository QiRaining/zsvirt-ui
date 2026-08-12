import { OperationLongjobStatus } from "@zstack/zsphere-types";

interface UploadLongjobLike {
  longJobUuid?: string | null;
  state?: OperationLongjobStatus | string | null;
}

interface UploadSessionLike {
  resumable?: boolean | null;
  status?: string | null;
}

export const UPLOAD_AUTO_RETRY_STATUSES = [
  "WAITING_FOR_FILE_CHECK",
  "RETRY_WAITING",
  "RETRYING",
];

export const isUploadAutoRetryingStatus = (status?: string | null) =>
  Boolean(status && UPLOAD_AUTO_RETRY_STATUSES.includes(status));

export const canManuallyContinueUploadJob = (
  job: UploadLongjobLike | undefined,
  uploadSession?: UploadSessionLike,
) => {
  if (!job?.longJobUuid || isUploadAutoRetryingStatus(uploadSession?.status)) {
    return false;
  }

  return (
    job.state === OperationLongjobStatus.SUSPENDED ||
    Boolean(uploadSession?.resumable)
  );
};
