import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createPreConfigTemplateUpdateSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type PreConfigTemplateUpdateFormValues = z.infer<
  ReturnType<typeof createPreConfigTemplateUpdateSchema>
>;
