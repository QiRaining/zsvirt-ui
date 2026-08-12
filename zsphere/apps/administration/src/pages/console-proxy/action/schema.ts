import type { IntlLike } from "@zstack/form";
import { isDNSDomainName, isIP, isPort } from "@zstack/zsphere-utils";
import { z } from "zod";

const consoleProxyAddressString = (intl: IntlLike) =>
  z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: intl.formatMessage({
        id: "consoleproxy.field.name.validator.required",
        defaultMessage: "This field is required.",
      }),
    })
    .refine(
      (value) => {
        const input = value.trim();
        return isIP(input) || isDNSDomainName(input);
      },
      {
        message: intl.formatMessage({
          id: "consoleproxy.field.name.validator.format",
          defaultMessage: "Invalid CIDR block.",
        }),
      },
    );

const consoleProxyPortValue = (intl: IntlLike) =>
  z.any().refine(
    (value) => {
      return isPort(String(value)) && value !== 0;
    },
    {
      message: intl.formatMessage({
        id: "consoleProxy.field.port.validator.format",
        defaultMessage: "Wrong port format.",
      }),
    },
  );

export const createUpdateConsoleProxySchema = (intl: IntlLike) =>
  z.object({
    name: consoleProxyAddressString(intl),
    consoleProxyPort: consoleProxyPortValue(intl),
  });

export type UpdateConsoleProxyFormValues = z.infer<
  ReturnType<typeof createUpdateConsoleProxySchema>
>;
