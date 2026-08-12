import { AccessControlRuleType } from "@zstack/zsphere-types";
import { useIntl } from "react-intl";

export const useAccessControlRuleType = () => {
  const intl = useIntl();

  const accessControlRuleTypeMap = new Map<AccessControlRuleType, string>([
    [
      AccessControlRuleType.REJECT,
      intl.formatMessage({
        id: "virtualization.accessControlRule.field.controlStrategy.reject",
        defaultMessage: "Blocklist",
      }),
    ],
    [
      AccessControlRuleType.ACCEPT,
      intl.formatMessage({
        id: "virtualization.accessControlRule.field.controlStrategy.accept",
        defaultMessage: "Allowlist",
      }),
    ],
  ]);

  const accessControlRuleTypeList = [...accessControlRuleTypeMap.entries()].map(
    ([value, label]) => ({ label, value }),
  );

  return { accessControlRuleTypeMap, accessControlRuleTypeList };
};
