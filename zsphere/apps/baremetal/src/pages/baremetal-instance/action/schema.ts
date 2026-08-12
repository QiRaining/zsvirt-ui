import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createBaremetalInstanceUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type BaremetalInstanceUpdateFormValues = z.infer<
  ReturnType<typeof createBaremetalInstanceUpdateSchema>
>;
