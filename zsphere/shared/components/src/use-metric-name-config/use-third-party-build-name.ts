import { ThirdPartyAlerts } from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import useThirdPartyConfig from "./use-third-party-config";

// 定义需要特殊处理的trigger_value常量
const SPECIAL_TRIGGER_VALUES = [
  "external-xsubhealth-external-xsubhealth-event",
  "external-xsubhealth-network-subhealth",
  "network-address-network-subhealth-v2",
  "network-address-network-subhealth-v2-recovery",
] as const;

export const useThirdPartyBuildName = () => {
  const intl = useIntl();
  const { translateName, translateDependency } = useThirdPartyConfig();

  const buildName = useCallback(
    (message: ThirdPartyAlerts) => {
      const messageOrigin = JSON.parse(message?.sourceText ?? "{}");
      const {
        type,
        trigger_mode,
        resource_type,
        resource_name,
        alert_value,
        trigger_value,
      } = messageOrigin;
      let str = "";

      str = translateName(resource_type) || `${resource_type} `;
      if (resource_name)
        str += resource_name === "ZSTACK-V6" ? "ZCEX" : resource_name;

      if (SPECIAL_TRIGGER_VALUES.includes(trigger_value)) {
        return translateName(alert_value);
      }

      if (
        ["event", "connection-status"].includes(type) ||
        trigger_mode === "eq"
      ) {
        str += translateName(alert_value || type);
        if (type === "osd-unable-to-reach") {
          str += translateDependency(trigger_value, type);
        }
      } else {
        str += translateName(type);
        str += translateName(trigger_mode);
        str += translateDependency(trigger_value, type);
      }

      return str;
    },
    [intl],
  );

  return buildName;
};
