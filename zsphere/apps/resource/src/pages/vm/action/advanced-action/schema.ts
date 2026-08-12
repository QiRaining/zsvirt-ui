import { type IntlLike, requiredString } from "@zstack/form";
import { z } from "zod";

export const createSetSshKeySchema = (intl: IntlLike) =>
  z.object({
    sshkey: requiredString(intl, {
      id: "vm.field.sshkey.validator.required",
      defaultMessage: "Enter a SSH Key.",
    }),
  });

export type SetSshKeyFormValues = z.infer<
  ReturnType<typeof createSetSshKeySchema>
>;

export const createEditGuesttoolsConfigSchema = () =>
  z.object({
    crashStrategy: z.string(),
    timeSync: z.boolean(),
  });

export type EditGuesttoolsConfigFormValues = z.infer<
  ReturnType<typeof createEditGuesttoolsConfigSchema>
>;

type PasswordValidator = (value: string) => Promise<void>;

const getValidationMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const accountNameMethods = ["system", "custom"] as const;

export const createChangeVmPasswordSchema = (
  intl: IntlLike,
  validateCommonPassword?: PasswordValidator,
  validateGlobalPassword?: PasswordValidator,
) =>
  z
    .object({
      accountNameMethods: z.enum(accountNameMethods),
      account: z.string().refine((value) => value.trim().length > 0, {
        message: intl.formatMessage({
          id: "vm.field.usename.validator.required",
          defaultMessage: "Enter a username.",
        }),
      }),
      password: z
        .string()
        .refine((value) => value.length > 0, {
          message: intl.formatMessage({
            id: "vm.field.password.validator.required",
            defaultMessage: "Enter a password.",
          }),
        })
        .refine((value) => value.length <= 32, {
          message: intl.formatMessage({
            id: "vm.field.password.validator.lengthRange",
            defaultMessage: "The password must not be larger than 32 characters.",
          }),
        }),
      confirmPassword: z.string().refine((value) => value.length > 0, {
        message: intl.formatMessage({
          id: "vm.field.confirmPassword.validator.required",
          defaultMessage: "Enter the confirmation password.",
        }),
      }),
    })
    .superRefine(async (values, ctx) => {
      if (values.password.length > 0 && values.password.length <= 32) {
        if (validateCommonPassword) {
          try {
            await validateCommonPassword(values.password);
          } catch (error) {
            ctx.addIssue({
              code: "custom",
              path: ["password"],
              message: getValidationMessage(error),
            });
          }
        }

        if (validateGlobalPassword) {
          try {
            await validateGlobalPassword(values.password);
          } catch (error) {
            ctx.addIssue({
              code: "custom",
              path: ["password"],
              message: getValidationMessage(error),
            });
          }
        }
      }

      if (
        values.confirmPassword.length > 0 &&
        values.password !== values.confirmPassword
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: intl.formatMessage({
            id: "vm.field.confirmPassword.validator.equals",
            defaultMessage: "Passwords do not match.",
          }),
        });
      }
    });

export type ChangeVmPasswordFormValues = z.infer<
  ReturnType<typeof createChangeVmPasswordSchema>
>;
