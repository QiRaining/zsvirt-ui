import type { DocumentNode } from "@apollo/client";
import alovaInstance from "@zstack/alova-instance";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { FileUpload, simpleHash } from "@zstack/zsphere-utils";
import { useCallback } from "react";

import useAction from "../use-action";
import useUploadAutoResume from "../use-upload-auto-resume";
import {
  getUploadFileMetadata,
  registerUploadSession,
  updateUploadSession,
} from "../use-upload-session";
import useUploadTargetTime from "../use-upload-target-time";

interface HashCheckResponse {
  offset?: number;
  longJobUuid?: string;
  softwarePackageUploadUrl?: string;
  softwarePackageUuid?: string;
}

export type UploadRecovery =
  | { mode: "session"; hashCheckEndpoint: string }
  | { mode: "memory" };

interface UploadTarget {
  artifactUuid: string;
  realUuid: string;
  uploadUrl: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseUploadTarget = (value: unknown): UploadTarget => {
  if (!isRecord(value)) {
    throw new Error("Invalid upload target");
  }

  const inventory = isRecord(value.inventory) ? value.inventory : undefined;
  const artifactUuid = value.artifactUuid ?? inventory?.uuid;
  const realUuid = value.realUuid;
  const uploadUrl = value.uploadUrl ?? inventory?.uploadFileUrl;
  if (
    typeof artifactUuid !== "string" ||
    !artifactUuid ||
    typeof realUuid !== "string" ||
    !realUuid ||
    typeof uploadUrl !== "string" ||
    !uploadUrl
  ) {
    throw new Error("Invalid upload target");
  }

  return { artifactUuid, realUuid, uploadUrl };
};

export interface UseUploadPackageConfig {
  uploadType: "storagePackage" | "migrationServicePackage";
  recovery: UploadRecovery;
  mutation: DocumentNode;
  mutationResponseKey: string;
  actionName: string;
  jobName: string;
  resourceType?: string;
  buildPayload: (
    formData: Record<string, unknown>,
    fileName: string,
  ) => Record<string, unknown>;
}

export interface UseUploadPackageReturn {
  submitHandle: (
    formData: Record<string, unknown>,
    file: File | null | undefined,
  ) => Promise<null | void>;
}

export default function useUploadPackage(
  config: UseUploadPackageConfig,
): UseUploadPackageReturn {
  const {
    uploadType,
    mutation,
    mutationResponseKey,
    actionName,
    jobName,
    resourceType,
    buildPayload,
    recovery,
  } = config;

  const doAction = useAction();
  const {
    storagePackageResume,
    setStoragePackageResume,
    migrationServicePackageResume,
    setMigrationServicePackageResume,
  } = usePlatformStore();
  const getUploadTargetTime = useUploadTargetTime();
  const getUploadAutoResumeConfig = useUploadAutoResume();

  const resumeStore =
    uploadType === "storagePackage"
      ? storagePackageResume
      : migrationServicePackageResume;
  const setResumeStore =
    uploadType === "storagePackage"
      ? setStoragePackageResume
      : setMigrationServicePackageResume;

  const submitHandle = useCallback(
    async (
      formData: Record<string, unknown>,
      file: File | null | undefined,
    ) => {
      const { uploadMethod, url, dragger } = formData;

      const fileName =
        uploadMethod === "url"
          ? (url as string).split("/").pop()
          : file?.name || (dragger as File)?.name;

      const payload: Record<string, unknown> = buildPayload(
        formData,
        fileName as string,
      );

      if (uploadMethod === "url") {
        await doAction({
          mutation,
          payload,
          name: actionName,
          total: 1,
          type: resourceType,
        });
        return;
      }

      if (!file) {
        return;
      }

      const sessionRecovery = recovery.mode === "session";
      const hash = sessionRecovery ? await simpleHash(file) : undefined;
      if (hash) {
        payload.hash = hash;
      }

      const hashCheckEndpoint =
        recovery.mode === "session" ? recovery.hashCheckEndpoint : undefined;
      const _resp = sessionRecovery
        ? await alovaInstance
            .Get<HashCheckResponse>(`${hashCheckEndpoint}/${hash}`)
            .send()
        : ({} as HashCheckResponse);

      const next = _resp.offset;
      const longJobUuid = _resp.longJobUuid as string;
      const targetUploadTime = await getUploadTargetTime(uploadType);
      const fileMetadata = sessionRecovery
        ? getUploadFileMetadata(file)
        : undefined;
      const registerCurrentUploadSession = (
        uploadJobUuid: string,
        artifactUuid: string,
        uploadUrl: string,
        offset: number,
      ) => {
        if (!sessionRecovery || !hash || !fileMetadata) {
          return Promise.resolve();
        }
        return registerUploadSession({
          uploadType,
          hash,
          ...fileMetadata,
          longJobUuid: uploadJobUuid,
          artifactUuid,
          uploadUrl,
          offset,
          status: "UPLOADING",
          jobName,
          jobData: JSON.stringify(payload),
          actionName,
          resourceType,
        });
      };
      const uploadAutoResumeConfig =
        sessionRecovery && hash && hashCheckEndpoint
          ? getUploadAutoResumeConfig({
              uploadType,
              hash,
              hashCheckPath: `${hashCheckEndpoint}/${hash}`,
              jobId: longJobUuid,
            })
          : {};

      if (next) {
        const currentProcess = resumeStore[longJobUuid];

        if (currentProcess) {
          currentProcess.setTargetUploadTime(targetUploadTime);
          void updateUploadSession(longJobUuid, {
            status: "UPLOADING",
            offset: next,
          }).catch(() => null);
          currentProcess.resume(next);
        } else {
          await registerCurrentUploadSession(
            _resp.longJobUuid!,
            _resp.softwarePackageUuid!,
            _resp.softwarePackageUploadUrl!,
            next,
          );
          const newUpload = new FileUpload(
            file,
            _resp.softwarePackageUploadUrl!,
            _resp.longJobUuid!,
            _resp.softwarePackageUuid!,
            next,
            uploadType,
            undefined,
            { targetUploadTime, ...uploadAutoResumeConfig },
          );
          newUpload.launch();
          const obj: Record<string, FileUpload> = {};
          obj[_resp.longJobUuid as string] = newUpload;
          obj[hash as string] = newUpload;
          setResumeStore({ ...resumeStore, ...obj });
        }
      } else {
        const resp = await doAction({
          mutation,
          payload,
          name: actionName,
          total: 1,
          type: resourceType,
        });

        const target = parseUploadTarget(
          JSON.parse(resp.data[mutationResponseKey].jobResult) as unknown,
        );
        await registerCurrentUploadSession(
          target.realUuid,
          target.artifactUuid,
          target.uploadUrl,
          0,
        );
        const newUploadAutoResumeConfig =
          sessionRecovery && hash
            ? getUploadAutoResumeConfig({
                uploadType,
                hash,
                hashCheckPath: `${hashCheckEndpoint}/${hash}`,
                jobId: target.realUuid,
              })
            : {};

        const newProcess = new FileUpload(
          file,
          target.uploadUrl,
          target.realUuid,
          target.artifactUuid,
          0,
          uploadType,
          undefined,
          { targetUploadTime, ...newUploadAutoResumeConfig },
        );
        newProcess.launch();

        const obj: Record<string, FileUpload> = {
          [target.realUuid]: newProcess,
        };
        if (hash) {
          obj[hash] = newProcess;
        }
        setResumeStore({ ...resumeStore, ...obj });
      }
      return null;
    },
    [
      doAction,
      mutation,
      mutationResponseKey,
      actionName,
      jobName,
      resourceType,
      uploadType,
      buildPayload,
      resumeStore,
      setResumeStore,
      getUploadTargetTime,
      getUploadAutoResumeConfig,
      recovery,
    ],
  );

  return { submitHandle };
}
