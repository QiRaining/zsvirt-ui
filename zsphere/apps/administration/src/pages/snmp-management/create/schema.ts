import { lengthRangeString, requiredString, type IntlLike } from "@zstack/form";
import { z } from "zod";

import { createSnmpTrapItemSchema } from "../../snmp-trap/create/schema";
import {
  AuthAlgorithmEnum,
  PrivacyAlgorithmEnum,
  VersionType,
} from "./basic-config";

const PASSWORD_REGEXP = /^[a-zA-Z0-9~`@#%&<>"',;_^$.*+?=!:|{}()[\]/\\-]+$/;

const commonSnmpInputString = (
  intl: IntlLike,
  resourceName: string,
  min: number,
  max: number,
) =>
  requiredString(intl)
    .and(lengthRangeString(intl, min, max))
    .and(
      z.string().regex(PASSWORD_REGEXP, {
        message: intl.formatMessage(
          {
            id: "rules.invalid",
            defaultMessage: "Invalid {resource}.",
          },
          { resource: resourceName },
        ),
      }),
    );

const optionalString = z.string().optional();

const snmpAgentPortValue = (intl: IntlLike) =>
  z
    .any()
    .refine((value) => value !== undefined && value !== null && value !== "", {
      message: intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    })
    .transform((value) => Number(value))
    .refine((value) => !Number.isNaN(value) && Number.isInteger(value), {
      message: intl.formatMessage({
        id: "global.field.validator.numberRange.isInteger",
        defaultMessage: "Please enter an integer.",
      }),
    })
    .refine((value) => value >= 1024 && value <= 65565, {
      message: intl.formatMessage(
        {
          id: "global.field.validator.numberRange",
          defaultMessage: "Allowed range: {min}–{max}.",
        },
        { min: 1024, max: 65565 },
      ),
    });

export const createSnmpManagementSchema = (intl: IntlLike) =>
  z
    .object({
      port: snmpAgentPortValue(intl),
      version: z.nativeEnum(VersionType),
      readCommunity: optionalString,
      userName: optionalString,
      authAlgorithmSwitch: z.boolean().optional(),
      authAlgorithm: z.nativeEnum(AuthAlgorithmEnum).optional(),
      authPassword: optionalString,
      confirmAuthPassword: optionalString,
      privacyAlgorithmSwitch: z.boolean().optional(),
      privacyAlgorithm: z.nativeEnum(PrivacyAlgorithmEnum).optional(),
      privacyPassword: optionalString,
      confirmPrivacyPassword: optionalString,
      trapList: z.array(createSnmpTrapItemSchema(intl)).optional(),
    })
    .superRefine((values, ctx) => {
      if (values.version === VersionType.v2c) {
        const readCommunityResult = commonSnmpInputString(
          intl,
          intl.formatMessage({
            id: "snmp.agent.readCommunity",
            defaultMessage: "Community String",
          }),
          1,
          32,
        ).safeParse(values.readCommunity ?? "");

        if (!readCommunityResult.success) {
          readCommunityResult.error.issues.forEach((issue) => {
            ctx.addIssue({ ...issue, path: ["readCommunity"] });
          });
        }
        return;
      }

      const userNameResult = requiredString(intl).safeParse(
        values.userName ?? "",
      );

      if (!userNameResult.success) {
        userNameResult.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ["userName"] });
        });
      }

      if (values.authAlgorithmSwitch) {
        const authPasswordResult = commonSnmpInputString(
          intl,
          intl.formatMessage({
            id: "authentication.password",
            defaultMessage: "Password",
          }),
          8,
          32,
        ).safeParse(values.authPassword ?? "");

        if (!authPasswordResult.success) {
          authPasswordResult.error.issues.forEach((issue) => {
            ctx.addIssue({ ...issue, path: ["authPassword"] });
          });
        }

        if (!values.confirmAuthPassword) {
          ctx.addIssue({
            code: "custom",
            path: ["confirmAuthPassword"],
            message: intl.formatMessage({
              id: "snmp.field.confirmPassword.validator.required",
              defaultMessage: "Confirm the password.",
            }),
          });
        } else if (values.authPassword !== values.confirmAuthPassword) {
          ctx.addIssue({
            code: "custom",
            path: ["confirmAuthPassword"],
            message: intl.formatMessage({
              id: "snmp.field.confirmPassword.validator.equals",
              defaultMessage: "Passwords do not match.",
            }),
          });
        }
      }

      if (values.privacyAlgorithmSwitch) {
        const privacyPasswordResult = commonSnmpInputString(
          intl,
          intl.formatMessage({
            id: "encryption.password",
            defaultMessage: "Password",
          }),
          8,
          32,
        ).safeParse(values.privacyPassword ?? "");

        if (!privacyPasswordResult.success) {
          privacyPasswordResult.error.issues.forEach((issue) => {
            ctx.addIssue({ ...issue, path: ["privacyPassword"] });
          });
        }

        if (!values.confirmPrivacyPassword) {
          ctx.addIssue({
            code: "custom",
            path: ["confirmPrivacyPassword"],
            message: intl.formatMessage({
              id: "snmp.field.confirmPassword.validator.required",
              defaultMessage: "Confirm the password.",
            }),
          });
        } else if (values.privacyPassword !== values.confirmPrivacyPassword) {
          ctx.addIssue({
            code: "custom",
            path: ["confirmPrivacyPassword"],
            message: intl.formatMessage({
              id: "snmp.field.confirmPassword.validator.equals",
              defaultMessage: "Passwords do not match.",
            }),
          });
        }
      }
    });

export type CreateSnmpManagementFormValues = z.infer<
  ReturnType<typeof createSnmpManagementSchema>
>;
