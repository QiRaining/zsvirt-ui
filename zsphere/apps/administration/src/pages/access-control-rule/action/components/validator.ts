import { isLegalIPRange, isCidr, isIP } from "@zstack/zsphere-utils";
import { useMemo } from "react";
import type { IntlShape } from "react-intl";

export function useIpRuleValidators(intl: IntlShape) {
  const maxRuleCount = 100;
  const isLegalRule = (value: string) =>
    isLegalIPRange(value) || isCidr(value) || isIP(value);

  const ipRuleBulkEditValidator = useMemo(
    () => ({
      validator: (_rule: any, value?: Array<string | undefined>) => {
        if (!value || !value.length || (value.length === 1 && !value[0])) {
          return Promise.reject(
            new Error(
              intl.formatMessage({
                id: "virtualization.accessControlRule.ip.input",
                defaultMessage: "Enter IP address.",
              }),
            ),
          );
        }
        if (value.some((item) => !item || !isLegalRule(item))) {
          return Promise.reject(
            new Error(
              intl.formatMessage({
                id: "virtualization.accessControlRule.ip.rule",
                defaultMessage: "Invalid format.",
              }),
            ),
          );
        }
        if (new Set(value).size < value.length) {
          return Promise.reject(
            new Error(
              intl.formatMessage({
                id: "virtualization.accessControlRule.ip.rule.duplicate",
                defaultMessage: "Duplicated IP address.",
              }),
            ),
          );
        }
        if (value.length > maxRuleCount) {
          return Promise.reject(
            new Error(
              intl.formatMessage({
                id: "virtualization.accessControlRule.ip.rule.limit",
                defaultMessage: "The number of input IP addresses exceeds the limit.",
              }),
            ),
          );
        }
        return Promise.resolve();
      },
    }),
    [intl],
  );

  const ipRuleListEditValidator = useMemo(
    () => ({
      validator: (_rule: any, value?: Array<string | undefined>) => {
        if (!value?.length) {
          return Promise.resolve();
        }
        const listError =
          value.length > maxRuleCount
            ? intl.formatMessage({
                id: "virtualization.accessControlRule.ip.rule.limit",
                defaultMessage: "The number of input IP addresses exceeds the limit.",
              })
            : null;
        const fieldError: Record<number, string> = {};
        const valueSet = new Map<string, number>();
        value.forEach((item, idx) => {
          if (!item) {
            return;
          }
          if (!isLegalRule(item)) {
            fieldError[idx] = intl.formatMessage({
              id: "virtualization.accessControlRule.ip.rule",
              defaultMessage: "Invalid format.",
            });
          } else if (valueSet.has(item)) {
            const msg = intl.formatMessage({
              id: "virtualization.accessControlRule.ip.rule.duplicate",
              defaultMessage: "Duplicated IP address.",
            });
            fieldError[idx] = msg;
            fieldError[valueSet.get(item)!] = msg;
          } else {
            valueSet.set(item, idx);
          }
        });
        if (listError || Object.keys(fieldError).length) {
          return Promise.reject({ list: listError, field: fieldError });
        }
        return Promise.resolve();
      },
    }),
    [intl],
  );

  return {
    maxRuleCount,
    ipRuleBulkEditValidator,
    ipRuleListEditValidator,
  };
}
