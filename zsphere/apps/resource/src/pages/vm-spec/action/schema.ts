import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createVmSpecNameDescSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type VmSpecNameDescValues = z.infer<
  ReturnType<typeof createVmSpecNameDescSchema>
>;
