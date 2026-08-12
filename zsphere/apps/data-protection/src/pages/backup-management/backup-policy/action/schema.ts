import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createTriggerNowSchema = () =>
  z.object({
    fullBackup: z.boolean(),
  });

export type TriggerNowFormValues = z.infer<
  ReturnType<typeof createTriggerNowSchema>
>;

export const createBackupPolicyNameDescSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type BackupPolicyNameDescFormValues = z.infer<
  ReturnType<typeof createBackupPolicyNameDescSchema>
>;
