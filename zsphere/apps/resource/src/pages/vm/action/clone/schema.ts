import {
  commonNameString,
  type IntlLike,
  uniqueResourceName,
} from "@zstack/form";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { isIP, isValidNetMask } from "@zstack/zsphere-utils";
import { z } from "zod";

const duplicateVmNameMessage = (intl: IntlLike) =>
  intl.formatMessage({
    id: "vm.field.name.validator.duplicate",
    defaultMessage: "This name is already in use. Enter a different name.",
  });

const selectedListSchema = z.array(z.custom<any>()).default([]);

const l3NetworkRequiredMessage = (intl: IntlLike) =>
  intl.formatMessage({
    id: "instance.field.l3NetworkUuids.validator.required",
    defaultMessage: "Select Distributed Port Group",
  });

const getBandwidthValue = (value: any) => {
  const unitList = ["Kbps", "Mbps", "Gbps"];
  return (
    (value?.number ?? 0) *
    1024 ** (unitList.findIndex((unit) => unit === value?.unit) + 1)
  );
};

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === "";

export const createCloneVmSchema = (intl: IntlLike) =>
  z
    .object({
      sourceVmName: z.string().default(""),
      cloneType: z.string().default("FullClone"),
      name: commonNameString(intl).and(
        uniqueResourceName(
          intl,
          ResourceQueryType.VmInstance,
          undefined,
          duplicateVmNameMessage(intl),
          true,
        ),
      ),
      count: z.coerce
        .number()
        .min(1, {
          message: intl.formatMessage({
            id: "vm.field.count.validator.range",
            defaultMessage: "Enter a number from 1 to 1000.",
          }),
        })
        .max(10000, {
          message: intl.formatMessage({
            id: "vm.field.count.validator.range",
            defaultMessage: "Enter a number from 1 to 1000.",
          }),
        }),
      strategy: z.boolean().default(false),
      hostname: z
        .string()
        .default("")
        .refine(
          (value) =>
            value === "" ||
            (value.length <= 63 &&
              /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(value)),
          {
            message: intl.formatMessage({
              id: "virtualization.field.hostname.validator.format",
              defaultMessage:
                "The hostname can contain only letters, digits, and hyphens, cannot start or end with a hyphen, and must be no longer than 63 characters.",
            }),
          },
        ),
      vmGroupList: selectedListSchema,
      tpmConfigMethod: z.string().default("Retain"),
    })
    .catchall(z.any())
    .superRefine((values, ctx) => {
      const nicIndexes = Object.keys(values).reduce<Set<number>>(
        (indexes, key) => {
          const match = key.match(
            /^(l3NetworkUuids|netCardState|nicType|nicUuid)-(\d+)$/,
          );

          if (match) {
            indexes.add(Number(match[2]));
          }

          return indexes;
        },
        new Set(),
      );

      nicIndexes.forEach((index) => {
        const key = `l3NetworkUuids-${index}`;
        const l3NetworkUuids = values[key];
        const portGroup = Array.isArray(l3NetworkUuids)
          ? l3NetworkUuids[0]
          : undefined;

        if (!Array.isArray(l3NetworkUuids) || l3NetworkUuids.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: l3NetworkRequiredMessage(intl),
          });
        }

        const customMac = values[`customMac-${index}`];
        if (customMac) {
          const validFormat = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/.test(
            customMac,
          );

          if (!validFormat) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`customMac-${index}`],
              message: intl.formatMessage({
                id: "virtualization.field.MAC.validator.format",
                defaultMessage: "Invalid MAC address.",
              }),
            });
          } else {
            const firstByte = parseInt(customMac.substring(0, 2), 16);
            if ((firstByte & 1) === 1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`customMac-${index}`],
                message: intl.formatMessage({
                  id: "virtualization.field.MAC.validator.multicastMac",
                  defaultMessage: "Enter an unicast MAC address.",
                }),
              });
            }
          }
        }

        const nicMultiQueueNum = values[`nicMultiQueueNum-${index}`];
        if (!isEmpty(nicMultiQueueNum)) {
          const value = Number(nicMultiQueueNum);
          if (!Number.isInteger(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`nicMultiQueueNum-${index}`],
              message: intl.formatMessage({
                id: "global.field.validator.numberRange.isInteger",
                defaultMessage: "Please enter an integer.",
              }),
            });
          } else if (value <= 0 || value > 256) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`nicMultiQueueNum-${index}`],
              message: intl.formatMessage(
                {
                  id: "global.field.validator.numberRange",
                  defaultMessage: "Allowed range: {min}–{max}.",
                },
                { min: 1, max: 256 },
              ),
            });
          }
        }

        const validateIp = (fieldName: string, ipVersion: 4 | 6) => {
          const value = values[fieldName];
          if (value && !isIP(value, ipVersion)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [fieldName],
              message: intl.formatMessage({
                id: "bareMetalNode.field.start.ip.validator.format",
                defaultMessage: "Invalid IP address.",
              }),
            });
          }
        };

        if (portGroup?.enableIPAM) {
          validateIp(`ipv4-${index}`, 4);
          validateIp(`ipv6-${index}`, 6);
        } else {
          if (values[`appointIpv4-${index}`]) {
            if (!values[`ipv4-${index}`]) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`ipv4-${index}`],
                message: intl.formatMessage({
                  id: "global.field.validator.required",
                  defaultMessage: "This field is required.",
                }),
              });
            }
            if (!values[`netmask-${index}`]) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`netmask-${index}`],
                message: intl.formatMessage({
                  id: "global.field.validator.required",
                  defaultMessage: "This field is required.",
                }),
              });
            }
            validateIp(`ipv4-${index}`, 4);
            validateIp(`gateway4-${index}`, 4);
            if (
              values[`netmask-${index}`] &&
              !isValidNetMask(values[`netmask-${index}`])
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`netmask-${index}`],
                message: intl.formatMessage({
                  id: "l3Network.field.netmask.validator.format",
                  defaultMessage: "Invalid netmask.",
                }),
              });
            }
          }

          if (values[`appointIpv6-${index}`]) {
            if (!values[`ipv6-${index}`]) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`ipv6-${index}`],
                message: intl.formatMessage({
                  id: "global.field.validator.required",
                  defaultMessage: "This field is required.",
                }),
              });
            }
            if (!values[`prefixLen-${index}`]) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`prefixLen-${index}`],
                message: intl.formatMessage({
                  id: "global.field.validator.required",
                  defaultMessage: "This field is required.",
                }),
              });
            }
            validateIp(`ipv6-${index}`, 6);
            validateIp(`gateway6-${index}`, 6);

            const prefixLen = Number(values[`prefixLen-${index}`]);
            if (
              values[`prefixLen-${index}`] &&
              (!Number.isInteger(prefixLen) ||
                prefixLen < 64 ||
                prefixLen > 126)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`prefixLen-${index}`],
                message: intl.formatMessage(
                  {
                    id: "global.field.validator.numberRange",
                    defaultMessage: "Allowed range: {min}–{max}.",
                  },
                  { min: 64, max: 126 },
                ),
              });
            }
          }
        }

        if (values[`netCardQosEnabled-${index}`]) {
          [
            [
              `outboundBandwidth-${index}`,
              "vm.field.outbound.validator.invalid",
            ],
            [`inboundBandwidth-${index}`, "vm.inbound.validator.invalid"],
          ].forEach(([fieldName, messageId]) => {
            const value = values[fieldName];
            const bandwidth = getBandwidthValue(value);
            const hasValue = !isEmpty(value?.number);
            const min = getBandwidthValue({ number: 8, unit: "Kbps" });
            const max = getBandwidthValue({ number: 30, unit: "Gbps" });

            if (hasValue && (bandwidth < min || bandwidth > max)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [fieldName],
                message: intl.formatMessage({
                  id: messageId,
                  defaultMessage:
                    fieldName === `outboundBandwidth-${index}`
                      ? "无效的上行带宽"
                      : "无效的下行带宽",
                }),
              });
            }
          });
        }

        if (values[`dnsAllocationType4-${index}`] === "manual") {
          const dnsList = values[`dnsList4-${index}`] ?? [];
          dnsList.forEach((dns: string, dnsIndex: number) => {
            if (dns && !isIP(dns, 4)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`dnsList4-${index}`, dnsIndex],
                message: intl.formatMessage({
                  id: "create.vm.field.dns.validator.format",
                  defaultMessage: "Invalid DNS.",
                }),
              });
            }
          });
        }

        if (values[`dnsAllocationType6-${index}`] === "manual") {
          const dnsList = values[`dnsList6-${index}`] ?? [];
          dnsList.forEach((dns: string, dnsIndex: number) => {
            if (dns && !isIP(dns, 6)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [`dnsList6-${index}`, dnsIndex],
                message: intl.formatMessage({
                  id: "create.vm.field.dns.validator.format",
                  defaultMessage: "Invalid DNS.",
                }),
              });
            }
          });
        }
      });

      if (values.dnsAllocationType === "manual") {
        const dnsList = values.dnsList ?? [];
        dnsList.forEach((dns: string, dnsIndex: number) => {
          if (dns && !isIP(dns, 4) && !isIP(dns, 6)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["dnsList", dnsIndex],
              message: intl.formatMessage({
                id: "create.vm.field.dns.validator.format",
                defaultMessage: "Invalid DNS.",
              }),
            });
          }
        });
      }
    });

export type CloneVmValues = z.infer<ReturnType<typeof createCloneVmSchema>>;
