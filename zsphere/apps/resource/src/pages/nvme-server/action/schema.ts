import { commonNameString, requiredString, type IntlLike } from "@zstack/form";
import { TransportType } from "@zstack/zsphere-types";
import { isIP, isPort } from "@zstack/zsphere-utils";
import { z } from "zod";

export const createAddNvmeServerSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    ip: requiredString(intl, {
      id: "nvmeServer.field.ip.validator.required",
      defaultMessage: "This field is required.",
    }).refine((value) => isIP(value), {
      message: intl.formatMessage({
        id: "nvmeServer.field.ip.validator.invalid",
        defaultMessage: "Invalid IP address.",
      }),
    }),
    port: requiredString(intl, {
      id: "nvmeServer.field.port.validator.required",
      defaultMessage: "This field is required.",
    }).refine((value) => isPort(String(value)), {
      message: intl.formatMessage({
        id: "nvmeServer.field.port.validator.invalid",
        defaultMessage: "Invalid port.",
      }),
    }),
    transport: z.nativeEnum(TransportType),
    clusterUuid: requiredString(intl, {
      id: "global.field.validator.select.required",
      defaultMessage: "This field is required.",
    }),
  });

export type AddNvmeServerFormValues = z.infer<
  ReturnType<typeof createAddNvmeServerSchema>
>;

export const createEditNvmeServerNameSchema = (intl: IntlLike) =>
  z.object({
    name: z.string().refine((value) => value.trim().length > 0, {
      message: intl.formatMessage({
        id: "global.field.validator.input.required",
        defaultMessage: "This field is required.",
      }),
    }),
  });

export type EditNvmeServerNameFormValues = z.infer<
  ReturnType<typeof createEditNvmeServerNameSchema>
>;
