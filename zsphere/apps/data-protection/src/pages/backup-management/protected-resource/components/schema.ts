import { requiredString, type IntlLike } from "@zstack/form";
import { z } from "zod";

export const createRecoverDbConfirmSchema = (intl: IntlLike) =>
  z.object({
    password: requiredString(intl),
  });

export type RecoverDbConfirmFormValues = z.infer<
  ReturnType<typeof createRecoverDbConfirmSchema>
>;
