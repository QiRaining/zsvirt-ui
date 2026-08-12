import { z } from "zod";

const prioritySchema = z.enum(["normal", "high"]);

export const createEditBackupPrioritySchema = () =>
  z.object({
    priorities: z.record(z.string(), prioritySchema),
  });

export type EditBackupPriorityFormValues = z.infer<
  ReturnType<typeof createEditBackupPrioritySchema>
>;
