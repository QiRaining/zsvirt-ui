import { describe, expect, it } from "vitest";

import {
  areCurrentZMigrateStatesEqual,
  buildCurrentZMigrateState,
  shouldFetchZMigrateRuntime,
  shouldRefreshZMigrateRuntimeOnResume,
} from "./zmigrate-runtime-state";

const runtime = {
  gatewayHostIp: "192.0.2.10",
  zsMnServer: "mn.local",
  globalConfigs: {
    gatewaySshPassword: "password",
    platformRegionUuid: "region-uuid",
    platformAccountUuid: "account-uuid",
  },
};

describe("buildCurrentZMigrateState", () => {
  it("builds a complete installed state from the runtime query", () => {
    expect(
      buildCurrentZMigrateState(
        {
          getZMigrateRuntimeConfig: runtime,
          getMigrationServicePackage: {
            status: "Installed",
            gatewayImageUuid: "gateway-image-new",
            linuxBootImageUuid: "linux-image-new",
            windowsBootImageUuid: "windows-image-new",
          },
          getCurrentTime: {
            timezone: "Asia/Shanghai",
          },
        },
        "session-uuid",
      ),
    ).toEqual({
      installed: true,
      gatewayHostIp: "192.0.2.10",
      gatewaySshPassword: "password",
      platformRegionUuid: "region-uuid",
      platformAccountUuid: "account-uuid",
      zsMnServer: "mn.local",
      sessionId: "session-uuid",
      gatewayImageUuid: "gateway-image-new",
      linuxBootImageUuid: "linux-image-new",
      windowsBootImageUuid: "windows-image-new",
      platformTimezone: "Asia/Shanghai",
    });
  });

  it("returns a clean uninstalled state when the package has been cleaned", () => {
    expect(
      buildCurrentZMigrateState(
        {
          getZMigrateRuntimeConfig: runtime,
          getMigrationServicePackage: null,
          getCurrentTime: {
            timezone: "Asia/Shanghai",
          },
        },
        "session-uuid",
      ),
    ).toEqual({
      installed: false,
      gatewayHostIp: "192.0.2.10",
      gatewaySshPassword: "password",
      platformRegionUuid: "region-uuid",
      platformAccountUuid: "account-uuid",
      zsMnServer: "mn.local",
      sessionId: "session-uuid",
      platformTimezone: "Asia/Shanghai",
    });
  });
});

describe("areCurrentZMigrateStatesEqual", () => {
  it("treats matching state values as equal so polling does not rewrite the store", () => {
    expect(
      areCurrentZMigrateStatesEqual(
        {
          installed: false,
          gatewayHostIp: "192.0.2.10",
        },
        {
          installed: false,
          gatewayHostIp: "192.0.2.10",
        },
      ),
    ).toBe(true);
  });
});

describe("shouldRefreshZMigrateRuntimeOnResume", () => {
  it("refreshes only when no runtime has been fetched or the resume ttl has expired", () => {
    expect(shouldRefreshZMigrateRuntimeOnResume(0, 60_000, 60_000)).toBe(true);
    expect(shouldRefreshZMigrateRuntimeOnResume(10_000, 69_999, 60_000)).toBe(
      false,
    );
    expect(shouldRefreshZMigrateRuntimeOnResume(10_000, 70_000, 60_000)).toBe(
      true,
    );
  });
});

describe("shouldFetchZMigrateRuntime", () => {
  it("uses a longer background ttl for boot and resume refreshes", () => {
    expect(
      shouldFetchZMigrateRuntime({
        reason: "boot",
        lastFetchedAt: 10_000,
        now: 10_000 + 5 * 60_000 - 1,
      }),
    ).toBe(false);

    expect(
      shouldFetchZMigrateRuntime({
        reason: "resume",
        lastFetchedAt: 10_000,
        now: 10_000 + 5 * 60_000,
      }),
    ).toBe(true);
  });

  it("allows zmigrate mount to refresh after a short freshness window", () => {
    expect(
      shouldFetchZMigrateRuntime({
        reason: "before-mount-zmigrate",
        lastFetchedAt: 10_000,
        now: 39_999,
      }),
    ).toBe(false);

    expect(
      shouldFetchZMigrateRuntime({
        reason: "before-mount-zmigrate",
        lastFetchedAt: 10_000,
        now: 40_000,
      }),
    ).toBe(true);
  });

  it("always refreshes after a migration service package change", () => {
    expect(
      shouldFetchZMigrateRuntime({
        reason: "migration-service-package-change",
        lastFetchedAt: 10_000,
        now: 10_001,
      }),
    ).toBe(true);
  });
});
