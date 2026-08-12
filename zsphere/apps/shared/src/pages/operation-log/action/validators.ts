import {
  OperationLongjobStatus,
  OperationApiStatus,
} from "@zstack/zsphere-types";
import type {
  OperationLog,
  OperationLongjob,
} from "@zstack/zsphere-types/graphql";

const canCancelApi = [
  "APICreateVmBackupMsg",
  "APIConvertVmFromForeignHypervisorMsg",
  "APIAddImageMsg",
  "APIAddKVMHostFromConfigFileMsg",
  "APIBatchCreateBaremetalChassisMsg",
  "APICreateDataVolumeTemplateFromVolumeMsg",
  "APICreateRootVolumeTemplateFromRootVolumeMsg",
  "APIExportImageFromBackupStorageMsg",
  "APICreateVmFromCdpBackupMsg",
  "APIRevertVmFromCdpBackupMsg",
  "APIMigrateVmMsg",
  "APIPrimaryStorageMigrateVmMsg",
  "APIFlattenVmInstanceMsg",
  "APIFlattenVolumeMsg",
  "APIUploadSoftwarePackageMsg",
  "APIUploadSoftwarePackageToBackupStorageMsg",
  "APIUploadAndExecuteSoftwareUpgradePackageMsg",
];

const uploadApi = [
  "APIAddImageMsg",
  "APIUploadSoftwarePackageMsg",
  "APIUploadSoftwarePackageToBackupStorageMsg",
  "APIUploadAndExecuteSoftwareUpgradePackageMsg",
];

/**
 * 标准化 longjob 状态值（兼容 UPPERCASE 和 PascalCase）
 */
const STATE_MAPPING: Record<string, OperationLongjobStatus> = {
  CANCELED: OperationLongjobStatus.CANCELED,
  Canceled: OperationLongjobStatus.CANCELED,
  CANCELING: OperationLongjobStatus.CANCELING,
  Canceling: OperationLongjobStatus.CANCELING,
  FAILED: OperationLongjobStatus.FAILED,
  Failed: OperationLongjobStatus.FAILED,
  RUNNING: OperationLongjobStatus.RUNNING,
  Running: OperationLongjobStatus.RUNNING,
  SUCCESS: OperationLongjobStatus.SUCCESS,
  SUCCEEDED: OperationLongjobStatus.SUCCESS,
  Success: OperationLongjobStatus.SUCCESS,
  Succeeded: OperationLongjobStatus.SUCCESS,
  SUSPENDED: OperationLongjobStatus.SUSPENDED,
  Suspended: OperationLongjobStatus.SUSPENDED,
};

const normalizeState = (
  state: string | null | undefined,
): OperationLongjobStatus | undefined => {
  if (!state) {
    return undefined;
  }
  return STATE_MAPPING[state] ?? (state as OperationLongjobStatus);
};

type NormalizedOperationLongjob = Omit<OperationLongjob, "state"> & {
  state?: OperationLongjobStatus;
};

type JsonRecord = Record<string, unknown>;

const parseJson = (value?: string | null): JsonRecord => {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
};

const getStringValue = (record: JsonRecord | undefined, key: string) => {
  const value = record?.[key];
  return typeof value === "string" ? value : undefined;
};

// 从 operationApis 响应和 longjob.data 中收集上传 jobData，用于区分本地上传和 URL 添加镜像
const getUploadJobDataList = (
  current: OperationLog,
  allJobs: NormalizedOperationLongjob[],
) => {
  const respList = (current?.operationTasks ?? [])
    .flatMap((task) => task?.operationApis ?? [])
    .map((api) => {
      const resp = parseJson(api?.resp);
      const inventory =
        resp?.inventory && typeof resp.inventory === "object"
          ? (resp.inventory as JsonRecord)
          : undefined;
      return parseJson(
        getStringValue(resp, "jobData") || getStringValue(inventory, "jobData"),
      );
    });
  const longjobDataList = allJobs.map((job) => parseJson(job?.data));

  return [...respList, ...longjobDataList];
};

const hasUploadUrl = (
  current: OperationLog,
  allJobs: NormalizedOperationLongjob[],
) =>
  getUploadJobDataList(current, allJobs).some(
    (jobData) => getStringValue(jobData, "url")?.indexOf("upload://") === 0,
  );

// APIAddImageMsg 也可能是 URL 添加镜像，只有 upload:// 才按本地上传处理
export const isUploadLongjob = (
  job: NormalizedOperationLongjob,
  current: OperationLog,
  allJobs: NormalizedOperationLongjob[],
) => {
  if (!uploadApi.includes(job?.jobName || "")) {
    return false;
  }
  if (job?.jobName === "APIAddImageMsg") {
    return hasUploadUrl(current, allJobs);
  }
  return true;
};

/**
 * 从 OperationLog 中提取所有 longjobs（合并顶层和嵌套在 operationApis 中的）
 * 与 operation-detail 的 allLongjobs 逻辑一致
 */
export const getAllLongjobs = (
  current: OperationLog,
): NormalizedOperationLongjob[] => {
  const topLevelLongjobs = current?.longjobs ?? [];

  // 从 operationTasks -> operationApis -> longjob 中提取嵌套的 longjobs
  const nestedLongjobs = (current?.operationTasks ?? [])
    .flatMap((task) => task?.operationApis ?? [])
    .map((api) => api?.longjob)
    .filter((job): job is OperationLongjob => !!job);

  // 合并并去重
  const allJobs = [...topLevelLongjobs];
  nestedLongjobs.forEach((nestedJob) => {
    if (!allJobs.some((job) => job?.longJobUuid === nestedJob.longJobUuid)) {
      allJobs.push(nestedJob);
    }
  });

  // 标准化所有 state 值
  return allJobs.map((job) => ({
    ...job,
    state: normalizeState(job?.state),
  }));
};

export const verifyCancel = (current: OperationLog) => {
  //创建日志收集
  if (
    ["CREATE_LOG_COLLECT", "RE_CREATE_LOG_COLLECT"].includes(
      current?.operationTasks?.[0]?.operationApis?.[0]?.name as string,
    ) &&
    current?.operationTasks?.[0]?.operationApis?.[0]?.status ===
      OperationApiStatus.Running
  ) {
    return true;
  }
  const allJobs = getAllLongjobs(current);
  // for upload job
  return allJobs.some(
    (job) =>
      !!job?.longJobUuid &&
      canCancelApi.includes(job?.jobName || "") &&
      (job?.state === OperationLongjobStatus.RUNNING ||
        job?.state === OperationLongjobStatus.SUSPENDED),
  );
};

export const verifyPause = (current: OperationLog) => {
  const allJobs = getAllLongjobs(current);
  return allJobs.some(
    (job) =>
      isUploadLongjob(job, current, allJobs) &&
      job?.state === OperationLongjobStatus.RUNNING,
  );
};
export const verifyGoingOn = (current: OperationLog) => {
  const allJobs = getAllLongjobs(current);
  return allJobs.some(
    (job) =>
      isUploadLongjob(job, current, allJobs) &&
      job?.state === OperationLongjobStatus.SUSPENDED,
  );
};
