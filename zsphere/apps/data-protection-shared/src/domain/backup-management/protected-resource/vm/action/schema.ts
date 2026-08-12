import { z } from "zod";

export const createRevertBackupDataSchema = () =>
  z.object({
    recoveryStart: z.boolean().optional(),
  });

export type RevertBackupDataFormValues = z.infer<
  ReturnType<typeof createRevertBackupDataSchema>
>;
