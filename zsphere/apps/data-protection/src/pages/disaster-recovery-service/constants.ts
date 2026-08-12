import type { DisasterRecoveryServiceStatus } from "./types";

export const DISASTER_RECOVERY_SERVICE_STATUS_ORDER: Record<
  DisasterRecoveryServiceStatus,
  DisasterRecoveryServiceStatus
> = {
  "not-installed": "package-missing",
  "package-missing": "uploading",
  uploading: "package-uploaded",
  "package-uploaded": "installing",
  installing: "initialization-required",
  "initialization-required": "initializing",
  initializing: "running",
  running: "running",
  abnormal: "abnormal",
  "upgrade-in-progress": "upgrade-in-progress",
  clearing: "not-installed",
  "clear-blocked": "clear-blocked",
};

export const DISASTER_RECOVERY_SERVICE_PROGRESS: Record<
  DisasterRecoveryServiceStatus,
  number
> = {
  "not-installed": 0,
  "package-missing": 12,
  uploading: 32,
  "package-uploaded": 45,
  installing: 62,
  "initialization-required": 76,
  initializing: 88,
  running: 100,
  abnormal: 64,
  "upgrade-in-progress": 72,
  clearing: 40,
  "clear-blocked": 100,
};
