import { z } from "zod";

export const executionLogDurationValues = ["3", "7", "30", "-1"] as const;

export const createSnapshotStrategyExecutionLogToolbarSchema = () =>
  z.object({
    duration: z.enum(executionLogDurationValues),
  });

export type SnapshotStrategyExecutionLogToolbarValues = z.infer<
  ReturnType<typeof createSnapshotStrategyExecutionLogToolbarSchema>
>;
