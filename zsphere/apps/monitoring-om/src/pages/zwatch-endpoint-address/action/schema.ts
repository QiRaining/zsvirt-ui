import type { IntlLike } from "@zstack/form";
import { isEmail, isPhoneNumber } from "@zstack/zsphere-utils";
import { z } from "zod";

const smsAddressString = (intl: IntlLike) =>
  z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: intl.formatMessage({
        id: "zwatchEndpoint.field.phoneNumber.validator.required",
        defaultMessage: "This field is required.",
      }),
    })
    .refine((value) => value.trim().length === 0 || isPhoneNumber(value), {
      message: intl.formatMessage({
        id: "zwatchEndpoint.field.phoneNumber.validator.format",
        defaultMessage: "Invalid phone number.",
      }),
    });

export const createAddSmsAddressSchema = (intl: IntlLike) =>
  z.object({
    smsAddress: smsAddressString(intl),
  });

export type AddSmsAddressFormValues = z.infer<
  ReturnType<typeof createAddSmsAddressSchema>
>;

const emailAddressString = (intl: IntlLike) =>
  z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: intl.formatMessage({
        id: "zwatch.endpoint.form.email.address.validator.required",
        defaultMessage: "This field is required.",
      }),
    })
    .refine((value) => value.trim().length === 0 || isEmail(value), {
      message: intl.formatMessage({
        id: "zwatch.endpoint.form.email.address.validator.format",
        defaultMessage: "Invalid Email address.",
      }),
    });

export const createModifyEmailAddressSchema = (intl: IntlLike) =>
  z.object({
    emailAddress: emailAddressString(intl),
  });

export type ModifyEmailAddressFormValues = z.infer<
  ReturnType<typeof createModifyEmailAddressSchema>
>;

export const createAddEmailAddressSchema = (intl: IntlLike) =>
  z.object({
    emailAddress: z
      .array(
        z.object({
          value: emailAddressString(intl),
        }),
      )
      .min(
        1,
        intl.formatMessage({
          id: "zwatch.endpoint.form.email.address.validator.required",
          defaultMessage: "This field is required.",
        }),
      ),
  });

export type AddEmailAddressFormValues = z.infer<
  ReturnType<typeof createAddEmailAddressSchema>
>;
