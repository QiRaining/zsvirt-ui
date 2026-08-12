import {
  Op,
  PrimaryStorageQueryType,
  PrimaryStorageType,
  VmInstanceState,
  VolumeType,
} from "@zstack/zsphere-types";
import type { IQuery } from "@zstack/zsphere-types";
import type {
  CephPrimaryStoragePool,
  PrimaryStorage,
  PrimaryStorageMigrateVolumePayload,
  PrimaryStorageVO,
  TrashOnPrimaryStorage,
  VmInstance,
  Volume,
} from "@zstack/zsphere-types/graphql";

export const DATA_VOLUME_MIGRATE_DISABLED_CODE = {
  CURRENT_STORAGE_NOT_SUPPORT_MIGRATION:
    "CURRENT_STORAGE_NOT_SUPPORT_MIGRATION",
  VM_STATE_NOT_SUPPORT_MIGRATION: "VM_STATE_NOT_SUPPORT_MIGRATION",
} as const;

type DataVolumeMigrateDisabledCode =
  (typeof DATA_VOLUME_MIGRATE_DISABLED_CODE)[keyof typeof DATA_VOLUME_MIGRATE_DISABLED_CODE];

export const MIGRATION_RANGE = {
  SYSTEM: "system",
  DATA: "data",
} as const;

export type MigrationRange =
  (typeof MIGRATION_RANGE)[keyof typeof MIGRATION_RANGE];

type PrimaryStorageItem = Partial<
  Pick<
    PrimaryStorage | PrimaryStorageVO,
    "uuid" | "name" | "type" | "defaultProtocol"
  >
>;

type VolumeItem = Partial<
  Pick<
    Volume,
    | "uuid"
    | "name"
    | "type"
    | "size"
    | "deviceId"
    | "lastAttachDate"
    | "primaryStorage"
    | "primaryStorageUuid"
  >
>;

type VmItem = Partial<Pick<VmInstance, "uuid" | "state">> & {
  clusterUuid?: string | null;
  primaryStorage?: PrimaryStorageItem | null;
  allVolumes?: VolumeItem[] | null;
};

type StoragePoolItem = Partial<Pick<CephPrimaryStoragePool, "poolName">>;

export type DataVolumeMigrateRow = {
  volumeUuid: string;
  diskNo: number;
  size?: number | null;
  volume: VolumeItem;
  currentPrimaryStorage?: PrimaryStorageItem | null;
  migrate: boolean;
  targetPrimaryStorage?: PrimaryStorageItem | null;
  targetStoragePool?: StoragePoolItem | null;
  disabledCode?: DataVolumeMigrateDisabledCode;
};

const PRIMARY_STORAGE_DEFAULT_PROTOCOL = {
  CEPH: "ceph",
  LOCAL: "local",
} as const;

const normalize = (value?: string | null) => value?.toLowerCase();

export const isSanStorage = (primaryStorage?: PrimaryStorageItem | null) =>
  primaryStorage?.type === PrimaryStorageType.SharedBlock;

export const isZceStorage = (primaryStorage?: PrimaryStorageItem | null) =>
  primaryStorage?.type === PrimaryStorageType.Ceph ||
  normalize(primaryStorage?.defaultProtocol) ===
    PRIMARY_STORAGE_DEFAULT_PROTOCOL.CEPH;

export const isNfsStorage = (primaryStorage?: PrimaryStorageItem | null) =>
  primaryStorage?.type === PrimaryStorageType.NFS;

export const isLocalStorage = (primaryStorage?: PrimaryStorageItem | null) =>
  primaryStorage?.type === PrimaryStorageType.LocalStorage ||
  normalize(primaryStorage?.defaultProtocol) ===
    PRIMARY_STORAGE_DEFAULT_PROTOCOL.LOCAL;

export const isRunningOrStopped = (state?: string | null) =>
  state === VmInstanceState.Running || state === VmInstanceState.Stopped;

export const isDataVolume = (volume?: VolumeItem | null) =>
  Boolean(volume?.uuid) &&
  volume?.type !== VolumeType.Root &&
  volume?.type !== VolumeType.Memory;

export const canMigrateDataVolume = (
  volume?: VolumeItem | null,
  vmState?: string | null,
) => !getDataVolumeMigrateDisabledCode(volume, vmState);

