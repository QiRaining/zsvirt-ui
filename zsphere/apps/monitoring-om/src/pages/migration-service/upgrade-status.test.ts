import { describe, expect, it } from "vitest";

import type { UpgradeTask } from "./types";
import { getEffectiveUpgradeTask } from "./upgrade-status";

const failedTask: UpgradeTask = {
  uuid: "failed-10-1-119",
  version: "10.1.119",
  status: "failed",
};

describe("getEffectiveUpgradeTask", () => {
  it("ignores a stale failed task from an older version after reinstall succeeds", () => {
    expect(
      getEffectiveUpgradeTask({
        serviceVersion: "10.1.122.10",
        softwarePackageStatus: "Upgraded",
        upgradeTasks: [failedTask],
      }),
    ).toBeUndefined();
  });

  it("keeps showing a running upgrade task", () => {
    const runningTask: UpgradeTask = {
      uuid: "running-10-1-123",
      version: "10.1.123",
      status: "running",
    };

    expect(
      getEffectiveUpgradeTask({
        serviceVersion: "10.1.122.10",
        softwarePackageStatus: "Upgrading",
        upgradeTasks: [failedTask, runningTask],
      }),
    ).toBe(runningTask);
  });

  it("shows failed only when the failed package status is current enough", () => {
    const currentFailedTask: UpgradeTask = {
      uuid: "failed-10-1-123",
      version: "10.1.123",
      status: "failed",
    };

    expect(
      getEffectiveUpgradeTask({
        serviceVersion: "10.1.122.10",
        softwarePackageStatus: "UpgradeExecuteFailed",
        upgradeTasks: [failedTask, currentFailedTask],
      }),
    ).toBe(currentFailedTask);
  });

  it("suppresses failed package status when the only failed task is older than the installed version", () => {
    expect(
      getEffectiveUpgradeTask({
        serviceVersion: "10.1.122.10",
        softwarePackageStatus: "UpgradeExecuteFailed",
        upgradeTasks: [failedTask],
      }),
    ).toBeUndefined();
  });
});
