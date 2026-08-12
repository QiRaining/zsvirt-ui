import { describe, expect, it } from "vitest";

import { buildUpgradeMigrationServicePayload } from "./payload";

describe("buildUpgradeMigrationServicePayload", () => {
  it("builds a Normal URL re-upload", () => {
    expect(
      buildUpgradeMigrationServicePayload({
        softwarePackageUuid: "package-1",
        upgradeType: "Normal",
        uploadMethod: "url",
        url: "https://example.com/zmigrate-2.tar.gz",
        installPath: "/zmigrate/package",
        fileName: "zmigrate-2.tar.gz",
      }),
    ).toEqual({
      uuid: "package-1",
      upgradeType: "Normal",
      installPath: "/zmigrate/package/zmigrate-2.tar.gz",
      url: "https://example.com/zmigrate-2.tar.gz",
    });
  });

  it("builds a Normal local re-upload", () => {
    expect(
      buildUpgradeMigrationServicePayload({
        softwarePackageUuid: "package-1",
        upgradeType: "Normal",
        uploadMethod: "local",
        installPath: "/zmigrate/package/",
        fileName: "zmigrate-2.tar.gz",
      }),
    ).toEqual({
      uuid: "package-1",
      upgradeType: "Normal",
      installPath: "/zmigrate/package/zmigrate-2.tar.gz",
      url: "upload://zmigrate-2.tar.gz",
    });
  });

  it("builds a Reexecute payload with explicit null upload fields", () => {
    expect(
      buildUpgradeMigrationServicePayload({
        softwarePackageUuid: "package-1",
        upgradeType: "Reexecute",
      }),
    ).toEqual({
      uuid: "package-1",
      upgradeType: "Reexecute",
      backupStorageUuid: null,
      installPath: null,
      url: null,
    });
  });
});
