import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildDataVolumeMigratePayload,
  buildDataVolumeMigrateVmPayload,
  buildDataVolumePrimaryStorageDefaultQuery,
  buildVolumeMigrationAOs,
  canChangeDataStorage,
  canMigrateDataVolume,
  canMigrateMoreDataVolumes,
  DATA_VOLUME_MIGRATE_DISABLED_CODE,
  getDataVolumeMigrateRows,
  getDefaultMigrationRange,
  hasPrimaryStorageTrashForResource,
  isLocalStorage,
  isSanStorage,
  isSystemDiskRangeDisabled,
  isZceStorage,
  MIGRATION_RANGE,
} from "../change-primary-storage-helper";

const ps = (type?: string, defaultProtocol?: string, extra = {}) => ({
  uuid: `${type ?? "unknown"}-${defaultProtocol ?? "none"}`,
  name: `${type ?? "unknown"}-${defaultProtocol ?? "none"}`,
  type,
  defaultProtocol,
  ...extra,
});

const volume = (
  uuid: string,
  type: string,
  primaryStorage: ReturnType<typeof ps>,
  size = 1024 ** 3,
  extra = {},
) => ({
  uuid,
  name: uuid,
  type,
  size,
  primaryStorage,
  primaryStorageUuid: primaryStorage.uuid,
  ...extra,
});

const vm = (
  state: string,
  rootStorage: ReturnType<typeof ps>,
  volumes: any[],
) =>
  ({
    uuid: "vm-1",
    state,
    primaryStorage: rootStorage,
    allVolumes: volumes,
  }) as any;

