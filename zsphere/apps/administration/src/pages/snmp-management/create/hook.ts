import { useValidator } from "@zstack/zsphere-hooks";
import type { IntlShape } from "react-intl";

export const useCommonInputRules = (
  intl: IntlShape,
  type: "authPassword" | "encryptionPassword" | "readCommunity",
) => {
  const { commonRegexChecker, isRequired, lengthRange } = useValidator(intl);
  // ()`!@#$%^&*_\\-+=|{}\\[\\]:;'<>,.?/
  // ~`@#%&<>"',;_-^$.*+?=!:|{}()[]/\
  const validateRegexp = /^[a-zA-Z0-9~`@#%&<>"',;_^$.*+?=!:|{}()[\]/\\-]+$/;
  switch (type) {
    case "authPassword":
      return [
        isRequired(),
        lengthRange(8, 32),
        commonRegexChecker(
          validateRegexp,
          intl.formatMessage({
            id: "authentication.password",
            defaultMessage: "Password",
          }),
        ),
      ];
    case "encryptionPassword":
      return [
        isRequired(),
        lengthRange(8, 32),
        commonRegexChecker(
          validateRegexp,
          intl.formatMessage({
            id: "encryption.password",
            defaultMessage: "Password",
          }),
        ),
      ];
    case "readCommunity":
      return [
        isRequired(),
        lengthRange(1, 32),
        commonRegexChecker(
          validateRegexp,
          intl.formatMessage({
            id: "snmp.agent.readCommunity",
            defaultMessage: "Community String",
          }),
        ),
      ];
    default:
      return [];
  }
};
