import {
  DISASTER_RECOVERY_SERVICE_PROGRESS,
  DISASTER_RECOVERY_SERVICE_STATUS_ORDER,
} from "./constants";
import type {
  DisasterRecoveryServicePrimaryAction,
  DisasterRecoveryServiceStatus,
  SetupStepType,
} from "./types";

const BUSY_STATUSES = new Set<DisasterRecoveryServiceStatus>([
  "uploading",
  "installing",
  "initializing",
  "upgrade-in-progress",
  "clearing",
]);

const SETUP_PENDING_STATUSES = new Set<DisasterRecoveryServiceStatus>([
  "not-installed",
  "package-missing",
  "uploading",
  "package-uploaded",
  "installing",
  "initialization-required",
  "initializing",
]);

const SETUP_STEP_RANK: Record<DisasterRecoveryServiceStatus, number> = {
  "not-installed": 1,
  "package-missing": 1,
  uploading: 1,
  "package-uploaded": 2,
  installing: 2,
  "initialization-required": 3,
  initializing: 3,
  running: 4,
  abnormal: 2,
  "upgrade-in-progress": 4,
  clearing: 1,
  "clear-blocked": 4,
};

export function getNextMockStatus(
  status: DisasterRecoveryServiceStatus,
): DisasterRecoveryServiceStatus {
  return DISASTER_RECOVERY_SERVICE_STATUS_ORDER[status];
}

export function getPrimaryAction(
  status: DisasterRecoveryServiceStatus,
): DisasterRecoveryServicePrimaryAction {
  switch (status) {
    case "not-installed":
    case "package-missing":
      return { key: "upload-package", disabled: false };
    case "package-uploaded":
      return { key: "install-service", disabled: false };
    case "uploading":
    case "installing":
    case "initializing":
    case "upgrade-in-progress":
    case "clearing":
      return { key: "view-task", disabled: true };
    case "initialization-required":
      return { key: "initialize-site", disabled: false };
    case "running":
      return { key: "open-zlr", disabled: false };
    case "clear-blocked":
      return { key: "view-blockers", disabled: false };
    case "abnormal":
      return { key: "retry", disabled: false };
  }
}

export function isServiceBusy(status: DisasterRecoveryServiceStatus): boolean {
  return BUSY_STATUSES.has(status);
}

export function getServiceProgress(
  status: DisasterRecoveryServiceStatus,
): number {
  return DISASTER_RECOVERY_SERVICE_PROGRESS[status];
}

export type SetupStepState = "done" | "active" | "pending";

export function getSetupStepState(
  status: DisasterRecoveryServiceStatus,
  step: 1 | 2 | 3,
): SetupStepState {
  const rank = SETUP_STEP_RANK[status];
  if (rank > step) {
    return "done";
  }
  if (rank === step) {
    return "active";
  }
  return "pending";
}

export function getCurrentSetupStep(
  status: DisasterRecoveryServiceStatus,
): SetupStepType {
  switch (status) {
    case "package-uploaded":
    case "installing":
    case "abnormal":
      return "install";
    case "initialization-required":
    case "initializing":
      return "initialize";
    case "not-installed":
    case "package-missing":
    case "uploading":
    case "running":
    case "upgrade-in-progress":
    case "clearing":
    case "clear-blocked":
      return "upload";
  }
}

export function getSetupStepIndex(step: SetupStepType): 1 | 2 | 3 {
  switch (step) {
    case "upload":
      return 1;
    case "install":
      return 2;
    case "initialize":
      return 3;
  }
}

export function shouldShowSetupWizard(
  status: DisasterRecoveryServiceStatus,
): boolean {
  return SETUP_PENDING_STATUSES.has(status);
}
