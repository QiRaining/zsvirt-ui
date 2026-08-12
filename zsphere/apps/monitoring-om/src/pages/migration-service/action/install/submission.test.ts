import { describe, expect, it, vi } from "vitest";

import { submitInstallAction } from "./submission";

describe("submitInstallAction", () => {
  it("returns the original action rejection without closing the modal", async () => {
    const originalError = new Error("install mutation failed");
    const onActionStart = vi.fn();
    const closeAfterSuccess = vi.fn();

    await expect(
      submitInstallAction({
        onActionStart,
        submitAction: () => Promise.reject(originalError),
      }).then(closeAfterSuccess),
    ).rejects.toBe(originalError);

    expect(onActionStart).toHaveBeenCalledTimes(1);
    expect(closeAfterSuccess).not.toHaveBeenCalled();
  });

  it("closes only after the install action has been accepted", async () => {
    const order: string[] = [];

    await submitInstallAction({
      onActionStart: () => order.push("start"),
      submitAction: async () => {
        order.push("action");
        return "accepted";
      },
    }).then(() => order.push("close"));

    expect(order).toEqual(["start", "action", "close"]);
  });
});
