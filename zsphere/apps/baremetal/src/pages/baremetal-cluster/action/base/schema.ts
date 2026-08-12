import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createBaremetalClusterUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type BaremetalClusterUpdateFormValues = z.infer<
  ReturnType<typeof createBaremetalClusterUpdateSchema>
>;
