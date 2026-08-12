import { parseNumber } from "@zstack/zsphere-utils";

import { MigrationPackageData } from "./types";

export interface MigrationServiceConfig {
  name: string;
  cpuNum: number;
  memorySize: number;
  imageUuid: string;
  l3NetworkUuids: string[];
  clusterUuid?: string;
  hostUuid?: string;
  defaultL3NetworkUuid: string;
  strategy: string;
  platform: string;
  guestOsType: string;
  architecture: string;
  virtio: boolean;
  primaryStorageUuidForRootVolume: string;
  systemTags?: string[];
  rootVolumeSystemTags?: string[];
  rootDiskSize: number;
  // TODO: temporary workaround for Java backend bug, remove after backend fix
  session?: {
    uuid: string;
    accountUuid: string;
    noSessionEvaluation: boolean;
  };
}

export const DEFAULT_MIGRATION_CONFIG = {
  name: "ZMigrate-gateway",
  strategy: "InstantStart",
  platform: "Linux",
  guestOsType: "Linux",
  architecture: "x86_64",
  virtio: true,
};

export function buildMigrationServiceConfig(
  data: Record<string, unknown>,
  packageData?: MigrationPackageData,
): string {
  // runPath: ModalTreeSelect returns the raw GQL object with __typename
  const runPath = (
    data.runPath as Array<{
      uuid: string;
      __typename: string;
      attr?: Record<string, unknown>;
    }>
  )?.[0];
  const runPathField: { clusterUuid?: string; hostUuid?: string } = {};
  if (runPath) {
    if (runPath.__typename === "Cluster") {
      runPathField.clusterUuid = runPath.uuid;
    } else if (runPath.__typename === "HostVO") {
      runPathField.hostUuid = runPath.uuid;
    }
  }

  // migrationNetwork: ModalSelect returns [{ uuid }]
  const migrationNetwork = (
    data.migrationNetwork as Array<{ uuid: string }>
  )?.[0];
  const l3NetworkUuid = migrationNetwork?.uuid || "";

  // storePath: ModalSelect returns [{ uuid, type }]
  const storePath = (
    data.storePath as Array<{ uuid: string; type: string }>
  )?.[0];
  const primaryStorageUuidForRootVolume = storePath?.uuid || "";

  // memory: InputUnit returns { number, unit }
  const memory = data.memory as { number: number; unit: string } | undefined;
  const memorySize = parseNumber(memory?.number ?? 0, memory?.unit ?? "B");

  // disk1Size: InputUnit returns { number, unit }
  const disk1Size = data.disk1Size as
    | { number: number; unit: string }
    | undefined;
  const rootDiskSize = parseNumber(
    disk1Size?.number ?? 0,
    disk1Size?.unit ?? "B",
  );

  // systemtags: staticIp if ipv4Address is provided.
  // 端口组未启用 DHCP 时还会带上掩码 / 网关（与新建虚拟机的端口组系统标签格式一致，
  // 见 apps/resource-shared/.../create-vm-by-resource/hooks.ts:getSystemTagsFromNoIPAMInput）。
  const systemTags: string[] = [];
  const ipv4Address = data.ipv4Address as string | undefined;
  const ipv4Netmask = data.ipv4Netmask as string | undefined;
  const ipv4Gateway = data.ipv4Gateway as string | undefined;
  if (ipv4Address) {
    systemTags.push(`staticIp::${l3NetworkUuid}::${ipv4Address}`);
  }
  if (ipv4Netmask) {
    systemTags.push(`ipv4Netmask::${l3NetworkUuid}::${ipv4Netmask}`);
  }
  if (ipv4Gateway) {
    systemTags.push(`ipv4Gateway::${l3NetworkUuid}::${ipv4Gateway}`);
  }

  // rootVolumeSystemTags: ceph pool if volumeStoragePool is selected
  const rootVolumeSystemTags: string[] = [];
  const volumeStoragePool = (
    data.volumeStoragePool as Array<{ poolName: string }>
  )?.[0];
  if (volumeStoragePool?.poolName) {
    rootVolumeSystemTags.push(
      `ceph::rootPoolName::${volumeStoragePool.poolName}`,
    );
  }

  const config: MigrationServiceConfig = {
    ...DEFAULT_MIGRATION_CONFIG,
    cpuNum: (data.cpu as number) || 0,
    memorySize,
    imageUuid: packageData?.gatewayImageUuid || "",
    l3NetworkUuids: [l3NetworkUuid],
    ...runPathField,
    defaultL3NetworkUuid: l3NetworkUuid,
    primaryStorageUuidForRootVolume,
    systemTags,
    rootVolumeSystemTags,
    rootDiskSize,
  };

  return JSON.stringify(config);
}

/**
 * 校验文件名是否以 .tar.gz 结尾
 */
export function isTarGzFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".tar.gz");
}

/**
 * 从安装包文件名中提取版本号
 * 支持格式: ZMigrate-5.3.0.bin, ZMigrate-5.3.0-rc1.bin, zmigrate-5.3.0.tar.gz 等
 * @returns 版本号字符串（如 "5.3.0"），提取失败返回 null
 */
export function extractVersionFromName(name: string): string | null {
  const match = name.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

/**
 * 比较两个语义化版本号
 * @returns  1: v1 > v2,  0: v1 === v2,  -1: v1 < v2
 */
export function compareVersion(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}
