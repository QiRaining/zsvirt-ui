import {
  commonDescriptionString,
  commonNameString,
  type IntlLike,
} from "@zstack/form";
import { isPhoneNumber } from "@zstack/zsphere-utils";
import { z } from "zod";

const endpointLocaleValues = ["zh_CN", "en_US"] as const;
const englishEndpointLocaleValues = ["en_US"] as const;

declare const __ZSV_ENGLISH_ONLY__: boolean | undefined;

export type EndpointLocale = (typeof endpointLocaleValues)[number];

export interface EndpointLocaleOption {
  value: EndpointLocale;
  label: string;
}

export const isZsvEnglishOnlyMode = () => {
  return typeof __ZSV_ENGLISH_ONLY__ === "boolean"
    ? __ZSV_ENGLISH_ONLY__
    : false;
};

export const normalizeEndpointLocale = (
  locale?: string | null,
): EndpointLocale => {
  if (isZsvEnglishOnlyMode()) {
    return "en_US";
  }

  return locale === "en_US" ? "en_US" : "zh_CN";
};

export const getDefaultEndpointLocale = (locale?: string): EndpointLocale => {
  return normalizeEndpointLocale(
    locale === "en-US" || locale === "en_US" ? "en_US" : "zh_CN",
  );
};

export const getEndpointLocaleLabel = (
  intl: IntlLike,
  locale?: string | null,
) => {
  return normalizeEndpointLocale(locale) === "en_US"
    ? intl.formatMessage({
        id: "endpoint.locale.enUS",
        defaultMessage: "English",
      })
    : intl.formatMessage({
        id: "endpoint.locale.zhCN",
        defaultMessage: "Simplified Chinese",
      });
};

export const getEndpointLocaleOptions = (
  intl: IntlLike,
): EndpointLocaleOption[] => {
  if (isZsvEnglishOnlyMode()) {
    return [
      {
        value: "en_US",
        label: getEndpointLocaleLabel(intl, "en_US"),
      },
    ];
  }

  return [
    { value: "zh_CN", label: getEndpointLocaleLabel(intl, "zh_CN") },
    { value: "en_US", label: getEndpointLocaleLabel(intl, "en_US") },
  ];
};

export const createUpdateEndpointSchema = (intl: IntlLike) =>
  z.object({
    name: commonNameString(intl),
    description: commonDescriptionString(intl),
  });

export type UpdateEndpointFormValues = z.infer<
  ReturnType<typeof createUpdateEndpointSchema>
>;

export const createModifyEndpointLocaleSchema = () =>
  z.object({
    locale: isZsvEnglishOnlyMode()
      ? z.enum(englishEndpointLocaleValues)
      : z.enum(endpointLocaleValues),
  });

export type ModifyEndpointLocaleFormValues = z.infer<
  ReturnType<typeof createModifyEndpointLocaleSchema>
>;

export const createTestMessageSchema = (intl: IntlLike) =>
  z.object({
    areaCodePhoneNumber: z.object({
      areaCode: z
        .string()
        .min(
          1,
          intl.formatMessage({
            id: "zwatchEndpoint.field.areaCode.validator.required",
            defaultMessage: "Enter an international telephone code.",
          }),
        )
        .regex(
          /^[1-9][0-9]{0,2}$/,
          intl.formatMessage({
            id: "zwatchEndpoint.field.areaCode.validator.format",
            defaultMessage: "Enter a valid international telephone code.",
          }),
        ),
      phoneNumber: z
        .string()
        .min(
          1,
          intl.formatMessage({
            id: "zwatch.endpoint.form.sms.address.validator.required",
            defaultMessage: "This field is required.",
          }),
        )
        .refine(
          (value) => isPhoneNumber(value),
          intl.formatMessage({
            id: "zwatch.endpoint.form.sms.address.validator.format",
            defaultMessage: "Invalid phone number.",
          }),
        ),
    }),
  });

export type TestMessageFormValues = z.infer<
  ReturnType<typeof createTestMessageSchema>
>;

export const createUpdateDingTalkAtPersonSchema = (intl: IntlLike) =>
  z.object({
    atPersonPhoneNumber: z.object({
      areaCode: z
        .string()
        .min(
          1,
          intl.formatMessage({
            id: "zwatchEndpoint.field.areaCode.validator.required",
            defaultMessage: "Enter an international telephone code.",
          }),
        )
        .regex(
          /^[1-9][0-9]{0,2}$/,
          intl.formatMessage({
            id: "zwatchEndpoint.field.areaCode.validator.format",
            defaultMessage: "Enter a valid international telephone code.",
          }),
        ),
      phoneNumber: z
        .string()
        .min(
          1,
          intl.formatMessage({
            id: "zwatchEndpoint.field.phoneNumber.validator.required",
            defaultMessage: "This field is required.",
          }),
        )
        .refine(
          (value) => isPhoneNumber(value),
          intl.formatMessage({
            id: "zwatchEndpoint.field.phoneNumber.validator.format",
            defaultMessage: "Invalid phone number.",
          }),
        ),
    }),
    remark: z.string().max(
      64,
      intl.formatMessage({
        id: "userId.validator.succeed_max_limit",
        defaultMessage: "The ID must be 1-64 characters in length.",
      }),
    ),
  });

export type UpdateDingTalkAtPersonFormValues = z.infer<
  ReturnType<typeof createUpdateDingTalkAtPersonSchema>
>;
