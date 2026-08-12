import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import LicenseAlertMessage from "./license-alert-message";

export type LicenseAlertProps = {
  id: string;
  message: React.ReactNode;
  type: "error" | "info" | "warning";
  /** 用于alert排序 */
  priority: number;
  /** 是否支持关闭 */
  closable?: boolean;
  /** 是否显示 更新按钮 */
  showGoUpdateBtn?: boolean;
};

export function useLicenseAlertText() {
  const intl = useIntl();

  const licenseAlerts = useMemo(
    () => [
      {
        id: "community-license",
        type: "warning",
        priority: 3,
        closable: true,
        message: (
          <LicenseAlertMessage type="warning">
            {intl.formatMessage({
              id: "global.alert.warning.community.license",
              defaultMessage:
                "You are currently on the open-source version (no technical support included). Upgrade to Enterprise Edition for full technical support and service assurance",
            })}
          </LicenseAlertMessage>
        ),
      } satisfies LicenseAlertProps,
    ],
    [intl],
  );

  return { licenseAlerts };
}
