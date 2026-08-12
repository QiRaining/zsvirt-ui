import {
  type IntlLike,
  ipString,
  numberRangeValue,
  requiredString,
} from "@zstack/form";
import { z } from "zod";

export const createModifyCephMonSshUsernameSchema = (intl: IntlLike) =>
  z.object({
    sshUsername: requiredString(intl),
  });

const requiredNumberValue = (intl: IntlLike) =>
  z
    .any()
    .refine((value) => value !== undefined && value !== null && value !== "", {
      message: intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    });

export const createAddCephMonSchema = (intl: IntlLike) =>
  z.object({
    monIp: ipString(intl),
    sshPort: requiredNumberValue(intl),
    userName: requiredString(intl),
    passWord: requiredString(intl),
  });

export const createModifyCephMonSshPortSchema = (intl: IntlLike) =>
  z.object({
    sshPort: numberRangeValue(intl, 0, 65535),
  });

export const createModifyCephMonPortSchema = (intl: IntlLike) =>
  z.object({
    monPort: numberRangeValue(intl, 0, 65535),
  });

export const createModifyCephMonSshPasswordSchema = (intl: IntlLike) =>
  z
    .object({
      password: requiredString(intl),
      confirmPassword: requiredString(intl),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ["confirmPassword"],
      message: intl.formatMessage({
        id: "user.field.confirmPassword.validator.format",
        defaultMessage: "Passwords do not match. Enter passwords again.",
      }),
    });

export type ModifyCephMonSshUsernameFormValues = z.infer<
  ReturnType<typeof createModifyCephMonSshUsernameSchema>
>;

export type AddCephMonFormValues = z.infer<
  ReturnType<typeof createAddCephMonSchema>
>;

export type ModifyCephMonSshPortFormValues = z.infer<
  ReturnType<typeof createModifyCephMonSshPortSchema>
>;

export type ModifyCephMonPortFormValues = z.infer<
  ReturnType<typeof createModifyCephMonPortSchema>
>;

export type ModifyCephMonSshPasswordFormValues = z.infer<
  ReturnType<typeof createModifyCephMonSshPasswordSchema>
>;
