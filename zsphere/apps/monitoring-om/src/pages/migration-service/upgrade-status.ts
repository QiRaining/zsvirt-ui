import type { UpgradeTask } from "./types";

const UPGRADE_IN_PROGRESS_STATUSES = [
  "Upgrading",
  "UpgradePackageUploaded",
] as const;

const UPGRADE_FAILED_STATUSES = [
  "UpgradeExecuteFailed",
  "UpgradePackageUploadFailed",
] as const;

interface EffectiveUpgradeTaskOptions {
  serviceVersion?: string;
  softwarePackageStatus?: string;
  upgradeTasks: UpgradeTask[];
}

export const isUpgradeInProgressStatus = (status?: string): boolean =>
  UPGRADE_IN_PROGRESS_STATUSES.includes(status as never);

export const isUpgradeFailedStatus = (status?: string): boolean =>
  UPGRADE_FAILED_STATUSES.includes(status as never);

function compareVersion(left?: string, right?: string): number {
  if (!left || !right) return 0;

  const leftParts = left.split(".").map((part) => Number(part));
  const rightParts = right.split(".").map((part) => Number(part));
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;

    if (Number.isNaN(leftPart) || Number.isNaN(rightPart)) return 0;
    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}

const isStaleFailedTask = (
  task: UpgradeTask,
  serviceVersion?: string,
): boolean => {
  if (!task.version || !serviceVersion || serviceVersion === "-") {
    return false;
  }

  return compareVersion(task.version, serviceVersion) < 0;
};

export function getEffectiveUpgradeTask({
  serviceVersion,
  softwarePackageStatus,
  upgradeTasks,
}: EffectiveUpgradeTaskOptions): UpgradeTask | undefined {
  const runningTask = upgradeTasks.find((task) => task.status === "running");
  if (runningTask || isUpgradeInProgressStatus(softwarePackageStatus)) {
    return (
      runningTask ?? {
        uuid: "",
        version: "",
        status: "running",
      }
    );
  }

  if (!isUpgradeFailedStatus(softwarePackageStatus)) {
    return undefined;
  }

  return upgradeTasks.find(
    (task) =>
      task.status === "failed" && !isStaleFailedTask(task, serviceVersion),
  );
}
