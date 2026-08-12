import { Tag, Tooltip } from "@zstack/design";
import { UIExtendedLicenseType } from "@zstack/zsphere-types";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { getExpiredAndNowDayGap } from "../helper";

import style from "./style.module.less";

export const useLicenseInfo = () => {
  const intl = useIntl();

  const getWarningInfoEle = (licenseInfo: any) => {
    const expiredAndNowDayGap = _.ceil(
      getExpiredAndNowDayGap(licenseInfo?.expiredDate),
    );

    const isExpired = licenseInfo?.expired || expiredAndNowDayGap <= 0;

    if (
      licenseInfo?.licenseType === "Community" ||
      (expiredAndNowDayGap > 15 && !isExpired)
    ) {
      return (
        <Tag className={style["ant-tag-valid"]}>
          {intl.formatMessage({ id: "valid", defaultMessage: "Valid" })}
        </Tag>
      );
    }

    if (expiredAndNowDayGap > 0 && expiredAndNowDayGap <= 15 && !isExpired) {
      const text = intl.formatMessage(
        {
          id: "count.daysLaterWillExpire",
          defaultMessage: "Expires after {count} days",
        },
        {
          count: expiredAndNowDayGap,
        },
      );
      return (
        <Tooltip placement="topLeft" title={text}>
          <Tag className={style["ant-tag-willinvalid"]}>{text}</Tag>
        </Tooltip>
      );
    }

    if (
      expiredAndNowDayGap === 0 &&
      !isExpired &&
      licenseInfo.licenseType !== UIExtendedLicenseType.Community
    ) {
      return (
        <Tooltip
          placement="topLeft"
          title={intl.formatMessage({
            id: "expiredWithinOneDay",
            defaultMessage: "Expires in 1 day",
          })}
        >
          <Tag className={style["ant-tag-willinvalid"]}>
            {intl.formatMessage({
              id: "expiredWithinOneDay",
              defaultMessage: "Expires in 1 day",
            })}
          </Tag>
        </Tooltip>
      );
    }
    return (
      isExpired && (
        <Tag className={style["ant-tag-invalid"]}>
          {intl.formatMessage({ id: "hasExpired", defaultMessage: "Expired" })}
        </Tag>
      )
    );
  };

  return getWarningInfoEle;
};
