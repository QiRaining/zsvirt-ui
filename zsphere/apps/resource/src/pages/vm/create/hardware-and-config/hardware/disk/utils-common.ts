import { calculateStorageMetrics } from "@zstack/virtualization-resource/src/pages/primary-storage/utils";
import { PrimaryStorageType } from "@zstack/zsphere-types";
import type { PrimaryStorageCapacity } from "@zstack/zsphere-types/graphql";
import { floor as _floor } from "lodash-es";
import { useIntl } from "react-intl";

export enum SetDiskQosType {
  SetBandwidthTotal = "SetBandwidthTotal",
  SetBandwidthWR = "SetBandwidthWR",
  SetIopsTotal = "SetIopsTotal",
  SetIopsWR = "SetIopsWR",
}
export const useOptions = (_isRoot: boolean) => {
  const intl = useIntl();

  const allocatTypeOptions = [
    {
      text: intl.formatMessage({
        id: "thinProvision",
        defaultMessage: "Thin Provision",
      }),
      value: "ThinProvisioning",
      key: "ThinProvisioning",
    },
    {
      text: intl.formatMessage({
        id: "thickProvision",
        defaultMessage: "Thick Provision",
      }),
      value: "ThickProvisioning",
      key: "ThickProvisioning",
    },
  ];

  const cacheModeTypeOptions = [
    {
      text: intl.formatMessage({
        id: "vir.create.instance.disk.cachemode.none",
        defaultMessage: "none",
      }),
      value: "none",
      key: "none",
    },
    {
      text: intl.formatMessage({
        id: "vir.writethrough",
        defaultMessage: "writethrough",
      }),
      value: "writethrough",
      key: "writethrough",
    },
    {
      value: "writeback",
      key: "writeback",
      text: intl.formatMessage({
        id: "vir.writeback",
        defaultMessage: "writeback",
      }),
    },
  ];

  const iopsModeOptions = [
    {
      label: intl.formatMessage({
        id: "totalIops",
        defaultMessage: "Total IOPS",
      }),
      value: SetDiskQosType.SetIopsTotal,
      key: SetDiskQosType.SetIopsTotal,
    },
    {
      label: intl.formatMessage({
        id: "readingWritingIops",
        defaultMessage: "Read/Write IOPS",
      }),
      value: SetDiskQosType.SetIopsWR,
      key: SetDiskQosType.SetIopsWR,
    },
  ];

  const bandwidthModeOptions = [
    {
      label: intl.formatMessage({
        id: "totalSpeed",
        defaultMessage: "Total Speed",
      }),
      value: SetDiskQosType.SetBandwidthTotal,
      key: 1,
    },
    {
      label: intl.formatMessage({
        id: "readingWritingSpeed",
        defaultMessage: "Read/Write Speed",
      }),
      value: SetDiskQosType.SetBandwidthWR,
      key: 2,
    },
  ];

  const busTypeOptions = [
    {
      value: "virtio",
      text: intl.formatMessage({
        id: "busType.virtio",
        defaultMessage: "Virtio",
      }),
    },
    {
      value: "ide",
      text: intl.formatMessage({
        id: "busType.ide",
        defaultMessage: "ide",
      }),
    },
    {
      value: "virtio-scsi",
      text: intl.formatMessage({
        id: "busType.Virtio.SCSI",
        defaultMessage: "Virtio SCSI",
      }),
    },
    {
      value: "scsi",
      text: intl.formatMessage({
        id: "busType.SCSI",
        defaultMessage: "SCSI",
      }),
    },
  ];

  return {
    allocatTypeOptions,
    cacheModeTypeOptions,
    iopsModeOptions,
    bandwidthModeOptions,
    busTypeOptions,
  };
};

export const useGetCreateDiskOptions = (
  onlyShowBasic: boolean,
  isRoot: boolean,
) => {
  const intl = useIntl();

  const baseOptions = [
    {
      value: "new",
      text: intl.formatMessage({
        id: "virtualization.create.instance.hardware.disk.createType.new",
        defaultMessage: "New Disk",
      }),
    },
    {
      value: "image",
      text: isRoot
        ? intl.formatMessage({
            id: "virtualization.create.instance.hardware.diskImage.systemImage",
            defaultMessage: "System Image",
          })
        : intl.formatMessage({
            id: "virtualization.create.instance.hardware.diskImage",
            defaultMessage: "Disk Image",
          }),
    },
  ];

  const createdAndLun = [
    {
      value: "created",
      text: intl.formatMessage({
        id: "virtualization.create.instance.hardware.disk.createType.created",
        defaultMessage: "Existing Disk",
      }),
    },
    {
      value: "rdm",
      text: intl.formatMessage({
        id: "virtualization.create.instance.hardware.disk.createType.RDM",
        defaultMessage: "RDM Disk",
      }),
    },
  ];

  return onlyShowBasic ? baseOptions : baseOptions.concat(createdAndLun);
};

