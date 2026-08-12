import dayjs from "dayjs";
import { produce } from "immer";

import type { IDeploySteps, IStepType } from "./types";

export interface IAutoInitActionResult {
  type?: string | null;
  state?: string | null;
  inventory?: string | null;
  actionId?: string | null;
  error?: string | null;
  id?: string | null;
  listenerType?: string | null;
}

export interface IApplyActionResult {
  steps: IDeploySteps;
  changed: boolean;
  completedType?: IStepType;
  ignoredReason?: "action-summary" | "missing-type" | "step-not-running";
}

export const isActionSummaryResult = (result: IAutoInitActionResult) => {
  return !result.id && !result.inventory && !result.error;
};

export const safeParseInventory = (inventory?: string | null) => {
  if (!inventory) return;

  try {
    return JSON.parse(inventory);
  } catch {
    return;
  }
};

export const applyActionResultToDeploySteps = (
  steps: IDeploySteps,
  result: IAutoInitActionResult,
): IApplyActionResult => {
  const { type, state, inventory, actionId } = result;

  if (!type) {
    return {
      steps,
      changed: false,
      ignoredReason: "missing-type",
    };
  }

  if (state !== "running" && isActionSummaryResult(result)) {
    return {
      steps,
      changed: false,
      ignoredReason: "action-summary",
    };
  }

  let changed = false;
  let completedType: IStepType | undefined;
  let ignoredReason: IApplyActionResult["ignoredReason"];

  const nextSteps = produce(steps, (draft) => {
    const step = draft.find((item) => item.type === type);

    if (!step) return;

    step.actionId = actionId || step.actionId;
    changed = true;

    if (state === "running") return;

    if (step.state !== "running") {
      ignoredReason = "step-not-running";
      changed = false;
      return;
    }

    if (state === "success") {
      step.success += 1;
      const parsedInventory = safeParseInventory(inventory);
      if (parsedInventory) {
        step.inventory = parsedInventory;
      }
    } else {
      step.fail += 1;
    }

    if (step.success + step.fail >= step.total) {
      step.state = "finish";
      const startTime = dayjs(step.startTime);
      const endTime = dayjs();
      step.endTime = endTime.toString();
      step.duration = endTime.diff(startTime);
      completedType = step.type;
    }
  });

  return {
    steps: changed ? nextSteps : steps,
    changed,
    completedType,
    ignoredReason,
  };
};

export const failDeployStep = (
  steps: IDeploySteps,
  type: IStepType,
): IDeploySteps => {
  return produce(steps, (draft) => {
    const step = draft.find((item) => item.type === type);

    if (!step || step.state === "finish") return;

    step.fail = step.total;
    step.state = "finish";
    const startTime = dayjs(step.startTime);
    const endTime = dayjs();
    step.endTime = endTime.toString();
    step.duration = endTime.diff(startTime);
  });
};
