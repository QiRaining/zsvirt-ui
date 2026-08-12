import { gql } from "@apollo/client";
import { ResourceQueryType } from "@zstack/zsphere-types";
import { isIP } from "@zstack/zsphere-utils";
import { get as _get, some as _some } from "lodash-es";
import { useMemo } from "react";
import { IntlShape } from "react-intl";
import { z } from "zod";

import { createStringRules } from "./string.ts";

export const useValidationRules = (intl: IntlShape) =>
  useMemo(() => createStringRules(intl), [intl]);

interface ApolloQueryClient {
  query: (options: {
    query: unknown;
    variables: Record<string, unknown>;
  }) => Promise<{
    data?: {
      resourceCount?: { total?: number };
      resourceList?: { list?: Array<{ name?: string; uuid?: string }> };
    };
  }>;
}

type ApolloClientResolver = () => ApolloQueryClient | undefined;

const defaultApolloClientResolver: ApolloClientResolver = () =>
  (
    window as typeof window & {
      g_main?: { apolloClient?: ApolloQueryClient };
    }
  ).g_main?.apolloClient;

let apolloClientResolver: ApolloClientResolver = defaultApolloClientResolver;

/**
 * Override the Apollo client resolver used by async resource validators
 * (e.g. `uniqueResourceName`). Hosts that do not expose
 * `window.g_main.apolloClient` should call this once at bootstrap.
 *
 * Pass `undefined` to restore the default `window.g_main.apolloClient` lookup.
 */
export const setApolloClientResolver = (
  resolver: ApolloClientResolver | undefined,
) => {
  apolloClientResolver = resolver ?? defaultApolloClientResolver;
};

const getApolloClient = () => apolloClientResolver();

export interface IntlLike {
  formatMessage: (
    descriptor: { id: string; defaultMessage: string },
    values?: Record<string, number | string>,
  ) => string;
}

export const requiredString = (
  intl: IntlLike,
  message?: { id: string; defaultMessage: string },
) =>
  z.string().refine((value) => value.trim().length > 0, {
    message: intl.formatMessage({
      id: message?.id ?? "global.field.validator.input.required",
      defaultMessage: message?.defaultMessage ?? "输入内容不能为空",
    }),
  });

export const lengthRangeString = (intl: IntlLike, min: number, max: number) =>
  z.string().refine((value) => value.length >= min && value.length <= max, {
    message: intl.formatMessage(
      {
        id: "global.field.validator.lengthRange",
        defaultMessage: "输入内容需在{min}~{max}字符范围内",
      },
      { min, max },
    ),
  });

export const optionalMaxLengthString = (intl: IntlLike, max: number) =>
  z.string().max(max, {
    message: intl.formatMessage(
      {
        id: "global.field.validator.lengthRange",
        defaultMessage: "输入内容需在{min}~{max}字符范围内",
      },
      { min: 1, max },
    ),
  });

