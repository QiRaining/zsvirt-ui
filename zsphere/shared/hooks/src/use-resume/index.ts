import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type {
  OperationLog,
  OperationLongjob,
} from "@zstack/zsphere-types/graphql";
import { FileUpload, simpleHash } from "@zstack/zsphere-utils";
import { Modal } from "antd";
import React, { useCallback, useMemo, useRef } from "react";
import { useIntl, type IntlShape } from "react-intl";

import useUploadAutoResume from "../use-upload-auto-resume";
import {
  getUploadSessionOffset,
  getUploadFileMetadata,
  getResumableUploadSessions,
  registerUploadSession,
  type UploadSession,
  updateUploadSession,
} from "../use-upload-session";
import useUploadTargetTime from "../use-upload-target-time";

type UploadType = "image" | "storagePackage" | "migrationServicePackage";

export interface UploadConfirmModalHandle {
  destroy: () => void;
}

export interface UploadConfirmModalOptions {
  intl: IntlShape;
  title: React.ReactNode;
  content: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  cancelable?: boolean;
  zIndex?: number;
}

export type OpenUploadConfirmModal = (
  options: UploadConfirmModalOptions,
) => UploadConfirmModalHandle | null;

export interface UseResumeOptions {
  openConfirmModal?: OpenUploadConfirmModal;
}

const UPLOAD_CONFIRM_MODAL_Z_INDEX = 1110;

type UploadSessionSnapshot = Pick<
  UploadSession,
  | "artifactUuid"
  | "fileName"
  | "fileSize"
  | "hash"
  | "lastModified"
  | "longJobUuid"
  | "offset"
  | "uploadUrl"
  | "status"
  | "jobName"
  | "jobData"
  | "actionName"
  | "resourceType"
>;

type OperationLogWithUploadSession = OperationLog & {
  uploadSession?: UploadSessionSnapshot;
};

interface UploadHashCheckResponse {
  longJobUuid?: string;
  offset?: number;
  imageUploadUrl?: string;
  softwarePackageUploadUrl?: string;
  imageUuid?: string;
  softwarePackageUuid?: string;
}

interface UploadResumeCheckResult {
  hash: string;
  next: number;
  uploadUrl?: string;
  uuid?: string;
}

export const openUploadConfirmModal: OpenUploadConfirmModal = ({
  intl,
  title,
  content,
  onOk,
  onCancel,
  cancelable = true,
  zIndex = UPLOAD_CONFIRM_MODAL_Z_INDEX,
}) => {
  if (typeof document === "undefined") {
    return null;
  }

  const modal = Modal.confirm({
    cancelButtonProps: cancelable ? undefined : { style: { display: "none" } },
    cancelText: intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" }),
    closable: false,
    content,
    icon: null,
    maskClosable: false,
    okText: intl.formatMessage({ id: "ok", defaultMessage: "OK" }),
    title,
    zIndex,
    onCancel: () => {
      onCancel?.();
    },
    onOk: () => {
      onOk?.();
    },
  });

  return { destroy: modal.destroy };
};

export const isSameUploadSessionFile = (
  uploadSession: UploadSessionSnapshot | undefined,
  file: File,
) => {
  if (!uploadSession) {
    return false;
  }

  const nameMatches =
    !uploadSession.fileName || uploadSession.fileName === file.name;
  const sizeMatches =
    typeof uploadSession.fileSize !== "number" ||
    uploadSession.fileSize === file.size;
  const lastModifiedMatches =
    typeof uploadSession.lastModified !== "number" ||
    typeof file.lastModified !== "number" ||
    uploadSession.lastModified === file.lastModified;

  return nameMatches && sizeMatches && lastModifiedMatches;
};

export const getUploadResumeHashCandidates = (
  selectedHash: string,
  uploadSession: UploadSessionSnapshot | undefined,
  file: File,
) => {
  if (
    uploadSession?.hash &&
    uploadSession.hash !== selectedHash &&
    isSameUploadSessionFile(uploadSession, file)
  ) {
    return [uploadSession.hash, selectedHash];
  }

  return [selectedHash];
};

// Upload type configuration mapping
const UPLOAD_TYPE_CONFIG = {
  image: {
    hashCheckPath: (hash: string) => `/api/uploadhashcheck/${hash}`,
    resumeStateKey: "fileResume" as const,
    uploadUrlKey: "imageUploadUrl" as const,
    uuidKey: "imageUuid" as const,
  },
  storagePackage: {
    hashCheckPath: (hash: string) =>
      `/api/uploadStoragePackagehashcheck/${hash}`,
    resumeStateKey: "storagePackageResume" as const,
    uploadUrlKey: "softwarePackageUploadUrl" as const,
    uuidKey: "softwarePackageUuid" as const,
  },
  migrationServicePackage: {
    hashCheckPath: (hash: string) =>
      `/api/uploadMigrationServicePackagehashcheck/${hash}`,
    resumeStateKey: "migrationServicePackageResume" as const,
    uploadUrlKey: "softwarePackageUploadUrl" as const,
    uuidKey: "softwarePackageUuid" as const,
  },
} as const;

