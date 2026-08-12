import { describe, expect, it } from "vitest";

import {
  applyActionResultToDeploySteps,
  isActionSummaryResult,
} from "./deploy-state";
import type { IDeploySteps } from "./types";

const runningHostSteps: IDeploySteps = [
  {
    type: "Zone",
    state: "finish",
    total: 1,
    success: 1,
    fail: 0,
  },
  {
    type: "Cluster",
    state: "finish",
    total: 1,
    success: 1,
    fail: 0,
  },
  {
    type: "HostVO",
    state: "running",
    total: 3,
    success: 0,
    fail: 0,
    startTime: "2026-05-25T00:00:00.000Z",
  },
];

describe("auto init deploy state", () => {
  it("accumulates multiple HostVO success callbacks until the step finishes", () => {
    const first = applyActionResultToDeploySteps(runningHostSteps, {
      type: "HostVO",
      state: "success",
      actionId: "add-host",
      id: "host-1",
      inventory: JSON.stringify({ uuid: "host-1", name: "host-1" }),
    });
    const second = applyActionResultToDeploySteps(first.steps, {
      type: "HostVO",
      state: "success",
      actionId: "add-host",
      id: "host-2",
      inventory: JSON.stringify({ uuid: "host-2", name: "host-2" }),
    });
    const third = applyActionResultToDeploySteps(second.steps, {
      type: "HostVO",
      state: "success",
      actionId: "add-host",
      id: "host-3",
      inventory: JSON.stringify({ uuid: "host-3", name: "host-3" }),
    });

    const hostStep = third.steps.find((step) => step.type === "HostVO");

    expect(hostStep).toMatchObject({
      state: "finish",
      total: 3,
      success: 3,
      fail: 0,
      actionId: "add-host",
    });
    expect(third.completedType).toBe("HostVO");
  });

  it("ignores the action summary callback because it is not a resource task", () => {
    const summaryResult = {
      type: "HostVO",
      state: "success",
      actionId: "add-host",
    };

    expect(isActionSummaryResult(summaryResult)).toBe(true);

    const result = applyActionResultToDeploySteps(
      runningHostSteps,
      summaryResult,
    );
    const hostStep = result.steps.find((step) => step.type === "HostVO");

    expect(result.changed).toBe(false);
    expect(result.ignoredReason).toBe("action-summary");
    expect(hostStep).toMatchObject({
      state: "running",
      total: 3,
      success: 0,
      fail: 0,
    });
  });
});
