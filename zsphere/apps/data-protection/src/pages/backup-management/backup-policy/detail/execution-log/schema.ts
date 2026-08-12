import { z } from "zod";

export const executionLogDurationValues = ["3", "7", "30", "-1"] as const;

export const createBackupPolicyExecutionLogToolbarSchema = () =>
  z.object({
    duration: z.enum(executionLogDurationValues),
  });

export type BackupPolicyExecutionLogToolbarValues = z.infer<
  ReturnType<typeof createBackupPolicyExecutionLogToolbarSchema>
>;
