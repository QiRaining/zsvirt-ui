import { Divider } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Field } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { isShowForever } from "../../helper";
import { genLicenseName } from "../../translate";
import type { USBData } from "../types";
import { useLicenseInfo } from "../useLicenseInfo";
import { formatUkeyStatus } from "../utils";

import style from "./style.module.less";

const STYLE_LICENSE_ICON = { width: 60, height: 80 } as const;
const EMPTY_LICENSE_INFO = {};

interface IProps {
  isOem: boolean;
  themeConfig: any;
  usbData: USBData[];
  isZMigrate: boolean;
  licenseData: any;
}

const MainLicense: React.FC<IProps> = ({
  licenseData,
  isOem,
  themeConfig,
  usbData,
}) => {
  const intl = useIntl();
  const isBootstrap = usePlatformStore((state) => state.isBootstrap);
  const { getServerTime } = useTime();
  const getWarningInfoEle = useLicenseInfo();

  const getUkeyStatus = formatUkeyStatus(usbData);

  const licenseInfo = licenseData?.getAboutLicenseInfo ?? EMPTY_LICENSE_INFO;

  const memoLicenseType = useMemo(() => {
    //先判断OEM
    if (isOem && themeConfig?.versonName) {
      return themeConfig?.versonName;
    }
    //有LicenseType
    if (licenseInfo?.licenseType) {
      return genLicenseName(intl, licenseInfo);
    }
  }, [intl, isOem, licenseInfo, themeConfig]);

  const memoLicenseVersion = useMemo(() => {
    if (isOem && themeConfig?.versonNumber) {
      return themeConfig?.versonNumber;
    }
    // 检测cube环境，如果是cube环境则显示v2.4.10.x格式
    if (isBootstrap) {
      return `v2.${licenseInfo?.versionOnUI}`;
    }

    return licenseInfo?.versionOnUI;
  }, [isBootstrap, isOem, licenseInfo, themeConfig]);

  const getLeftCardStyle = useMemo(() => {
    if (usbData.length !== 0) {
      if (getUkeyStatus === "Ready") {
        return style["banner-left-card-ukeyReady"];
      }
      return style["banner-left-card"];
    }

    return style["banner-left-card-withoutUK"];
  }, [usbData, getUkeyStatus]);

  return (
    <div className={style.container}>
      <div className={style["banner-left"]}>
        <div className={getLeftCardStyle}>
          <div className={style.logo}>
            <img
              style={STYLE_LICENSE_ICON}
              alt="license-icon"
              src={require("../../../assets/images/zsphere-license.svg?inline")}
            />
          </div>
          <div className={style.title}>
            <span>{memoLicenseType}</span>
          </div>
          <Divider dashed className={style.divider} />
          <div className={style["status-content"]}>
            <Field
              label={intl.formatMessage({
                id: "license.status",
                defaultMessage: "License Status",
              })}
            >
              {getWarningInfoEle(licenseInfo)}
            </Field>
            <Field
              label={intl.formatMessage({
                id: "expiredDate",
                defaultMessage: "Expires on",
              })}
            >
              {isShowForever(
                licenseInfo?.expiredDate,
                licenseInfo?.issuedDate,
                licenseInfo?.expired,
              )
                ? intl.formatMessage({
                    id: "permanentValidity",
                    defaultMessage: "Perpetual",
                  })
                : licenseInfo?.expiredDate &&
                  getServerTime(licenseInfo?.expiredDate).format(
                    "YYYY-MM-DD HH:mm:ss",
                  )}
            </Field>
            <Field
              label={intl.formatMessage({
                id: "version",
                defaultMessage: "Version",
              })}
            >
              {memoLicenseVersion}
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLicense;
