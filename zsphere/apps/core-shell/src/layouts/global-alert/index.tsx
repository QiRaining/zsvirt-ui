import React, { memo, useMemo } from "react";

import AlertSwitch from "./alert-switch";
import useHttpsCertAlert from "./use-https-cert-alert";
import { useLicenseAlertText } from "./use-license-alert";

import style from "./style.module.less";

const VirtualizationGlobalAlert: React.FC = () => {
  const { licenseAlerts } = useLicenseAlertText();
  const { certAlerts } = useHttpsCertAlert();

  const alerts = useMemo(
    () => [...licenseAlerts, ...certAlerts],
    [licenseAlerts, certAlerts],
  );

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={style.licenseBanner}>
      <AlertSwitch messages={alerts} />
    </div>
  );
};

export default memo(VirtualizationGlobalAlert);
