import type { DocumentNode } from "@apollo/client";
import { describe, expect, it, vi } from "vitest";

import {
  buildCleanupUpgradePackageAction,
  buildUpgradeMigrationServiceAction,
} from "./action-request";

const mutation = {} as DocumentNode;

describe("buildUpgradeMigrationServiceAction", () => {
  it.each(["Normal", "Reexecute"] as const)(
    "marks the direct %s upgrade branch as MigrationService",
    (upgradeType) => {
      const payload = { uuid: "package-1", upgradeType };

      expect(
        buildUpgradeMigrationServiceAction({
          mutation,
          name: "Upgrade Migration Service",
          payload,
        }),
      ).toEqual({
        mutation,
        name: "Upgrade Migration Service",
        payload,
        total: 1,
        type: "MigrationService",
      });
    },
  );
});

describe("buildCleanupUpgradePackageAction", () => {
  it("marks retry cleanup as MigrationService while preserving its continuation", () => {
    const onFinish = vi.fn();

    expect(
      buildCleanupUpgradePackageAction({
        mutation,
        name: "Cleanup Upgrade Package",
        onFinish,
        softwarePackageUuid: "package-1",
      }),
    ).toEqual({
      forceRunCallback: true,
      mutation,
      name: "Cleanup Upgrade Package",
      onFinish,
      payload: [{ uuid: "package-1" }],
      total: 1,
      type: "MigrationService",
    });
  });
});
