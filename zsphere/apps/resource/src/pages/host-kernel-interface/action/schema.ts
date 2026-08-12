import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createHostKernelInterfaceUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type HostKernelInterfaceUpdateValues = z.infer<
  ReturnType<typeof createHostKernelInterfaceUpdateSchema>
>;