export const calculateRemainingAllocatable = (params: any) => {
  const { primaryStorageCapacity = {}, total, reserved } = params;

  const {
    imageCacheSize = 0,
    volumeSize = 0,
    volumeSnapshotSize = 0,
    vmTemplateVolumeCacheSize = 0,
    systemUsedCapacity: systemUsedNum = 0,
    overProvisioningPrimaryStorage: overProvisioning = 1,
    reservedCapacity: psReservedNum = reserved,
  } = primaryStorageCapacity;

  // 计算超分配总量
  const overProvisioningTotal = total - psReservedNum;
  const allocatableTotal = overProvisioningTotal * _floor(overProvisioning, 2);

  // 计算已分配容量
  const allocated =
    imageCacheSize +
    volumeSize +
    volumeSnapshotSize +
    vmTemplateVolumeCacheSize +
    systemUsedNum;

  // 计算剩余可分配容量
  const remainingAllocatable = allocatableTotal - allocated;

  return {
    remainingAllocatable,
  };
};

/**
 * 获取存储容量配置
 * 针对本地存储在主机上的特殊情况，使用不同的容量配置
 */
const getStorageCapacityConfig = (
  primaryStorage: any,
  runPathType?: string,
): any => {
  const isLocalStorageOnHost =
    primaryStorage.type === PrimaryStorageType.LocalStorage &&
    ["HostVO", "Host"].includes(runPathType || "");

  if (isLocalStorageOnHost) {
    // 本地存储在主机上的特殊情况：直接使用本地存储容量配置
    const localCapacity = primaryStorage.storageCapacityForLocalStorage || {};
    return {
      isLocalStorageOnHost: true,
      capacity: localCapacity,
      total: localCapacity.totalPhysicalCapacity || 0,
      reserved: localCapacity.reservedCapacity || 0,
    };
  }

  // 共享存储的常规情况：使用共享存储容量配置
  const sharedCapacity = primaryStorage.primaryStorageCapacity || {};
  return {
    isLocalStorageOnHost: false,
    capacity: sharedCapacity,
    total: null, // 需要通过 calculateStorageMetrics 计算
    reserved: null, // 需要通过 calculateStorageMetrics 计算
  };
};

/**
 * 计算共享存储的容量指标
 */
const calculateSharedStorageMetrics = (
  primaryStorage: any,
  capacity: PrimaryStorageCapacity,
) => {
  const {
    totalPhysicalCapacity = 0,
    availablePhysicalCapacity = 0,
    reservedPhysicalCapacity = 0,
    thresholdPrimaryStoragePhysicalCapacity = 0.9,
  } = capacity;

  const { totalNum, reservedNum } = calculateStorageMetrics(
    primaryStorage.type || PrimaryStorageType.LocalStorage,
    {
      totalPhysicalCapacity,
      availablePhysicalCapacity,
      reservedPhysicalCapacity,
      cephAvailablePhysicalCapacity: availablePhysicalCapacity,
      cephTotalPhysicalCapacity: totalPhysicalCapacity,
      thresholdPrimaryStoragePhysicalCapacity,
    },
  );

  return { totalNum, reservedNum };
};

/**
 * 改动时间：2025.8.12
 * 对应Jira：
 * 各种场景新建虚拟机(不包含基于快照、基于备份)，虚拟机修改配置，最大容量的展示，都使用此统一校验函数，以 "剩余可分配" 为准！！！
 */
export const getTotalSize = (
  storePath: any,
  runPath: any[],
  originValue?: any,
): number => {
  const primaryStorage = (storePath?.[0] ?? {}) as any;
  const runPathType = runPath?.[0]?.__typename;

  // 获取存储容量配置
  const { isLocalStorageOnHost, capacity, total, reserved } =
    getStorageCapacityConfig(primaryStorage, runPathType);

  let finalTotal: number;
  let finalReserved: number;

  // 对于共享存储，需要计算容量指标
  if (!isLocalStorageOnHost) {
    const metrics = calculateSharedStorageMetrics(primaryStorage, capacity);
    finalTotal = metrics.totalNum;
    finalReserved = metrics.reservedNum;
  } else {
    // 本地存储在主机上的特殊情况，直接使用预计算的值
    finalTotal = total!;
    finalReserved = reserved!;
  }

  // 计算剩余可分配容量
  const { remainingAllocatable } = calculateRemainingAllocatable({
    primaryStorageCapacity: capacity,
    total: finalTotal,
    reserved: finalReserved,
  });

  // 编辑状态下需要加上该硬盘已占用容量
  const originalSize = originValue?.size ?? 0;

  return remainingAllocatable + originalSize;
};