export const getDataVolumeMigrateDisabledCode = (
  volume?: VolumeItem | null,
  vmState?: string | null,
): DataVolumeMigrateDisabledCode | undefined => {
  if (!isDataVolume(volume)) {
    return DATA_VOLUME_MIGRATE_DISABLED_CODE.CURRENT_STORAGE_NOT_SUPPORT_MIGRATION;
  }
  const currentPrimaryStorage = volume?.primaryStorage;

  if (isLocalStorage(currentPrimaryStorage)) {
    return DATA_VOLUME_MIGRATE_DISABLED_CODE.CURRENT_STORAGE_NOT_SUPPORT_MIGRATION;
  }

  if (isSanStorage(currentPrimaryStorage)) {
    return isRunningOrStopped(vmState)
      ? undefined
      : DATA_VOLUME_MIGRATE_DISABLED_CODE.VM_STATE_NOT_SUPPORT_MIGRATION;
  }

  if (
    isZceStorage(currentPrimaryStorage) ||
    isNfsStorage(currentPrimaryStorage)
  ) {
    return vmState === VmInstanceState.Stopped
      ? undefined
      : DATA_VOLUME_MIGRATE_DISABLED_CODE.VM_STATE_NOT_SUPPORT_MIGRATION;
  }

  return DATA_VOLUME_MIGRATE_DISABLED_CODE.CURRENT_STORAGE_NOT_SUPPORT_MIGRATION;
};

export const canMigrateAnyDataDisk = (vm?: VmItem | null) =>
  Boolean(
    vm?.allVolumes?.some((volume) => canMigrateDataVolume(volume, vm.state)),
  );

const hasMixedDataVolumeStorage = (vm?: VmItem | null) => {
  const isRootSan = isSanStorage(vm?.primaryStorage);
  const isRootZce = isZceStorage(vm?.primaryStorage);

  if (!isRootSan && !isRootZce) {
    return false;
  }

  return Boolean(
    vm?.allVolumes?.some((volume) => {
      if (!isDataVolume(volume)) {
        return false;
      }

      return isRootSan
        ? !isSanStorage(volume.primaryStorage)
        : !isZceStorage(volume.primaryStorage);
    }),
  );
};

export const canMigrateRootDisk = (vm?: VmItem | null) =>
  !hasMixedDataVolumeStorage(vm) &&
  ((isRunningOrStopped(vm?.state) && isSanStorage(vm?.primaryStorage)) ||
    (vm?.state === VmInstanceState.Running &&
      isZceStorage(vm?.primaryStorage)));

export const isSupportedDataVolumeStorage = (
  primaryStorage?: PrimaryStorageItem | null,
) =>
  !isLocalStorage(primaryStorage) &&
  (isSanStorage(primaryStorage) ||
    isZceStorage(primaryStorage) ||
    isNfsStorage(primaryStorage));

export const hasSupportedDataVolumeStorage = (vm?: VmItem | null) =>
  isRunningOrStopped(vm?.state) &&
  Boolean(
    vm?.allVolumes?.some(
      (volume) =>
        isDataVolume(volume) &&
        isSupportedDataVolumeStorage(volume.primaryStorage),
    ),
  );

export const canChangeDataStorage = (vm?: VmItem | null) =>
  canMigrateRootDisk(vm) || hasSupportedDataVolumeStorage(vm);

export const isSystemDiskRangeDisabled = (vm?: VmItem | null) =>
  !canMigrateRootDisk(vm);

export const getDefaultMigrationRange = (vm?: VmItem | null): MigrationRange =>
  isSystemDiskRangeDisabled(vm) ? MIGRATION_RANGE.DATA : MIGRATION_RANGE.SYSTEM;

const getVolumeAttachTime = (volume: VolumeItem) => {
  const time = volume.lastAttachDate
    ? new Date(volume.lastAttachDate).valueOf()
    : Number.NaN;

  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
};

const getVolumeDeviceId = (volume: VolumeItem) => {
  const deviceId =
    typeof volume.deviceId === "string"
      ? Number(volume.deviceId)
      : volume.deviceId;

  return typeof deviceId === "number" && !Number.isNaN(deviceId)
    ? deviceId
    : Number.MAX_SAFE_INTEGER;
};

export const sortVolumesByEditConfigDiskOrder = (volumes: VolumeItem[]) =>
  volumes
    .map((volume, index) => ({ volume, index }))
    .sort((left, right) => {
      const leftAttachTime = getVolumeAttachTime(left.volume);
      const rightAttachTime = getVolumeAttachTime(right.volume);
      if (leftAttachTime !== rightAttachTime) {
        return leftAttachTime - rightAttachTime;
      }

      const leftDeviceId = getVolumeDeviceId(left.volume);
      const rightDeviceId = getVolumeDeviceId(right.volume);
      if (leftDeviceId !== rightDeviceId) {
        return leftDeviceId - rightDeviceId;
      }

      return left.index - right.index;
    })
    .map(({ volume }) => volume);

