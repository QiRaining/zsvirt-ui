import { commonNameString, requiredString, type IntlLike } from "@zstack/form";
import { isIP, isPort } from "@zstack/zsphere-utils";
import { z } from "zod";

export const createIscsiServerSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    ip: requiredString(intl, {
      id: "iSCSIServer.field.ip.validator.required",
      defaultMessage: "This field is required.",
    }).refine((value) => isIP(value), {
      message: intl.formatMessage({
        id: "iSCSIServer.field.ip.validator.invalid",
        defaultMessage: "Invalid IP address.",
      }),
    }),
    port: requiredString(intl, {
      id: "iSCSIServer.field.port.validator.required",
      defaultMessage: "This field is required.",
    }).refine((value) => isPort(String(value)), {
      message: intl.formatMessage({
        id: "iSCSIServer.field.port.validator.invalid",
        defaultMessage: "Invalid port.",
      }),
    }),
    clusterUuid: requiredString(intl, {
      id: "global.field.validator.select.required",
      defaultMessage: "This field is required.",
    }),
    chapUserName: z.string().optional(),
    chapUserPassword: z.string().optional(),
  });

export type IscsiServerFormValues = z.infer<
  ReturnType<typeof createIscsiServerSchema>
>;
