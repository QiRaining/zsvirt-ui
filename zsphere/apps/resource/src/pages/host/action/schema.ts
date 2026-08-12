import {
  type IntlLike,
  commonNameString,
  ipv4String,
  longDescriptionString,
  portString,
  requiredString,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { isIP, isPort } from "@zstack/zsphere-utils";
import { z } from "zod";

export const createModifyHostUsernameSchema = (intl: IntlLike) =>
  z.object({
    username: requiredString(intl),
  });

export const createModifyHostSshPortSchema = (intl: IntlLike) =>
  z.object({
    sshPort: portString(intl),
  });

export const createModifyHostPasswordSchema = (intl: IntlLike) =>
  z.object({
    password: requiredString(intl),
  });

export const createModifyHostIpSchema = (intl: IntlLike) =>
  z.object({
    managementIp: requiredString(intl),
    checked: z.boolean().refine((value) => value, {
      message: intl.formatMessage({
        id: "check.risk.first",
        defaultMessage: "Acknowledge the risk.",
      }),
    }),
  });

export const createUpdateHostIpmiSchema = (intl: IntlLike) =>
  z.object({
    ipmiAddress: ipv4String(intl, {
      id: "host.ipmi.ipmi.address.valid.required",
      defaultMessage: "Enter an IPMI address.",
    }),
    ipmiPort: portString(intl),
    ipmiUsername: requiredString(intl, {
      id: "host.ipmi.ipmi.username.valid.required",
      defaultMessage: "Enter an IPMI username.",
    }),
    ipmiPassword: requiredString(intl, {
      id: "host.ipmi.ipmi.password.valid.required",
      defaultMessage: "Enter an IPMI password.",
    }),
  });

export const createUpdateHostSshInfoSchema = (intl: IntlLike) =>
  z.object({
    managementIp: requiredString(intl).refine((value) => isIP(value), {
      message: intl.formatMessage({
        id: "host.field.hostIp.validator.format",
        defaultMessage: "Invalid IP address.",
      }),
    }),
    sshPort: requiredString(intl).refine((value) => isPort(value), {
      message: intl.formatMessage({
        id: "host.field.sshPort.validator.format",
        defaultMessage: "Invalid SSH port.",
      }),
    }),
    username: requiredString(intl),
    password: requiredString(intl),
  });

export const createHostPowerControlSchema = (
  intl: IntlLike,
  confirmInputText: string,
) =>
  z.object({
    enteringMaintenanceMode: z.boolean().optional(),
    stopHost: z.boolean().optional(),
    acceptRisk: z
      .string()
      .refine(
        (value) => value.toLowerCase() === confirmInputText.toLowerCase(),
        {
          message: intl.formatMessage({
            id: "please.input.the.riskWarning.first",
            defaultMessage: "Enter the correct text to acknowledge the risk.",
          }),
        },
      ),
  });

export const createUpdateHostSchema = (intl: IntlLike, originName?: string) =>
  z.object({
    name: commonNameString(intl).and(
      uniqueResourceName(
        intl,
        ResourceQueryType.Host,
        originName,
        intl.formatMessage({
          id: "host.field.name.validator.duplicate",
          defaultMessage: "This name is already in use. Enter a different name.",
        }),
        true,
      ),
    ),
    description: longDescriptionString(intl),
  });

export type ModifyHostUsernameFormValues = z.infer<
  ReturnType<typeof createModifyHostUsernameSchema>
>;

export type ModifyHostSshPortFormValues = z.infer<
  ReturnType<typeof createModifyHostSshPortSchema>
>;

export type ModifyHostPasswordFormValues = z.infer<
  ReturnType<typeof createModifyHostPasswordSchema>
>;

export type ModifyHostIpFormValues = z.infer<
  ReturnType<typeof createModifyHostIpSchema>
>;

export type UpdateHostIpmiFormValues = z.infer<
  ReturnType<typeof createUpdateHostIpmiSchema>
>;

export type UpdateHostSshInfoFormValues = z.infer<
  ReturnType<typeof createUpdateHostSshInfoSchema>
>;

export type HostPowerControlFormValues = z.infer<
  ReturnType<typeof createHostPowerControlSchema>
>;

export type UpdateHostFormValues = z.infer<
  ReturnType<typeof createUpdateHostSchema>
>;
