import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { isUint } from "@zstack/zsphere-utils";
import { z } from "zod";

const createSmtpServerString = (intl: IntlLike) =>
  z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "emailServer.field.smtpserver.validator.required",
          defaultMessage: "This field is required.",
        }),
      });
      return;
    }

    if (!value.includes(".")) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "emailServer.field.smtpserver.validator.format",
          defaultMessage: "Invalid SMTP server.",
        }),
      });
    }
  });

const createSmtpPortString = (intl: IntlLike) =>
  z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "emailServer.field.smtp.port.validator.required",
          defaultMessage: "This field is required.",
        }),
      });
      return;
    }

    if (!isUint(value)) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "emailServer.field.smtp.port.validator.format",
          defaultMessage: "Invalid SMTP port.",
        }),
      });
    }
  });

export const createAddEmailServerSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
    username: z.string(),
    password: z.string(),
    smtpServer: createSmtpServerString(intl),
    encryptType: z.enum(["STARTTLS", "SSL", "NONE"]),
    smtpPort: createSmtpPortString(intl),
  });

export const createUpdateEmailServerSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type AddEmailServerFormValues = z.infer<
  ReturnType<typeof createAddEmailServerSchema>
>;

export type UpdateEmailServerFormValues = z.infer<
  ReturnType<typeof createUpdateEmailServerSchema>
>;
