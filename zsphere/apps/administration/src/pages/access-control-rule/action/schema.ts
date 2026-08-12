import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createUpdateAccessControlRuleSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type UpdateAccessControlRuleFormValues = z.infer<
  ReturnType<typeof createUpdateAccessControlRuleSchema>
>;
