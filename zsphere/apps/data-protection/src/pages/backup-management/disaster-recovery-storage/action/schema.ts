import {
  commonNameString,
  longDescriptionString,
  requiredString,
  type IntlLike,
} from "@zstack/form";
import { z } from "zod";

export const createDisasterRecoveryStorageNameDescSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: longDescriptionString(intl),
  });

export type DisasterRecoveryStorageNameDescFormValues = z.infer<
  ReturnType<typeof createDisasterRecoveryStorageNameDescSchema>
>;

export const createUpdateDisasterRecoveryStoragePasswordSchema = (
  intl: IntlLike,
) =>
  z
    .object({
      password: requiredString(intl),
      repeatPassword: requiredString(intl),
    })
    .refine((values) => values.password === values.repeatPassword, {
      path: ["repeatPassword"],
      message: intl.formatMessage({
        id: "vm.field.password.validator.inconsistent",
        defaultMessage: "The passwords do not match.",
      }),
    });

export type UpdateDisasterRecoveryStoragePasswordFormValues = z.infer<
  ReturnType<typeof createUpdateDisasterRecoveryStoragePasswordSchema>
>;
