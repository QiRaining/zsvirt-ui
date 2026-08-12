import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createBaremetalPxeServerUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type BaremetalPxeServerUpdateFormValues = z.infer<
  ReturnType<typeof createBaremetalPxeServerUpdateSchema>
>;
