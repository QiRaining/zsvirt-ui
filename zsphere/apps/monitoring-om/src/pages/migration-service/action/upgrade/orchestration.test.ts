import { describe, expect, it, vi } from "vitest";

import {
  executeUpgradeRequest,
  runUpgradeAfterSuccessfulCleanup,
} from "./orchestration";

describe("executeUpgradeRequest", () => {
  it.each([
    ["local", true],
    ["URL", false],
  ])(
    "returns the original %s branch rejection",
    async (_label, isLocalUpload) => {
      const originalError = new Error(`${_label} upgrade failed`);
      const selectedPromise = Promise.reject(originalError);
      void selectedPromise.catch(() => undefined);
      const submitLocalUpload = vi.fn(() =>
        isLocalUpload ? selectedPromise : Promise.resolve(),
      );
      const submitUrlUpgrade = vi.fn(() =>
        isLocalUpload ? Promise.resolve() : selectedPromise,
      );

      await expect(
        executeUpgradeRequest({
          isLocalUpload,
          submitLocalUpload,
          submitUrlUpgrade,
        }),
      ).rejects.toBe(originalError);

      expect(submitLocalUpload).toHaveBeenCalledTimes(isLocalUpload ? 1 : 0);
      expect(submitUrlUpgrade).toHaveBeenCalledTimes(isLocalUpload ? 0 : 1);
    },
  );
});

describe("runUpgradeAfterSuccessfulCleanup", () => {
  it("executes and awaits upgrade after fully successful cleanup", async () => {
    const submitCleanup = vi.fn((onFinish) => {
      onFinish({ total: 1, success: 1, fail: 0, exception: 0 });
      return Promise.resolve();
    });
    const executeUpgrade = vi.fn();

    await runUpgradeAfterSuccessfulCleanup({ executeUpgrade, submitCleanup });

    expect(submitCleanup).toHaveBeenCalledTimes(1);
    expect(executeUpgrade).toHaveBeenCalledTimes(1);
  });

  it("propagates the original async upgrade failure", async () => {
    const originalError = new Error("local upload hashcheck failed");
    const upgradePromise = Promise.reject(originalError);
    void upgradePromise.catch(() => undefined);
    const submitCleanup = vi.fn((onFinish) => {
      onFinish({ total: 1, success: 1, fail: 0, exception: 0 });
      return Promise.resolve();
    });
    const executeUpgrade = vi.fn(() => upgradePromise);

    await expect(
      runUpgradeAfterSuccessfulCleanup({ executeUpgrade, submitCleanup }),
    ).rejects.toBe(originalError);

    expect(submitCleanup).toHaveBeenCalledTimes(1);
    expect(executeUpgrade).toHaveBeenCalledTimes(1);
  });

  it("propagates the original cleanup submission failure once", async () => {
    const originalError = new Error("cleanup submission failed");
    const submitCleanup = vi.fn(async () => {
      throw originalError;
    });
    const executeUpgrade = vi.fn();

    await expect(
      runUpgradeAfterSuccessfulCleanup({ executeUpgrade, submitCleanup }),
    ).rejects.toBe(originalError);

    expect(submitCleanup).toHaveBeenCalledTimes(1);
    expect(executeUpgrade).not.toHaveBeenCalled();
  });

  it.each([
    { total: 1, success: 0, fail: 1, exception: 0 },
    { total: 1, success: 0, fail: 0, exception: 1 },
    { total: 2, success: 1, fail: 0, exception: 0 },
  ])("does not execute upgrade after invalid cleanup %#", async (completion) => {
    const submitCleanup = vi.fn((onFinish) => {
      onFinish(completion);
      return Promise.resolve();
    });
    const executeUpgrade = vi.fn();

    await runUpgradeAfterSuccessfulCleanup({ executeUpgrade, submitCleanup });

    expect(submitCleanup).toHaveBeenCalledTimes(1);
    expect(executeUpgrade).not.toHaveBeenCalled();
  });
});
