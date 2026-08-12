import {
  commonNameString,
  commonDescriptionString,
  lengthRangeString,
  requiredString,
  type IntlLike,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { z } from "zod";

const requiredValue = (intl: IntlLike) =>
  z
    .union([z.string(), z.number()])
    .refine((value) => value !== "" && value !== undefined && value !== null, {
      message: intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    });

const passwordLengthString = (intl: IntlLike) =>
  requiredString(intl).and(lengthRangeString(intl, 1, 255));

export const createBackupKmsProviderSchema = (intl: IntlLike) =>
  z
    .object({
      backupMethod: z.enum(["direct", "password"]),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.backupMethod !== "password") {
        return;
      }

      const passwordResult = passwordLengthString(intl).safeParse(
        value.password,
      );
      if (!passwordResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: passwordResult.error.issues[0]?.message ?? "",
        });
      }

      const confirmPasswordResult = passwordLengthString(intl).safeParse(
        value.confirmPassword,
      );
      if (!confirmPasswordResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: confirmPasswordResult.error.issues[0]?.message ?? "",
        });
      }

      if (
        passwordResult.success &&
        confirmPasswordResult.success &&
        value.password !== value.confirmPassword
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: intl.formatMessage({
            id: "confirm.password.mismatch",
            defaultMessage: "The passwords do not match.",
          }),
        });
      }
    });

export const createCreateKmsProviderSchema = (intl: IntlLike) =>
  z
    .object({
      name: commonNameString(intl).and(
        uniqueResourceName(
          intl,
          ResourceQueryType.KeyProvider,
          undefined,
          intl.formatMessage({
            id: "kms.validator.unique.name",
            defaultMessage: "A key provider with the same name already exists.",
          }),
          true,
        ),
      ),
      description: commonDescriptionString(intl),
      type: z.enum(["NKP", "KMS"]),
      endpoint: z.string(),
      port: z.union([z.number(), z.string()]),
      passwordProtected: z.boolean(),
      username: z.string().transform((value) => value.trim()),
      password: z.string().transform((value) => value.trim()),
    })
    .superRefine((value, ctx) => {
      if (value.type !== "KMS") {
        return;
      }

      const endpointResult = requiredString(intl).safeParse(value.endpoint);
      if (!endpointResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["endpoint"],
          message: endpointResult.error.issues[0]?.message ?? "",
        });
      }

      const portResult = requiredValue(intl).safeParse(value.port);
      if (!portResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["port"],
          message: portResult.error.issues[0]?.message ?? "",
        });
      }

      if (!value.passwordProtected) {
        return;
      }

      const usernameResult = passwordLengthString(intl).safeParse(
        value.username,
      );
      if (!usernameResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: usernameResult.error.issues[0]?.message ?? "",
        });
      }

      const passwordResult = passwordLengthString(intl).safeParse(
        value.password,
      );
      if (!passwordResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: passwordResult.error.issues[0]?.message ?? "",
        });
      }
    });

export const createUpdateKmsProviderSchema = (intl: IntlLike, type?: string) =>
  z
    .object({
      description: commonDescriptionString(intl),
      endpoint: z.string().optional(),
      port: z.union([z.number(), z.string()]).optional(),
      passwordProtected: z.boolean(),
      username: z.string().optional(),
      password: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (type !== "KMS") {
        return;
      }

      const endpointResult = requiredString(intl).safeParse(
        value.endpoint ?? "",
      );
      if (!endpointResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["endpoint"],
          message: endpointResult.error.issues[0]?.message ?? "",
        });
      }

      const portResult = requiredValue(intl).safeParse(value.port ?? "");
      if (!portResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["port"],
          message: portResult.error.issues[0]?.message ?? "",
        });
      }

      if (value.passwordProtected) {
        const usernameResult = requiredString(intl)
          .and(lengthRangeString(intl, 1, 255))
          .safeParse(value.username?.trim() ?? "");
        if (!usernameResult.success) {
          ctx.addIssue({
            code: "custom",
            path: ["username"],
            message: usernameResult.error.issues[0]?.message ?? "",
          });
        }

        if (value.password) {
          const passwordResult = lengthRangeString(intl, 1, 255).safeParse(
            value.password.trim(),
          );
          if (!passwordResult.success) {
            ctx.addIssue({
              code: "custom",
              path: ["password"],
              message: passwordResult.error.issues[0]?.message ?? "",
            });
          }
        }
      }
    });

export type BackupKmsProviderValues = z.infer<
  ReturnType<typeof createBackupKmsProviderSchema>
>;

export type CreateKmsProviderValues = z.infer<
  ReturnType<typeof createCreateKmsProviderSchema>
>;

export type UpdateKmsProviderValues = z.infer<
  ReturnType<typeof createUpdateKmsProviderSchema>
>;
