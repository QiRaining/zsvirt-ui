import {
  type IntlLike,
  ipString,
  numberRangeValue,
  requiredString,
} from "@zstack/form";
import { z } from "zod";

const requiredNumberValue = (intl: IntlLike) =>
  z
    .any()
    .refine((value) => value !== undefined && value !== null && value !== "", {
      message: intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    });

export const createAddCbdMdsSchema = (intl: IntlLike) =>
  z.object({
    mdsIp: ipString(intl),
    sshPort: requiredNumberValue(intl),
    username: requiredString(intl),
    password: requiredString(intl),
  });

export const createModifyCbdMdsSshUsernameSchema = (intl: IntlLike) =>
  z.object({
    sshUsername: requiredString(intl),
  });

export const createModifyCbdMdsSshPortSchema = (intl: IntlLike) =>
  z.object({
    sshPort: numberRangeValue(intl, 0, 65535),
  });

export const createModifyCbdMdsSshPasswordSchema = (intl: IntlLike) =>
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

export const createModifyCbdMdsSshInfoSchema = (intl: IntlLike) =>
  z.object({
    port: requiredNumberValue(intl),
    username: requiredString(intl),
    password: requiredString(intl),
  });

export type AddCbdMdsFormValues = z.infer<
  ReturnType<typeof createAddCbdMdsSchema>
>;

export type ModifyCbdMdsSshUsernameFormValues = z.infer<
  ReturnType<typeof createModifyCbdMdsSshUsernameSchema>
>;

export type ModifyCbdMdsSshPortFormValues = z.infer<
  ReturnType<typeof createModifyCbdMdsSshPortSchema>
>;

export type ModifyCbdMdsSshPasswordFormValues = z.infer<
  ReturnType<typeof createModifyCbdMdsSshPasswordSchema>
>;

export type ModifyCbdMdsSshInfoFormValues = z.infer<
  ReturnType<typeof createModifyCbdMdsSshInfoSchema>
>;