export const getDataVolumeMigrateRows = (
  vm?: VmItem | null,
): DataVolumeMigrateRow[] => {
  const diskVolumes = sortVolumesByEditConfigDiskOrder(
    (vm?.allVolumes ?? []).filter(
      (volume) => volume?.type !== VolumeType.Memory,
    ),
  );

  return diskVolumes.filter(isDataVolume).map((volume) => {
    const diskIndex = diskVolumes.findIndex(
      (item) => item.uuid === volume.uuid,
    );
    const row: DataVolumeMigrateRow = {
      volumeUuid: volume.uuid ?? "",
      diskNo: diskIndex + 1,
      size: volume.size,
      volume,
      currentPrimaryStorage: volume.primaryStorage,
      migrate: false,
      targetPrimaryStorage: null,
      targetStoragePool: null,
    };

    const disabledCode = getDataVolumeMigrateDisabledCode(volume, vm?.state);
    if (disabledCode) {
      row.disabledCode = disabledCode;
    }

    return row;
  });
};

export const canMigrateMoreDataVolumes = (
  rows: DataVolumeMigrateRow[],
): boolean => rows.some((row) => !row.disabledCode && !row.migrate);

export const hasPrimaryStorageTrashForResource = (
  trashList: Array<Pick<TrashOnPrimaryStorage, "resourceUuid">>,
  resourceUuid?: string | null,
): boolean =>
  Boolean(
    resourceUuid &&
    trashList.some((trash) => trash.resourceUuid === resourceUuid),
  );

export const buildDataVolumePrimaryStorageDefaultQuery = (
  row: Pick<DataVolumeMigrateRow, "volumeUuid">,
  vm?: Pick<VmItem, "clusterUuid"> | null,
): IQuery => {
  const conditions: IQuery["conditions"] = [
    {
      key: "status",
      op: Op.eq,
      value: "Connected",
    },
  ];

  if (vm?.clusterUuid) {
    conditions.push({
      key: "cluster.uuid",
      op: Op.eq,
      value: vm.clusterUuid,
    });
  }

  return {
    conditions,
    type: PrimaryStorageQueryType.GetPrimaryStorageCandidatesForVolumeMigration,
    extraConditions: [
      {
        key: "volumeUuid",
        op: Op.eq,
        value: row.volumeUuid,
      },
    ],
  };
};

export const buildDataVolumeMigratePayload = (rows: DataVolumeMigrateRow[]) => {
  const selectedRows = rows.filter((row) => row.migrate);

  if (!selectedRows.length) {
    return {
      ok: false,
      code: "NO_SELECTED_VOLUME",
    };
  }

  if (selectedRows.some((row) => !row.targetPrimaryStorage?.uuid)) {
    return {
      ok: false,
      code: "MISSING_TARGET_STORAGE",
    };
  }

  return {
    ok: true,
    payload: selectedRows.map<PrimaryStorageMigrateVolumePayload>((row) => ({
      volumeUuid: row.volumeUuid,
      dstPrimaryStorageUuid: row.targetPrimaryStorage?.uuid ?? "",
      ...(row.targetStoragePool?.poolName
        ? { systemTags: [`ceph::pool::${row.targetStoragePool.poolName}`] }
        : {}),
    })),
  };
};

export const buildVolumeMigrationAOs = (
  volumes: VolumeItem[] | null | undefined,
  dstPrimaryStorageUuid: string,
  includeDataVolumes: boolean,
  withSnapshots: boolean,
) =>
  (volumes ?? [])
    .filter(
      (volume) =>
        volume.uuid &&
        volume.type !== VolumeType.Memory &&
        (includeDataVolumes || volume.type === VolumeType.Root),
    )
    .map(({ uuid }) => ({
      volumeUuid: uuid ?? "",
      dstPrimaryStorageUuid,
      withSnapshots,
    }));

export const buildDataVolumeMigrateVmPayload = (
  vmUuid: string,
  payload: PrimaryStorageMigrateVolumePayload[],
) => {
  return {
    vmInstanceUuid: vmUuid,
    volumeMigrationAOs: payload.map(
      ({ volumeUuid, dstPrimaryStorageUuid }) => ({
        volumeUuid,
        dstPrimaryStorageUuid,
        withSnapshots: false,
      }),
    ),
  };
};
