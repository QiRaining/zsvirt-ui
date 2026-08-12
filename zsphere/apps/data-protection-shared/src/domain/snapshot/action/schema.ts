import {
  commonNameString,
  lengthRangeString,
  longDescriptionString,
  requiredString,
  type IntlLike,
  validNameString,
} from "@zstack/form";
import { z } from "zod";

export const createSnapshotCreateSchema = (intl: IntlLike) =>
  z.object({
    name: requiredString(intl)
      .and(lengthRangeString(intl, 1, 64))
      .and(validNameString(intl)),
    description: longDescriptionString(intl),
    withMemory: z.boolean(),
  });

export type SnapshotCreateFormValues = z.infer<
  ReturnType<typeof createSnapshotCreateSchema>
>;

export const createSnapshotUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: longDescriptionString(intl),
  });

export type SnapshotUpdateFormValues = z.infer<
  ReturnType<typeof createSnapshotUpdateSchema>
>;
