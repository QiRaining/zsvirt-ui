import {
  commonNameString,
  longDescriptionString,
  type IntlLike,
  requiredString,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { isCidr, isIP } from "@zstack/zsphere-utils";
import { z } from "zod";

interface StorageNode {
  hostname?: string | null;
}

const optionalCidr = (intl: IntlLike, messageId: string) =>
  z.string().refine((value) => value === "" || isCidr(value), {
    message: intl.formatMessage({
      id: messageId,
      defaultMessage: "Invalid CIDR",
    }),
  });

export const createModifyStorageNetworkCidrSchema = (intl: IntlLike) =>
  z.object({
    cidr: requiredString(intl).refine((value) => isCidr(value), {
      message: intl.formatMessage({
        id: "primaryStorage.field.storageNetwork.validator.format",
        defaultMessage: "Invalid CIDR.",
      }),
    }),
  });

export const createUpdateColdMigrateNetworkSchema = (intl: IntlLike) =>
  z.object({
    coldMigrateNetwork: optionalCidr(
      intl,
      "primaryStorage.field.coldMigrateNetwork.validator.format",
    ),
  });

export const createModifyProvisionSchema = (intl: IntlLike) =>
  z.object({
    value: requiredString(intl),
  });

export const createModifyCephTokenSchema = (intl: IntlLike) =>
  z.object({
    token: requiredString(intl).regex(/^[a-zA-Z0-9]{32,32}$/, {
      message: intl.formatMessage({
        id: "global.field.validator.input.number.and.char.valid",
        defaultMessage: "The value can be 1–32 characters in length and can contain only letters and digits.",
      }),
    }),
  });

export const createPrimaryStorageUpdateSchema = (
  intl: IntlLike,
  originName?: string,
) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.PrimaryStorage,
        originName,
        undefined,
        true,
      ),
    ),
    description: longDescriptionString(intl),
  });

export const createModifyResourceConfigSchema = (
  intl: IntlLike,
  overProvisioningFieldName: string,
) =>
  z.object({
    configs: z
      .record(z.string(), z.union([z.string(), z.number(), z.undefined()]))
      .superRefine((configs, ctx) => {
        const value = configs[overProvisioningFieldName];

        if (value === "" || value === null || value === undefined) {
          ctx.addIssue({
            code: "custom",
            path: [overProvisioningFieldName],
            message: intl.formatMessage({
              id: "globalConfig.edit.validator.cannot.be.empty",
              defaultMessage: "Specify a number.",
            }),
          });
          return;
        }

        const number = Number(value);
        if (!Number.isFinite(number) || number < 1 || number > 1000) {
          ctx.addIssue({
            code: "custom",
            path: [overProvisioningFieldName],
            message: intl.formatMessage({
              id: "globalConfig.validate.mevoco.overProvisioning.range",
              defaultMessage:
                "Enter a number that ranges from 1.00 to 1,000.00.",
            }),
          });
        }
      }),
  });

const storageNodeIpString = (
  intl: IntlLike,
  nodes: StorageNode[] | undefined,
  current: StorageNode | undefined,
  duplicateDefaultMessage: string,
) =>
  requiredString(intl).superRefine((value, ctx) => {
    const isCurrentNode = current?.hostname === value;

    if (!isCurrentNode && nodes?.some((node) => node.hostname === value)) {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "monitoringNode.field.ip.exist.validator.format",
          defaultMessage: duplicateDefaultMessage,
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

export const createPrimaryStorageSetMonNodeSchema = (
  intl: IntlLike,
  mons?: StorageNode[],
  current?: StorageNode,
) =>
  z.object({
    hostname: storageNodeIpString(intl, mons, current, "监控节点IP已存在"),
    sshPort: requiredString(intl),
    sshUsername: requiredString(intl),
    sshPassword: requiredString(intl),
  });

export const createPrimaryStorageSetMdsNodeSchema = (
  intl: IntlLike,
  mdsNodes?: StorageNode[],
  current?: StorageNode,
) =>
  z.object({
    hostname: storageNodeIpString(intl, mdsNodes, current, "MDS节点IP已存在"),
    sshPort: requiredString(intl),
    sshUsername: requiredString(intl),
    sshPassword: requiredString(intl),
  });

export type ModifyStorageNetworkCidrFormValues = z.infer<
  ReturnType<typeof createModifyStorageNetworkCidrSchema>
>;

export type UpdateColdMigrateNetworkFormValues = z.infer<
  ReturnType<typeof createUpdateColdMigrateNetworkSchema>
>;

export type ModifyProvisionFormValues = z.infer<
  ReturnType<typeof createModifyProvisionSchema>
>;

export type ModifyCephTokenFormValues = z.infer<
  ReturnType<typeof createModifyCephTokenSchema>
>;

export type PrimaryStorageUpdateValues = z.infer<
  ReturnType<typeof createPrimaryStorageUpdateSchema>
>;

export type ModifyResourceConfigFormValues = z.infer<
  ReturnType<typeof createModifyResourceConfigSchema>
>;

export type PrimaryStorageSetMonNodeFormValues = z.infer<
  ReturnType<typeof createPrimaryStorageSetMonNodeSchema>
>;

export type PrimaryStorageSetMdsNodeFormValues = z.infer<
  ReturnType<typeof createPrimaryStorageSetMdsNodeSchema>
>;
