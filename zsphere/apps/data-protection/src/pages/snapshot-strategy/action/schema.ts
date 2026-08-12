import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createSnapshotStrategyNameDescSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type SnapshotStrategyNameDescFormValues = z.infer<
  ReturnType<typeof createSnapshotStrategyNameDescSchema>
>;
