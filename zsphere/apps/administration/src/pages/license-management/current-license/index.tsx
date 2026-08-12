import React from "react";

import AddonsLicense from "./addons-license";
import Alerts from "./alerts";
import MainLicense from "./main-license";
import type { USBData } from "./types";

import style from "./style.module.less";

interface IProps {
  isOem: boolean;
  themeConfig: any;
  isZMigrate: boolean;
  usbData: USBData[];
  licenseData: any;
  addOnsData: any;
  licenseInfo: any;
  addOnsLoading: boolean;
  refetch: any;
}

const CurrentLicense: React.FC<IProps> = ({
  isOem,
  isZMigrate,
  addOnsLoading,
  addOnsData,
  refetch,
  usbData,
  licenseData,
  licenseInfo,
  themeConfig,
}) => {
  return (
    <div className={style.currentLicense}>
      <Alerts licenseData={licenseData} />
      <MainLicense
        licenseData={licenseData}
        usbData={usbData}
        isZMigrate={isZMigrate}
        isOem={isOem}
        themeConfig={themeConfig}
      />
      <AddonsLicense
        addOnsData={addOnsData}
        licenseInfo={licenseInfo}
        refetch={refetch}
        loading={addOnsLoading}
      />
    </div>
  );
};

export default CurrentLicense;