export const validNameString = (intl: IntlLike) =>
  z
    .string()
    .regex(
      /^[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+(\s+[a-zA-Z0-9\u4e00-\u9fa5\-_.:+()]+)*$/,
      {
        message: intl.formatMessage({
          id: "global.field.validator.input.valid",
          defaultMessage:
            "输入内容只能包含中文汉字、英文字母、数字和以下 7 种英文字符“-”、“_”、“.”、“(”、“)”、“:”、“+”",
        }),
      },
    );

export const commonNameString = (intl: IntlLike) =>
  requiredString(intl)
    .and(lengthRangeString(intl, 1, 128))
    .and(validNameString(intl));

export const longDescriptionString = (intl: IntlLike) =>
  optionalMaxLengthString(intl, 2000);

export const commonDescriptionString = (intl: IntlLike) =>
  optionalMaxLengthString(intl, 256);

const queryResourceCount = gql`
  query resourceCount($conditions: [Condition!], $type: ResourceQueryType!) {
    resourceCount(conditions: $conditions, type: $type) {
      total
    }
  }
`;

const queryResourceList = gql`
  query resourceList($conditions: [Condition!], $type: ResourceQueryType!) {
    resourceList(conditions: $conditions, type: $type) {
      list {
        name
        uuid
      }
      total
    }
  }
`;

export const uniqueResourceName = (
  intl: IntlLike,
  resourceType: ResourceQueryType,
  originName?: string,
  message?: string,
  caseSensitive?: boolean,
) =>
  z.string().superRefine(async (value, ctx) => {
    if (!value || (originName && originName === value)) {
      return;
    }

    const apolloClient = getApolloClient();
    if (!apolloClient) {
      // Fail closed: surface a validation error instead of letting the
      // form submit and rely on the backend to reject a duplicate name.
      // Hosts should configure a client via `setApolloClientResolver`
      // before any form using uniqueResourceName mounts.
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "name.validate.network.failed",
          defaultMessage: "校验名称失败，请稍后再试",
        }),
      });
      return;
    }

    try {
      const res = await apolloClient.query({
        query: caseSensitive ? queryResourceList : queryResourceCount,
        variables: {
          type: resourceType,
          conditions: [
            {
              key: "name",
              value,
            },
          ],
        },
      });

      const isNameUnique = caseSensitive
        ? !_some(_get(res, ["data", "resourceList", "list"]), ["name", value])
        : res?.data?.resourceCount?.total === 0;

      if (!isNameUnique) {
        ctx.addIssue({
          code: "custom",
          message:
            message ??
            intl.formatMessage({
              id: "name.validate.should.be.uniq",
              defaultMessage: "名称不能和已有的重复",
            }),
        });
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        message: intl.formatMessage({
          id: "name.validate.network.failed",
          defaultMessage: "校验名称失败，请稍后再试",
        }),
      });
    }
  });

export const ipv4String = (
  intl: IntlLike,
  requiredMessage?: { id: string; defaultMessage: string },
) =>
  requiredString(intl, requiredMessage).refine((value) => isIP(value, 4), {
    message: intl.formatMessage({
      id: "l3Network.field.ipv4Ip.validator.format",
      defaultMessage: "无效的Ipv4 IP地址",
    }),
  });

export const ipString = (
  intl: IntlLike,
  requiredMessage?: { id: string; defaultMessage: string },
) =>
  requiredString(intl, requiredMessage).refine((value) => isIP(value), {
    message: intl.formatMessage({
      id: "monitoringNode.field.ip.validator.format",
      defaultMessage: "无效的IP地址",
    }),
  });

export const portString = (intl: IntlLike) =>
  requiredString(intl, {
    id: "host.ipmi.port.valid.required",
    defaultMessage: "请输入端口",
  }).refine(
    (value) => {
      const port = Number(value);
      return (
        /^\d+$/.test(value.trim()) &&
        Number.isInteger(port) &&
        port >= 1 &&
        port <= 65535
      );
    },
    {
      message: intl.formatMessage({
        id: "host.ipmi.port.valid",
        defaultMessage: "无效的端口",
      }),
    },
  );

export const numberRangeValue = (
  intl: IntlLike,
  min: number,
  max: number,
  requiredMessage?: { id: string; defaultMessage: string },
) =>
  z
    .union([z.number(), z.string()])
    .refine(
      (value) => {
        if (typeof value === "number") return !Number.isNaN(value);
        return value.trim().length > 0;
      },
      {
        message: intl.formatMessage({
          id: requiredMessage?.id ?? "global.field.validator.input.required",
          defaultMessage: requiredMessage?.defaultMessage ?? "输入内容不能为空",
        }),
      },
    )
    .refine(
      (value) => {
        if (typeof value === "number") {
          return Number.isFinite(value) && value >= min && value <= max;
        }
        const trimmed = value.trim();
        if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return false;
        const numberValue = Number(trimmed);
        return (
          Number.isFinite(numberValue) &&
          numberValue >= min &&
          numberValue <= max
        );
      },
      {
        message: intl.formatMessage(
          {
            id: "global.field.validator.numberRange",
            defaultMessage: "输入内容需在{min}~{max}范围内",
          },
          { min, max },
        ),
      },
    )
    .transform((value) =>
      typeof value === "number" ? value : Number(value.trim()),
    );