describe("change primary storage helper", () => {
  it("uses generated enum constants instead of raw enum value strings", () => {
    const helperContent = readFileSync(
      resolve(__dirname, "../change-primary-storage-helper.ts"),
      "utf8",
    );

    expect(helperContent).not.toMatch(
      /(?:===|!==)\s*"(?:SharedBlock|Ceph|NFS|LocalStorage|Root|Memory|Running|Stopped)"/,
    );
  });

  it("fetches volume attach date for VM allVolumes disk ordering", () => {
    const resourceRoot = resolve(__dirname, "../../../../..");
    const gqlFiles = ["vm.gql", "instance.gql"].map((fileName) =>
      readFileSync(resolve(resourceRoot, "gql", fileName), "utf8"),
    );

    gqlFiles.forEach((content) => {
      const allVolumesBlocks = content.match(/allVolumes\s*\{[\s\S]*?\n\s*\}/g);

      expect(allVolumesBlocks?.length).toBeGreaterThan(0);
      expect(
        allVolumesBlocks?.every((block) => block.includes("lastAttachDate")),
      ).toBe(true);
    });
  });

  it("identifies SAN, ZCE and local storage variants", () => {
    expect(isSanStorage(ps("SharedBlock"))).toBe(true);
    expect(isZceStorage(ps("Ceph"))).toBe(true);
    expect(isZceStorage(ps("Addon", "ceph"))).toBe(true);
    expect(isLocalStorage(ps("LocalStorage"))).toBe(true);
    expect(isLocalStorage(ps("Addon", "local"))).toBe(true);
    expect(isLocalStorage(ps("Addon"))).toBe(false);
    expect(
      isLocalStorage(ps("Addon", undefined, { storageType: "LocalStorage" })),
    ).toBe(false);
  });

  it("allows data disk migration by storage type and VM state", () => {
    expect(
      canMigrateDataVolume(volume("san", "Data", ps("SharedBlock")), "Running"),
    ).toBe(true);
    expect(
      canMigrateDataVolume(volume("san", "Data", ps("SharedBlock")), "Stopped"),
    ).toBe(true);
    expect(
      canMigrateDataVolume(volume("ceph", "Data", ps("Ceph")), "Running"),
    ).toBe(false);
    expect(
      canMigrateDataVolume(volume("ceph", "Data", ps("Ceph")), "Stopped"),
    ).toBe(true);
    expect(
      canMigrateDataVolume(volume("nfs", "Data", ps("NFS")), "Running"),
    ).toBe(false);
    expect(
      canMigrateDataVolume(
        volume("local", "Data", ps("LocalStorage")),
        "Stopped",
      ),
    ).toBe(false);
  });

  it("enables action for SAN root or supported data volumes", () => {
    const root = volume("root", "Root", ps("Ceph"));
    const sanData = volume("data-1", "Data", ps("SharedBlock"));
    const unsupportedData = volume("data-2", "Data", ps("BlockStorage"));

    expect(canChangeDataStorage(vm("Running", ps("SharedBlock"), [root]))).toBe(
      true,
    );
    expect(canChangeDataStorage(vm("Running", ps("Ceph"), [root]))).toBe(true);
    expect(canChangeDataStorage(vm("Stopped", ps("Ceph"), [root]))).toBe(false);
    expect(
      canChangeDataStorage(vm("Stopped", ps("Ceph"), [root, sanData])),
    ).toBe(true);
    expect(
      canChangeDataStorage(vm("Running", ps("Ceph"), [root, sanData])),
    ).toBe(true);
    expect(
      canChangeDataStorage(
        vm("Running", ps("Ceph"), [root, volume("nfs", "Data", ps("NFS"))]),
      ),
    ).toBe(true);
    expect(
      canChangeDataStorage(
        vm("Running", ps("Ceph"), [
          root,
          volume("zce", "Data", ps("Addon", "ceph")),
        ]),
      ),
    ).toBe(true);
    expect(
      canChangeDataStorage(vm("Stopped", ps("Ceph"), [root, unsupportedData])),
    ).toBe(false);
  });

  it("selects system disk only when root storage supports the current VM state", () => {
    const root = volume("root", "Root", ps("Ceph"));
    const sanData = volume("data-1", "Data", ps("SharedBlock"));

    expect(
      getDefaultMigrationRange(vm("Running", ps("SharedBlock"), [root])),
    ).toBe(MIGRATION_RANGE.SYSTEM);
    expect(
      isSystemDiskRangeDisabled(vm("Running", ps("SharedBlock"), [root])),
    ).toBe(false);

    expect(getDefaultMigrationRange(vm("Running", ps("Ceph"), [root]))).toBe(
      MIGRATION_RANGE.SYSTEM,
    );
    expect(isSystemDiskRangeDisabled(vm("Running", ps("Ceph"), [root]))).toBe(
      false,
    );

    expect(
      getDefaultMigrationRange(vm("Stopped", ps("Ceph"), [root, sanData])),
    ).toBe(MIGRATION_RANGE.DATA);
    expect(
      isSystemDiskRangeDisabled(vm("Stopped", ps("Ceph"), [root, sanData])),
    ).toBe(true);

    expect(
      getDefaultMigrationRange(vm("Running", ps("NFS"), [root, sanData])),
    ).toBe(MIGRATION_RANGE.DATA);
    expect(
      isSystemDiskRangeDisabled(vm("Running", ps("NFS"), [root, sanData])),
    ).toBe(true);
  });

  it("selects whole VM migration when SAN root only has SAN data volumes", () => {
    const root = volume("root", "Root", ps("SharedBlock"));
    const targetVm = vm("Stopped", ps("SharedBlock"), [
      root,
      volume("san-data-1", "Data", ps("SharedBlock")),
      volume("san-data-2", "Data", ps("SharedBlock")),
    ]);

    expect(getDefaultMigrationRange(targetVm)).toBe(MIGRATION_RANGE.SYSTEM);
    expect(isSystemDiskRangeDisabled(targetVm)).toBe(false);
    expect(
      getDataVolumeMigrateRows(targetVm).map((row) => row.disabledCode),
    ).toEqual([undefined, undefined]);
  });

  it("selects data disk only when SAN root has mixed data volume storage", () => {
    const root = volume("root", "Root", ps("SharedBlock"));
    const targetVm = vm("Stopped", ps("SharedBlock"), [
      root,
      volume("san-data", "Data", ps("SharedBlock")),
      volume("zce-data", "Data", ps("Ceph")),
    ]);

    expect(getDefaultMigrationRange(targetVm)).toBe(MIGRATION_RANGE.DATA);
    expect(isSystemDiskRangeDisabled(targetVm)).toBe(true);
    expect(
      getDataVolumeMigrateRows(targetVm).map((row) => row.disabledCode),
    ).toEqual([undefined, undefined]);
  });

  it("selects whole VM migration when running ZCE root only has ZCE data volumes", () => {
    const root = volume("root", "Root", ps("Ceph"));
    const targetVm = vm("Running", ps("Ceph"), [
      root,
      volume("zce-data-1", "Data", ps("Ceph")),
      volume("zce-data-2", "Data", ps("Addon", "ceph")),
    ]);

    expect(canChangeDataStorage(targetVm)).toBe(true);
    expect(getDefaultMigrationRange(targetVm)).toBe(MIGRATION_RANGE.SYSTEM);
    expect(isSystemDiskRangeDisabled(targetVm)).toBe(false);
    expect(
      getDataVolumeMigrateRows(targetVm).map((row) => row.disabledCode),
    ).toEqual([
      DATA_VOLUME_MIGRATE_DISABLED_CODE.VM_STATE_NOT_SUPPORT_MIGRATION,
      DATA_VOLUME_MIGRATE_DISABLED_CODE.VM_STATE_NOT_SUPPORT_MIGRATION,
    ]);
  });

  it("selects data disk only when ZCE root has mixed data volume storage", () => {
    const root = volume("root", "Root", ps("Ceph"));
    const targetVm = vm("Running", ps("Ceph"), [
      root,
      volume("zce-data", "Data", ps("Ceph")),
      volume("san-data", "Data", ps("SharedBlock")),
    ]);

    expect(canChangeDataStorage(targetVm)).toBe(true);
    expect(getDefaultMigrationRange(targetVm)).toBe(MIGRATION_RANGE.DATA);
    expect(isSystemDiskRangeDisabled(targetVm)).toBe(true);
    expect(
      getDataVolumeMigrateRows(targetVm).map((row) => row.disabledCode),
    ).toEqual([
      DATA_VOLUME_MIGRATE_DISABLED_CODE.VM_STATE_NOT_SUPPORT_MIGRATION,
      undefined,
    ]);
  });

  it("builds data volume rows by excluding root and memory volumes", () => {
    const rows = getDataVolumeMigrateRows(
      vm("Stopped", ps("Ceph"), [
        volume("root", "Root", ps("Ceph")),
        volume("memory", "Memory", ps("Ceph")),
        volume("data-1", "Data", ps("SharedBlock")),
        volume("data-2", "Data", ps("NFS")),
      ]),
    );

    expect(rows.map((row) => row.diskNo)).toEqual([2, 3]);
    expect(rows.map((row) => row.currentPrimaryStorage?.name)).toEqual([
      "SharedBlock-none",
      "NFS-none",
    ]);
  });

  it("keeps disk numbers aligned with edit-config disk ordering", () => {
    const rows = getDataVolumeMigrateRows(
      vm("Stopped", ps("Ceph"), [
        volume("data-late", "Data", ps("NFS"), 1024 ** 3, {
          deviceId: 3,
          lastAttachDate: "2026-06-01T00:00:03.000Z",
        }),
        volume("root", "Root", ps("Ceph"), 1024 ** 3, {
          deviceId: 0,
          lastAttachDate: "2026-06-01T00:00:00.000Z",
        }),
        volume("memory", "Memory", ps("Ceph")),
        volume("data-early", "Data", ps("SharedBlock"), 1024 ** 3, {
          deviceId: 1,
          lastAttachDate: "2026-06-01T00:00:01.000Z",
        }),
      ]),
    );

    expect(rows.map((row) => [row.volumeUuid, row.diskNo])).toEqual([
      ["data-early", 2],
      ["data-late", 3],
    ]);
  });

  it("uses VM state disabled type for running NFS and ZCE data disks", () => {
    const rows = getDataVolumeMigrateRows(
      vm("Running", ps("Ceph"), [
        volume("root", "Root", ps("Ceph")),
        volume("data-1", "Data", ps("Ceph")),
        volume("data-2", "Data", ps("NFS")),
        volume("data-3", "Data", ps("BlockStorage")),
      ]),
    );

    expect(rows.map((row) => row.disabledCode)).toEqual([
      DATA_VOLUME_MIGRATE_DISABLED_CODE.VM_STATE_NOT_SUPPORT_MIGRATION,
      DATA_VOLUME_MIGRATE_DISABLED_CODE.VM_STATE_NOT_SUPPORT_MIGRATION,
      DATA_VOLUME_MIGRATE_DISABLED_CODE.CURRENT_STORAGE_NOT_SUPPORT_MIGRATION,
    ]);
  });

  it("disables migrate-all when no data volume can be migrated", () => {
    const rows = getDataVolumeMigrateRows(
      vm("Running", ps("Ceph"), [
        volume("root", "Root", ps("Ceph")),
        volume("data-1", "Data", ps("Ceph")),
        volume("data-2", "Data", ps("NFS")),
        volume("data-3", "Data", ps("BlockStorage")),
      ]),
    );

    expect(canMigrateMoreDataVolumes(rows)).toBe(false);
  });

  it("disables migrate-all after every eligible data volume is selected", () => {
    const rows = getDataVolumeMigrateRows(
      vm("Stopped", ps("Ceph"), [
        volume("root", "Root", ps("Ceph")),
        volume("data-1", "Data", ps("Ceph")),
        volume("data-2", "Data", ps("NFS")),
        volume("data-3", "Data", ps("BlockStorage")),
      ]),
    );

    expect(canMigrateMoreDataVolumes(rows)).toBe(true);
    expect(
      canMigrateMoreDataVolumes(
        rows.map((row) => ({
          ...row,
          migrate: !row.disabledCode,
        })),
      ),
    ).toBe(false);
  });

  it("detects primary storage trash by migrated volume uuid", () => {
    expect(
      hasPrimaryStorageTrashForResource(
        [
          { resourceUuid: "data-1", resourceType: "Volume" },
          { resourceUuid: "data-2", resourceType: "Volume" },
        ],
        "data-2",
      ),
    ).toBe(true);
    expect(
      hasPrimaryStorageTrashForResource(
        [{ resourceUuid: "data-1", resourceType: "Volume" }],
        "data-3",
      ),
    ).toBe(false);
  });

  it("filters data volume migration target storage by VM cluster", () => {
    expect(
      buildDataVolumePrimaryStorageDefaultQuery(
        {
          ...getDataVolumeMigrateRows(
            vm("Stopped", ps("Ceph"), [
              volume("root", "Root", ps("Ceph")),
              volume("data-1", "Data", ps("Ceph")),
            ]),
          )[0],
        },
        { clusterUuid: "cluster-1" },
      ),
    ).toMatchObject({
      conditions: [
        { key: "status", op: "eq", value: "Connected" },
        { key: "cluster.uuid", op: "eq", value: "cluster-1" },
      ],
      type: "GetPrimaryStorageCandidatesForVolumeMigration",
      extraConditions: [{ key: "volumeUuid", op: "eq", value: "data-1" }],
    });
  });

  it("returns validation status and BFF migration payloads for selected rows", () => {
    const rows = getDataVolumeMigrateRows(
      vm("Stopped", ps("Ceph"), [
        volume("root", "Root", ps("Ceph")),
        volume("data-1", "Data", ps("Ceph")),
        volume("data-2", "Data", ps("NFS")),
      ]),
    );

    expect(buildDataVolumeMigratePayload(rows)).toEqual({
      ok: false,
      code: "NO_SELECTED_VOLUME",
    });

    expect(
      buildDataVolumeMigratePayload([
        { ...rows[0], migrate: true, targetPrimaryStorage: null },
      ]),
    ).toEqual({
      ok: false,
      code: "MISSING_TARGET_STORAGE",
    });

    expect(
      buildDataVolumeMigratePayload([
        {
          ...rows[0],
          migrate: true,
          targetPrimaryStorage: ps("Ceph"),
          targetStoragePool: { poolName: "pool-a" },
        },
        {
          ...rows[1],
          migrate: true,
          targetPrimaryStorage: ps("NFS"),
          targetStoragePool: null,
        },
      ]),
    ).toEqual({
      ok: true,
      payload: [
        {
          volumeUuid: "data-1",
          dstPrimaryStorageUuid: "Ceph-none",
          systemTags: ["ceph::pool::pool-a"],
        },
        {
          volumeUuid: "data-2",
          dstPrimaryStorageUuid: "NFS-none",
        },
      ],
    });
  });

  it("builds data volume VM migration payload with snapshots disabled on AOs", () => {
    expect(
      buildDataVolumeMigrateVmPayload("vm-1", [
        {
          volumeUuid: "data-1",
          dstPrimaryStorageUuid: "SharedBlock-none",
        },
        {
          volumeUuid: "data-2",
          dstPrimaryStorageUuid: "target-san-2",
        },
      ]),
    ).toEqual({
      vmInstanceUuid: "vm-1",
      volumeMigrationAOs: [
        {
          volumeUuid: "data-1",
          dstPrimaryStorageUuid: "SharedBlock-none",
          withSnapshots: false,
        },
        {
          volumeUuid: "data-2",
          dstPrimaryStorageUuid: "target-san-2",
          withSnapshots: false,
        },
      ],
    });
  });

  it("builds volumeMigrationAOs with root volume only", () => {
    expect(
      buildVolumeMigrationAOs(
        [
          volume("root", "Root", ps("SharedBlock")),
          volume("data", "Data", ps("SharedBlock")),
          volume("memory", "Memory", ps("SharedBlock")),
        ],
        "target-ps",
        false,
        false,
      ),
    ).toEqual([
      {
        volumeUuid: "root",
        dstPrimaryStorageUuid: "target-ps",
        withSnapshots: false,
      },
    ]);
  });

  it("builds volumeMigrationAOs with root and data volumes with snapshots enabled", () => {
    expect(
      buildVolumeMigrationAOs(
        [
          volume("root", "Root", ps("SharedBlock")),
          volume("data", "Data", ps("SharedBlock")),
          volume("memory", "Memory", ps("SharedBlock")),
        ],
        "target-ps",
        true,
        true,
      ),
    ).toEqual([
      {
        volumeUuid: "root",
        dstPrimaryStorageUuid: "target-ps",
        withSnapshots: true,
      },
      {
        volumeUuid: "data",
        dstPrimaryStorageUuid: "target-ps",
        withSnapshots: true,
      },
    ]);
  });
});
