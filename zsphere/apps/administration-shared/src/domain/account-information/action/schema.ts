import type { IntlLike } from "@zstack/form";
import { z } from "zod";

type PasswordValidator = (rule: unknown, value: string) => Promise<void>;

const requiredPassword = (
  intl: IntlLike,
  message?: { id: string; defaultMessage: string },
) =>
  z.string().refine((value) => value.trim().length > 0, {
    message: intl.formatMessage(
      message ?? {
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      },
    ),
  });

const getValidationMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const createModifyAccountPasswordSchema = (
  intl: IntlLike,
  validatePassword?: PasswordValidator,
) =>
  z
    .object({
      password: requiredPassword(intl),
      confirm: requiredPassword(intl),
    })
    .superRefine(async (values, ctx) => {
      if (values.password.trim().length > 0 && validatePassword) {
        try {
          await validatePassword(undefined, values.password);
        } catch (error) {
          ctx.addIssue({
            code: "custom",
            path: ["password"],
            message: getValidationMessage(error),
          });
        }
      }

      if (
        values.confirm.trim().length > 0 &&
        values.password !== values.confirm
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["confirm"],
          message: intl.formatMessage({
            id: "subAccountManagement.field.confirmPassword.validator.format",
            defaultMessage: "Passwords do not match. Enter passwords again.",
          }),
        });
      }
    });

export type ModifyAccountPasswordFormValues = z.infer<
  ReturnType<typeof createModifyAccountPasswordSchema>
>;