// Job name to upload type mapping
const JOB_NAME_TYPE_MAP: Record<string, UploadType> = {
  APIAddImageMsg: "image",
  APIUploadSoftwarePackageMsg: "storagePackage",
  APIUploadSoftwarePackageToBackupStorageMsg: "migrationServicePackage",
  APIUploadAndExecuteSoftwareUpgradePackageMsg: "migrationServicePackage",
  APIUploadSoftwarePackageToVmMsg: "migrationServicePackage",
};

const isMemoryOnlyUploadJob = (jobName?: string) =>
  jobName === "APIUploadSoftwarePackageToVmMsg";

export function getUploadTypeFromJobName(jobName?: string): UploadType {
  if (jobName && JOB_NAME_TYPE_MAP[jobName]) {
    return JOB_NAME_TYPE_MAP[jobName];
  }
  return "image";
}

function getPrimaryLongjob(ele: OperationLog): OperationLongjob | undefined {
  return (
    ele?.longjobs?.[0] ??
    ele?.operationTasks
      ?.flatMap((task) => task?.operationApis ?? [])
      ?.map((api) => api?.longjob)
      ?.find((job): job is OperationLongjob => !!job)
  );
}

const getUploadSessionFromOperationLog = (
  ele: OperationLog,
): UploadSessionSnapshot | undefined =>
  (ele as OperationLogWithUploadSession).uploadSession;

type UploadResumeState = Record<string, FileUpload | undefined>;

const getUploadFromResumeState = (
  resumeState: UploadResumeState,
  jobId: string,
) => {
  const directUpload = resumeState[jobId];
  if (directUpload) {
    return directUpload;
  }

  return Object.values(resumeState).find(
    (fileUpload) => fileUpload?.getRealUuid?.() === jobId,
  );
};

const removeUploadFromResumeState = (
  resumeState: UploadResumeState,
  file: FileUpload,
  jobId: string,
) => {
  const realUuid = file.getRealUuid?.();

  return Object.entries(resumeState).reduce<UploadResumeState>(
    (nextState, [key, fileUpload]) => {
      const fileUploadRealUuid = fileUpload?.getRealUuid?.();
      if (
        fileUpload === file ||
        fileUploadRealUuid === realUuid ||
        fileUploadRealUuid === jobId
      ) {
        return nextState;
      }

      nextState[key] = fileUpload;
      return nextState;
    },
    {},
  );
};

const shouldResumeLongJob = (uploadSession?: UploadSessionSnapshot) =>
  uploadSession?.status !== "RETRY_READY";

const resumeLongJobIfNeeded = async (
  jobId: string,
  uploadSession?: UploadSessionSnapshot,
) => {
  if (!shouldResumeLongJob(uploadSession)) {
    return;
  }

  await fetch(`/api/resumelongjob/${jobId}`, {
    headers: {
      "x-session-id": localStorage.getItem("sessionId") || "",
    },
  }).then((resp) => resp.json());
};

async function getUploadSessionByLongJobUuid(
  jobId: string,
  uploadSession?: UploadSessionSnapshot,
): Promise<UploadSessionSnapshot | undefined> {
  if (uploadSession?.longJobUuid === jobId) {
    return uploadSession;
  }

  try {
    const sessions = await getResumableUploadSessions();
    return sessions.find((session) => session.longJobUuid === jobId);
  } catch {
    return undefined;
  }
}

export async function resolveUploadResumeCheck({
  config,
  file,
  jobId,
  selectedHash,
  uploadSession,
}: {
  config: (typeof UPLOAD_TYPE_CONFIG)[UploadType];
  file: File;
  jobId: string;
  selectedHash: string;
  uploadSession?: UploadSessionSnapshot;
}): Promise<UploadResumeCheckResult | undefined> {
  if (
    uploadSession?.longJobUuid === jobId &&
    uploadSession.hash === selectedHash
  ) {
    try {
      const sessionOffset = await getUploadSessionOffset(jobId);
      if (sessionOffset?.longJobUuid === jobId) {
        return {
          hash: sessionOffset.hash || selectedHash,
          next: Number(sessionOffset.offset) || 0,
          uploadUrl: sessionOffset.uploadUrl,
          uuid: sessionOffset.artifactUuid,
        };
      }
    } catch {
      // Fall back to backend hashcheck; stored DB offset alone is not a resume point.
    }
  }

  const hashCandidates = getUploadResumeHashCandidates(
    selectedHash,
    uploadSession,
    file,
  );

  for (const hash of new Set(hashCandidates)) {
    try {
      const response = await fetch(config.hashCheckPath(hash), {
        headers: { "x-session-id": localStorage.getItem("sessionId") || "" },
      });
      const responseJson = (await response.json()) as UploadHashCheckResponse;

      if (responseJson.longJobUuid === jobId) {
        return {
          hash,
          next: Number(responseJson.offset) || 0,
          uploadUrl: responseJson[config.uploadUrlKey],
          uuid: responseJson[config.uuidKey],
        };
      }
    } catch {
      // Try the next hash candidate; DB offset is not trusted as a resume point.
    }
  }

  return undefined;
}

