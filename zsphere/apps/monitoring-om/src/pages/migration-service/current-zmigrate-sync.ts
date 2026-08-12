import type { MigrationPackageData } from "./types";

const CORE_CONFIG_KEYS = [
  "gatewayHostIp",
  "platformAccountUuid",
  "platformRegionUuid",
  "zsMnServer",
  "sessionId",
] as const;

const PACKAGE_IMAGE_KEYS = [
  "gatewayImageUuid",
  "linuxBootImageUuid",
  "windowsBootImageUuid",
] as const;

interface SyncCurrentZMigrateOptions {
  previous?: Record<string, unknown> | null;
  packageData?: MigrationPackageData | null;
  isServiceInstalled: boolean;
}

interface ShouldEmitZMigrateRuntimeRefreshOptions {
  previousSignature?: string;
  nextSignature: string;
}

const hasHostRuntimeConfig = (state: Record<string, unknown>): boolean =>
  CORE_CONFIG_KEYS.some(
    (key) => typeof state[key] === "string" && state[key].length > 0,
  );

const shallowEqual = (
  left: Record<string, unknown>,
  right: Record<string, unknown>,
): boolean => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key) => left[key] === right[key]);
};

export function syncCurrentZMigrateWithPackage({
  previous,
  packageData,
  isServiceInstalled,
}: SyncCurrentZMigrateOptions): Record<string, unknown> {
  const previousState = previous ?? {};

  if (!hasHostRuntimeConfig(previousState)) {
    return previousState;
  }

  const nextState: Record<string, unknown> = {
    ...previousState,
    installed: isServiceInstalled,
  };

  PACKAGE_IMAGE_KEYS.forEach((key) => {
    const value = packageData?.[key];
    if (value) {
      nextState[key] = value;
      return;
    }

    delete nextState[key];
  });

  return shallowEqual(previousState, nextState) ? previousState : nextState;
}

export function shouldEmitZMigrateRuntimeRefresh({
  previousSignature,
  nextSignature,
}: ShouldEmitZMigrateRuntimeRefreshOptions): boolean {
  return previousSignature !== undefined && previousSignature !== nextSignature;
}
