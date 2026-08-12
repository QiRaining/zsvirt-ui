import { describe, expect, it } from "vitest";

import {
  shouldEmitZMigrateRuntimeRefresh,
  syncCurrentZMigrateWithPackage,
} from "./current-zmigrate-sync";

const runtimeConfig = {
  installed: true,
  gatewayHostIp: "192.0.2.10",
  platformAccountUuid: "account-old",
  platformRegionUuid: "region-old",
  zsMnServer: "mn-old",
  sessionId: "session-old",
  gatewayImageUuid: "gateway-image-old",
  linuxBootImageUuid: "linux-image-old",
  windowsBootImageUuid: "windows-image-old",
};

describe("syncCurrentZMigrateWithPackage", () => {
  it("clears stale package image fields when the backend package is cleaned", () => {
    expect(
      syncCurrentZMigrateWithPackage({
        previous: runtimeConfig,
        packageData: undefined,
        isServiceInstalled: false,
      }),
    ).toEqual({
      installed: false,
      gatewayHostIp: "192.0.2.10",
      platformAccountUuid: "account-old",
      platformRegionUuid: "region-old",
      zsMnServer: "mn-old",
      sessionId: "session-old",
    });
  });

  it("replaces old package image fields after the package is reinstalled", () => {
    expect(
      syncCurrentZMigrateWithPackage({
        previous: runtimeConfig,
        packageData: {
          status: "Installed",
          gatewayImageUuid: "gateway-image-new",
          linuxBootImageUuid: "linux-image-new",
          windowsBootImageUuid: "windows-image-new",
        },
        isServiceInstalled: true,
      }),
    ).toMatchObject({
      installed: true,
      gatewayImageUuid: "gateway-image-new",
      linuxBootImageUuid: "linux-image-new",
      windowsBootImageUuid: "windows-image-new",
    });
  });

  it("does not create a partial config before the host runtime config is ready", () => {
    const previous = {};

    expect(
      syncCurrentZMigrateWithPackage({
        previous,
        packageData: {
          status: "Installed",
          gatewayImageUuid: "gateway-image-new",
        },
        isServiceInstalled: true,
      }),
    ).toBe(previous);
  });
});

describe("shouldEmitZMigrateRuntimeRefresh", () => {
  it("does not emit for the initial package signature hydration", () => {
    expect(
      shouldEmitZMigrateRuntimeRefresh({
        previousSignature: undefined,
        nextSignature: "Installed|gateway-image|linux-image|windows-image",
      }),
    ).toBe(false);
  });

  it("emits only when an existing package signature changes", () => {
    expect(
      shouldEmitZMigrateRuntimeRefresh({
        previousSignature: "Installed|gateway-image|linux-image|windows-image",
        nextSignature: "Installed|gateway-image|linux-image|windows-image",
      }),
    ).toBe(false);

    expect(
      shouldEmitZMigrateRuntimeRefresh({
        previousSignature: "Installed|gateway-image|linux-image|windows-image",
        nextSignature: "Installed|gateway-image-new|linux-image|windows-image",
      }),
    ).toBe(true);
  });
});