export default function useResume(options: UseResumeOptions = {}) {
  const {
    fileResume,
    setFileResume,
    storagePackageResume,
    setStoragePackageResume,
    migrationServicePackageResume,
    setMigrationServicePackageResume,
  } = usePlatformStore();

  const intl = useIntl();
  const modal = useRef<UploadConfirmModalHandle | null>(null);
  const getUploadTargetTime = useUploadTargetTime();
  const getUploadAutoResumeConfig = useUploadAutoResume();
  const openConfirmModal = options.openConfirmModal ?? openUploadConfirmModal;

  const resumeStateMap = useMemo(
    () => ({
      fileResume,
      storagePackageResume,
      migrationServicePackageResume,
    }),
    [fileResume, migrationServicePackageResume, storagePackageResume],
  );

  const setResumeStateMap = useMemo(
    () => ({
      fileResume: setFileResume,
      storagePackageResume: setStoragePackageResume,
      migrationServicePackageResume: setMigrationServicePackageResume,
    }),
    [setFileResume, setMigrationServicePackageResume, setStoragePackageResume],
  );

  // 获取input
  const getInputDom = useCallback((jobId: string) => {
    let input = document.querySelector(`#jobId-${jobId}`) as HTMLInputElement;
    if (!input) {
      input = document.createElement("input");
      input.id = `jobId-${jobId}`;
      input.type = "file";
      input.style.display = "none";
      document.body.appendChild(input);
    }
    return input;
  }, []);

  // 选择并上传文件
  const selectFile = useCallback(
    (
      jobId: string,
      type: UploadType,
      uploadSession?: UploadSessionSnapshot,
    ) => {
      const cur = getInputDom(jobId);
      cur.value = "";
      cur.addEventListener("input", async () => {
        const file: File = cur.files?.[0] as File;
        if (!file) {
          return;
        }
        const selectedHash = await simpleHash(file);
        const config = UPLOAD_TYPE_CONFIG[type];
        const resumeState = resumeStateMap[config.resumeStateKey];
        const setResumeState = setResumeStateMap[config.resumeStateKey];
        const expectedUploadSession = await getUploadSessionByLongJobUuid(
          jobId,
          uploadSession,
        );
        const uploadCheck = await resolveUploadResumeCheck({
          config,
          file,
          jobId,
          selectedHash,
          uploadSession: expectedUploadSession,
        });

        if (!uploadCheck?.uploadUrl || !uploadCheck.uuid) {
          openConfirmModal({
            cancelable: false,
            intl,
            title: intl.formatMessage({
              id: "image.upload",
              defaultMessage: "Upload Image",
            }),
            content: intl.formatMessage({
              id: "image.upload.hash.description",
              defaultMessage:
                "The file to be uploaded is inconsistent with the one you uploaded before. Please select a new one.",
            }),
          });
        } else {
          const { hash, next, uploadUrl, uuid } = uploadCheck;
          return resumeLongJobIfNeeded(jobId, expectedUploadSession).then(
            async () => {
              const targetUploadTime = await getUploadTargetTime(type);
              try {
                await registerUploadSession({
                  uploadType: type,
                  hash,
                  ...getUploadFileMetadata(file),
                  longJobUuid: jobId,
                  artifactUuid: uuid,
                  uploadUrl,
                  offset: next,
                  status: "UPLOADING",
                  jobName: expectedUploadSession?.jobName,
                  jobData: expectedUploadSession?.jobData,
                  actionName: expectedUploadSession?.actionName,
                  resourceType: expectedUploadSession?.resourceType,
                });
              } catch {
                return;
              }
              const uploadAutoResumeConfig = getUploadAutoResumeConfig({
                uploadType: type,
                hash,
                hashCheckPath: config.hashCheckPath(hash),
                jobId,
              });
              const newProcess = new FileUpload(
                file,
                uploadUrl,
                jobId as string,
                uuid,
                next,
                type,
                undefined,
                { targetUploadTime, ...uploadAutoResumeConfig },
              );
              newProcess.launch();
              const obj: { [key: string]: any } = {};
              obj[jobId as string] = newProcess;
              obj[hash] = newProcess;
              setResumeState({ ...resumeState, ...obj });
              // 移除对应的input
              cur.parentNode?.removeChild(cur);
            },
          );
        }
      });
      cur?.click();
    },
    [
      getInputDom,
      intl,
      openConfirmModal,
      resumeStateMap,
      setResumeStateMap,
      getUploadTargetTime,
      getUploadAutoResumeConfig,
    ],
  );

  const getModal = useCallback(
    (
      jobId: string,
      type: UploadType,
      uploadSession?: UploadSessionSnapshot,
    ) => {
      return openConfirmModal({
        intl,
        title: intl.formatMessage({
          id: "image.upload",
          defaultMessage: "Upload Image",
        }),
        content: intl.formatMessage({
          id: "image.upload.reselect.file",
          defaultMessage: "Select a file again.",
        }),
        onOk: () => selectFile(jobId, type, uploadSession),
        onCancel: () => {},
      });
    },
    [intl, openConfirmModal, selectFile],
  );

  return useCallback(
    (ele: OperationLog) => {
      const longjob = getPrimaryLongjob(ele);
      if (!longjob?.longJobUuid) {
        return {
          pause: () => {},
          goingOn: () => {},
          getFile: () => undefined,
          del: () => {},
        };
      }
      const jobId = longjob.longJobUuid;
      const jobName = longjob?.jobName;
      const actualUploadType = getUploadTypeFromJobName(jobName);
      const memoryOnly = isMemoryOnlyUploadJob(jobName);
      const uploadSession = getUploadSessionFromOperationLog(ele);
      const config = UPLOAD_TYPE_CONFIG[actualUploadType];
      const resumeState = resumeStateMap[config.resumeStateKey];
      const setResumeState = setResumeStateMap[config.resumeStateKey];

      const getFile = () => getUploadFromResumeState(resumeState, jobId);

      const del = () => {
        const file = getFile();
        if (!memoryOnly) {
          void updateUploadSession(jobId, { status: "CANCELED" }).catch(
            () => null,
          );
        }
        if (file) {
          file.destroy();
          setResumeState(removeUploadFromResumeState(resumeState, file, jobId));
        }
      };

      if (memoryOnly) {
        return {
          pause: () => {},
          goingOn: () => {},
          getFile,
          del,
        };
      }

      const pause = () => {
        openConfirmModal({
          intl,
          title: intl.formatMessage({
            id: "image.upload.pause.confirm",
            defaultMessage: "Pause Uploading Image?",
          }),
          content: intl.formatMessage({
            id: "image.upload.pause.description",
            defaultMessage:
              "The upload job can be paused for up to 72 hours, after which the job will fail.",
          }),
          onOk: () => {
            const fileUpload = getUploadFromResumeState(resumeState, jobId);
            if (fileUpload) {
              fileUpload.pause();
              void updateUploadSession(jobId, { status: "PAUSED" }).catch(
                () => null,
              );
              return Promise.resolve();
            }
            void updateUploadSession(jobId, { status: "PAUSED" }).catch(
              () => null,
            );
            return Promise.resolve();
          },
          onCancel: () => {},
        });
      };

      const goingOn = () => {
        const _goingOn = async () => {
          const fileUpload = getUploadFromResumeState(resumeState, jobId);
          if (fileUpload) {
            const hash = await fileUpload.getFileHash();
            let hashCheckResp: Pick<UploadHashCheckResponse, "offset"> | null =
              null;
            try {
              hashCheckResp = await getUploadSessionOffset(jobId);
            } catch {
              hashCheckResp = await fetch(config.hashCheckPath(hash), {
                headers: {
                  "x-session-id": localStorage.getItem("sessionId") || "",
                },
              }).then((resp) => resp.json());
            }
            const next = Number(hashCheckResp?.offset);
            const serverOffset =
              Number.isFinite(next) && next >= 0 ? next : undefined;

            await resumeLongJobIfNeeded(jobId, uploadSession);

            const targetUploadTime =
              await getUploadTargetTime(actualUploadType);
            fileUpload.setTargetUploadTime(targetUploadTime);
            void updateUploadSession(jobId, {
              status: "UPLOADING",
              offset: serverOffset,
            }).catch(() => null);
            fileUpload.resume(serverOffset);
            return;
          }
          modal.current?.destroy();
          modal.current = getModal(jobId, actualUploadType, uploadSession);
        };
        _goingOn();
      };

      return { pause, goingOn, getFile, del };
    },
    [
      resumeStateMap,
      setResumeStateMap,
      getModal,
      intl,
      getUploadTargetTime,
      openConfirmModal,
    ],
  );
}
