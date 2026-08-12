import { Alert } from "@zstack/design";
import { LicenseQuotaType } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

// import LicenseAlert from '../../alert'
import style from "../style.module.less";

interface IProps {
  licenseData: any;
}

const Alerts: React.FC<IProps> = ({ licenseData }) => {
  const intl = useIntl();

  const licenseInfo = licenseData?.getAboutLicenseInfo ?? {};

  const { used = 0, quota = 0, quotaType } = licenseInfo?.usage ?? {};

  return (
    <>
      {/*, 2023/10/19*/}
      {/* <LicenseAlert currentUser={currentUser} /> */}
      {quotaType === LicenseQuotaType.CPUCore && used > quota && (
        <Alert className={style.alert} closable variant="danger">
          {intl.formatMessage({
            id: "license.tabs.alert.danger.license.notification.CPUCore",
            defaultMessage:
              "The number of used CPU cores exceeds license quota. Most platform functions are now restricted. Update your license to expand capacity and restore full access.",
          })}
        </Alert>
      )}

      {quotaType === LicenseQuotaType.CPUSocket && used > quota && (
        <Alert className={style.alert} closable variant="danger">
          {intl.formatMessage({
            id: "license.tabs.alert.danger.license.notification.CPUSocket",
            defaultMessage:
              "The number of used CPU sockets exceeds license quota. Most platform functions are now restricted. Update your license to expand capacity and restore full access.",
          })}
        </Alert>
      )}

      {quotaType === LicenseQuotaType.Host && used > quota && (
        <Alert className={style.alert} closable variant="danger">
          {intl.formatMessage({
            id: "global.alert.danger.license.notification.hosttype",
            defaultMessage:
              "The number of used hosts exceeds the authorized quota. Most features of the Cloud become unavailable. To ensure your business continuity, we recommend that you update your license to expand the capacity.",
          })}
        </Alert>
      )}
      {quotaType === LicenseQuotaType.VM && used > quota && (
        <Alert className={style.alert} closable variant="danger">
          {intl.formatMessage({
            id: "global.alert.danger.license.notification.vmtype",
            defaultMessage:
              "The number of used VMs exceeds the authorized quota. Most features of the platform become unavailable. To ensure your business continuity, we recommend that you update your license to expand the capacity.",
          })}
        </Alert>
      )}
    </>
  );
};

export default Alerts;
