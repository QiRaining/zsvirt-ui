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

export const createChangePasswordSchema = (
  intl: IntlLike,
  validatePassword: PasswordValidator,
) =>
  z
    .object({
      oldPassword: requiredPassword(intl),
      newPassword: requiredPassword(intl, {
        id: "user.action.set.password.required",
        defaultMessage: "This field is required.",
      }),
      repeatPassword: requiredPassword(intl),
    })
    .superRefine(async (values, ctx) => {
      if (values.newPassword.trim().length > 0) {
        try {
          await validatePassword(undefined, values.newPassword);
        } catch (error) {
          ctx.addIssue({
            code: "custom",
            path: ["newPassword"],
            message: getValidationMessage(error),
          });
        }
      }

      if (
        values.repeatPassword.trim().length > 0 &&
        values.newPassword !== values.repeatPassword
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["repeatPassword"],
          message: intl.formatMessage({
            id: "user.action.set.password.validator.format.not.same",
            defaultMessage: "The passwords do not match.",
          }),
        });
      }
    });

export type ChangePasswordFormValues = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;
