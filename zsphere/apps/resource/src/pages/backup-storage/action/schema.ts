import {
  commonNameString,
  lengthRangeString,
  longDescriptionString,
  type IntlLike,
  requiredString,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { isIP, isPort } from "@zstack/zsphere-utils";
import { z } from "zod";

const ONE_B = 1;
const ONE_KB = 1024;
const ONE_MB = 1024 * 1024;
const ONE_GB = 1024 * 1024 * 1024;
const ONE_TB = 1024 * 1024 * 1024 * 1024;

const unitMultiplier: Record<string, number> = {
  B: ONE_B,
  K: ONE_KB,
  KB: ONE_KB,
  M: ONE_MB,
  MB: ONE_MB,
  G: ONE_GB,
  GB: ONE_GB,
  T: ONE_TB,
  TB: ONE_TB,
};

const inputUnitValueSchema = z.object({
  number: z.union([z.string(), z.number(), z.undefined()]),
  unit: z.string().optional(),
});

interface StorageNode {
  hostname?: string | null;
}

const toBytes = (value: z.infer<typeof inputUnitValueSchema>) => {
  const number = Number(value.number);

  if (!Number.isFinite(number)) {
    return Number.NaN;
  }

  return number * (unitMultiplier[value.unit ?? ""] ?? 1);
};

const isBlankValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

export const createBackupStorageUpdateSchema = (
  intl: IntlLike,
  originName?: string,
) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.BackupStorage,
        originName,
        intl.formatMessage({
          id: "backupStorage.field.name.validator.duplicate",
          defaultMessage: "This name is already in use. Enter a different name.",
        }),
        true,
      ),
    ),
    description: longDescriptionString(intl),
  });

export const createUpdateBackupStoragePasswordSchema = (intl: IntlLike) =>
  z
    .object({
      password: requiredString(intl).and(lengthRangeString(intl, 8, 32)),
      confirmPassword: requiredString(intl).and(lengthRangeString(intl, 8, 32)),
    })
    .refine((value) => value.password === value.confirmPassword, {
      path: ["confirmPassword"],
      message: intl.formatMessage({
        id: "globalConfig.form.confirm.password.validator.format",
        defaultMessage: "Passwords do not match. Enter passwords again.",
      }),
    });

export const createBackupStorageAdvancedSettingSchema = (
  intl: IntlLike,
  maxSettingCapacity: number,
) =>
  z.object({
    reservedCapacity: inputUnitValueSchema.superRefine((value, ctx) => {
      if (isBlankValue(value.number)) {
        ctx.addIssue({
          code: "custom",
          message: intl.formatMessage({
            id: "globalConfig.edit.validator.cannot.be.empty",
            defaultMessage: "Specify a number.",
          }),
        });
        return;
      }

      const bytes = toBytes(value);
      if (
        !Number.isInteger(bytes) ||
        bytes < ONE_B ||
        bytes > ONE_TB ||
        bytes > maxSettingCapacity
      ) {
        ctx.addIssue({
          code: "custom",
          message: intl.formatMessage({
            id: "reserved.capacity.validate.range.and.max.setting.capacity",
            defaultMessage:
              "Enter an integer that ranges from 1B to 1TB and does not exceed the total size of image storage.",
          }),
        });
      }
    }),
    blobUploadConcurrency: z
      .union([z.string(), z.number()])
      .refine((value) => !isBlankValue(value), {
        message: intl.formatMessage({
          id: "globalConfig.edit.validator.cannot.be.empty",
          defaultMessage: "Specify a number.",
        }),
      })
      .refine(
        (value) => {
          const number = Number(value);
          return Number.isInteger(number) && number >= 1 && number <= 16;
        },
        {
          message: intl.formatMessage({
            id: "backupStorage.blobDownloadUploadConcurrency.validate.range",
            defaultMessage: "Input should be an integer number within the range of [1, 16].",
          }),
        },
      ),
    blobDownloadConcurrency: z
      .union([z.string(), z.number()])
      .refine((value) => !isBlankValue(value), {
        message: intl.formatMessage({
          id: "globalConfig.edit.validator.cannot.be.empty",
          defaultMessage: "Specify a number.",
        }),
      })
      .refine(
        (value) => {
          const number = Number(value);
          return Number.isInteger(number) && number >= 1 && number <= 16;
        },
        {
          message: intl.formatMessage({
            id: "backupStorage.blobDownloadUploadConcurrency.validate.range",
            defaultMessage: "Input should be an integer number within the range of [1, 16].",
          }),
        },
      ),
  });

const backupStorageMonNodeIpString = (
  intl: IntlLike,
  mons?: StorageNode[],
  current?: StorageNode,
) =>
  requiredString(intl).superRefine((value, ctx) => {
    const isCurrentNode = current?.hostname === value;

    if (!isCurrentNode && mons?.some((mon) => mon.hostname === value)) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "monitoringNode.field.ip.exist.validator.format",
          defaultMessage: "The monitoring node IP already exists.",
        }),
      });
      return;
    }

    if (!isIP(value)) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "monitoringNode.field.ip.validator.format",
          defaultMessage: "Invalid IP address.",
        }),
      });
    }
  });

const sshPortValue = (intl: IntlLike) =>
  z.union([z.string(), z.number()]).superRefine((value, ctx) => {
    if (value === "") {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        }),
      });
      return;
    }

    if (!isPort(String(value))) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "backupStorage.field.sshPort.validator.format",
          defaultMessage: "Invalid SSH port",
        }),
      });
    }
  });

export const createBackupStorageSetMonNodeSchema = (
  intl: IntlLike,
  options?: {
    mons?: StorageNode[];
    current?: StorageNode;
    requirePassword?: boolean;
  },
) =>
  z.object({
    hostname: backupStorageMonNodeIpString(
      intl,
      options?.mons,
      options?.current,
    ),
    sshPort: sshPortValue(intl),
    sshUsername: requiredString(intl),
    sshPassword:
      options?.requirePassword === false ? z.string() : requiredString(intl),
  });

export type BackupStorageUpdateValues = z.infer<
  ReturnType<typeof createBackupStorageUpdateSchema>
>;

export type UpdateBackupStoragePasswordValues = z.infer<
  ReturnType<typeof createUpdateBackupStoragePasswordSchema>
>;

export type BackupStorageAdvancedSettingValues = z.infer<
  ReturnType<typeof createBackupStorageAdvancedSettingSchema>
>;

export type BackupStorageSetMonNodeFormValues = z.infer<
  ReturnType<typeof createBackupStorageSetMonNodeSchema>
>;
