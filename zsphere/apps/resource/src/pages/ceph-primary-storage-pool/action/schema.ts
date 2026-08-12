import type { IntlLike } from "@zstack/form";
import { z } from "zod";

const getRequiredMessage = (intl: IntlLike) =>
  intl.formatMessage({
    id: "global.field.validator.input.required",
    defaultMessage: "This field is required.",
  });

export const createAddCephPrimaryStoragePoolSchema = (intl: IntlLike) => {
  const requiredMessage = getRequiredMessage(intl);

  return z.object({
    poolName: z.string({ required_error: requiredMessage }).min(1, {
      message: requiredMessage,
    }),
    aliasName: z.string(),
  });
};

export const createUpdateCephPrimaryStoragePoolSchema = (intl: IntlLike) => {
  const requiredMessage = getRequiredMessage(intl);

  return z.object({
    aliasName: z.string({ required_error: requiredMessage }).min(1, {
      message: requiredMessage,
    }),
  });
};

export type AddCephPrimaryStoragePoolFormValues = z.infer<
  ReturnType<typeof createAddCephPrimaryStoragePoolSchema>
>;

export type UpdateCephPrimaryStoragePoolFormValues = z.infer<
  ReturnType<typeof createUpdateCephPrimaryStoragePoolSchema>
>;
