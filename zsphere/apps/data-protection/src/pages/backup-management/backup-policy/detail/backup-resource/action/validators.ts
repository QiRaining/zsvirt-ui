import { SchedulerJobState } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";

export const verifyEnableBackupJob = (current: VmInstance) => {
  return current.backupJob?.state === SchedulerJobState.Disabled;
};

export const verifyDisableBackupJob = (current: VmInstance) => {
  return current.backupJob?.state === SchedulerJobState.Enabled;
};
