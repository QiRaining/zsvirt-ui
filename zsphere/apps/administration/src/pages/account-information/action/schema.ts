import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createUpdateAccountSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type UpdateAccountFormValues = z.infer<
  ReturnType<typeof createUpdateAccountSchema>
>;
