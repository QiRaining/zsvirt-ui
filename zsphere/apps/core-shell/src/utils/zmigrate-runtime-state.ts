const INSTALLED_STATUSES = [
  "Installed",
  "Upgraded",
  "Upgrading",
  "UpgradePackageUploaded",
  "UpgradePackageUploadFailed",
  "UpgradeExecuteFailed",
] as const;

const PACKAGE_IMAGE_KEYS = [
  "gatewayImageUuid",
  "linuxBootImageUuid",
  "windowsBootImageUuid",
] as const;

export const ZMIGRATE_RUNTIME_BACKGROUND_TTL_MS = 5 * 60_000;
export const ZMIGRATE_RUNTIME_BEFORE_MOUNT_TTL_MS = 30_000;
export const ZMIGRATE_RUNTIME_RESUME_TTL_MS =
  ZMIGRATE_RUNTIME_BACKGROUND_TTL_MS;
export const ZMIGRATE_RUNTIME_PACKAGE_CHANGE_REASON =
  "migration-service-package-change";

interface ZMigrateRuntimeConfig {
  gatewayHostIp?: string | null;
  zsMnServer?: string | null;
  globalConfigs?: {
    gatewaySshPassword?: string | null;
    platformRegionUuid?: string | null;
    platformAccountUuid?: string | null;
  } | null;
}

interface MigrationServicePackage {
  status?: string | null;
  gatewayImageUuid?: string | null;
  linuxBootImageUuid?: string | null;
  windowsBootImageUuid?: string | null;
}

interface ZMigrateRuntimeData {
  getZMigrateRuntimeConfig?: ZMigrateRuntimeConfig | null;
  getMigrationServicePackage?: MigrationServicePackage | null;
  getCurrentTime?: {
    timezone?: string | null;
  } | null;
}

export type CurrentZMigrateState = Record<string, unknown>;

const isInstalledStatus = (status?: string | null): boolean =>
  !!status && INSTALLED_STATUSES.includes(status as never);

export function buildCurrentZMigrateState(
  zmigrateData: ZMigrateRuntimeData,
  sessionId: string,
): CurrentZMigrateState {
  const runtime = zmigrateData.getZMigrateRuntimeConfig;
  const pkg = zmigrateData.getMigrationServicePackage;
  const globalConfigs = runtime?.globalConfigs ?? {};

  const zmigrateState: CurrentZMigrateState = {
    installed: isInstalledStatus(pkg?.status),
    gatewayHostIp: runtime?.gatewayHostIp ?? "",
    gatewaySshPassword: globalConfigs.gatewaySshPassword ?? "",
    platformRegionUuid: globalConfigs.platformRegionUuid ?? "",
    platformAccountUuid: globalConfigs.platformAccountUuid ?? "",
    zsMnServer: runtime?.zsMnServer ?? "",
    sessionId,
  };

  PACKAGE_IMAGE_KEYS.forEach((key) => {
    const value = pkg?.[key];
    if (value) {
      zmigrateState[key] = value;
    }
  });

  const timezone = zmigrateData.getCurrentTime?.timezone;
  if (timezone) {
    zmigrateState.platformTimezone = timezone;
  }

  return zmigrateState;
}

export function areCurrentZMigrateStatesEqual(
  left: CurrentZMigrateState | undefined,
  right: CurrentZMigrateState,
): boolean {
  if (!left) return false;

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key) => left[key] === right[key]);
}

export function shouldRefreshZMigrateRuntimeOnResume(
  lastFetchedAt: number,
  now: number,
  ttlMs = ZMIGRATE_RUNTIME_RESUME_TTL_MS,
): boolean {
  return lastFetchedAt === 0 || now - lastFetchedAt >= ttlMs;
}

interface ShouldFetchZMigrateRuntimeOptions {
  reason?: string;
  lastFetchedAt: number;
  now: number;
}

export function shouldFetchZMigrateRuntime({
  reason,
  lastFetchedAt,
  now,
}: ShouldFetchZMigrateRuntimeOptions): boolean {
  if (reason === ZMIGRATE_RUNTIME_PACKAGE_CHANGE_REASON) {
    return true;
  }

  if (lastFetchedAt === 0) {
    return true;
  }

  const ttlMs =
    reason === "before-mount-zmigrate"
      ? ZMIGRATE_RUNTIME_BEFORE_MOUNT_TTL_MS
      : ZMIGRATE_RUNTIME_BACKGROUND_TTL_MS;

  return now - lastFetchedAt >= ttlMs;
}
