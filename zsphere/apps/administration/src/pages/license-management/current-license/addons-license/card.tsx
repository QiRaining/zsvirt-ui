import { useTime } from "@zstack/hooks";
import { Icon, type IconTypes } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { Auth, Field, State } from "@zstack/zsphere-components";
import { Spinner } from "@zstack/zsphere-design-biz";
import { LicenseQuotaType } from "@zstack/zsphere-types";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import { Progress } from "antd";
import * as _ from "lodash-es";
import { ceil, round } from "lodash-es";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import CONSTANT from "../../constant";
import { getExpiredAndNowDayGap, isShowForever } from "../../helper";
import {
  LicenseModuleNameType,
  translateLicenseModuleName,
} from "../../translate";
import ExceptionIcon from "./exception-icon";
import ModuleAuthorizationDetailsModal from "./module-authorization-details-modal";

import style from "./style.module.less";

const STYLE_DISPLAY_FLEX = { display: "flex" } as const;

interface IProps {
  props: any;
  deleteCallback: any;
  loading?: boolean;
  deleteIconShow?: boolean;
}

interface IStatus {
  disable: boolean;
  expired: boolean;
  isShowWarning: boolean;
  isIntraday: boolean;
  modules: string[];

  availableVmNum?: number | undefined | null;
}

const { addon_licenses } = CONSTANT;

// 异常提示信息映射
const EXCEPTION_TOOLTIP_MAP: {
  [key: string]: { id: string; defaultMessage: string };
} = {
  "disaster-recovery": {
    id: "disaster.recovery.addon.state.exception.tooltip",
    defaultMessage: "Backup quota exhausted. Purchase plus license to increase quota.",
  },
  default: {
    id: "addon.license.quota.exceeded",
    defaultMessage: "The available quota for this license has been exceeded.",
  },
};

export function getTooltip(option?: any, title?: any): any {
  if (!option || !Object.keys(option).length) {
    return {
      title: "",
      visible: false,
    };
  }

  if (option === true && title) {
    return { title };
  }

  return {
    title: option,
  };
}

const AddonsCard: React.FC<IProps> = ({
  props,
  deleteCallback,
  loading = false,
  deleteIconShow = true,
}) => {
  const intl = useIntl();
  const [moduleDetailVisible, setModuleDetailVisible] = useState(false);

  const { getServerTime } = useTime();

  const getStatus = (params: IStatus) => {
    const { disable, expired, isIntraday, isShowWarning } = params;
    //未激活状态， 不能与过期时间共同展示
    if (disable && !isShowWarning && !isIntraday) {
      return (
        <State
          prefix="dot"
          type="disabled"
          name={intl.formatMessage({
            id: "notActive",
            defaultMessage: "Inactivated",
          })}
        />
      );
    }
    //已激活分为：已过期，有效
    if (!disable && !isShowWarning && !isIntraday) {
      return (
        <State
          prefix="dot"
          type={expired ? "error" : "success"}
          name={
            expired
              ? intl.formatMessage({
                  id: "hasExpired",
                  defaultMessage: "Expired",
                })
              : intl.formatMessage({ id: "valid", defaultMessage: "Valid" })
          }
        />
      );
    }
  };

  const showException =
    props?.exception ||
    (!props.disable &&
      !props.expired &&
      ["disaster-recovery", "baremetal"].includes(props.modules?.[0]) &&
      _.isNumber(props.usage?.quota) &&
      props.usage.used > props.usage.quota);

  const expiredAndNowDayGap = ceil(getExpiredAndNowDayGap(props?.expiredDate));
  const expiredGap = [
    LicenseModuleNameType.Service5x8,
    LicenseModuleNameType.Service7x24,
  ].includes(props?.modules?.[0])
    ? 30
    : 15;
  const roundDayGap = round(expiredAndNowDayGap);
  const isShowWarning =
    roundDayGap > 1 && roundDayGap <= expiredGap && !props?.expired;
  const isIntraday =
    expiredAndNowDayGap > 0 && expiredAndNowDayGap <= 1 && !props?.expired;

  const getExtraInfo = (params: any) => {
    const { modules = [], usage: { used = 0, quota = 0, quotaType } = {} } =
      params;
    const percent = quota > 0 ? (used / quota) * 100 : 0;
    const format = () => `${used}/${quota}`;
    return (
      <>
        {quotaType === LicenseQuotaType.Host && quota > 0 ? (
          <Field
            label={intl.formatMessage({
              id: "authorizedHostCount",
              defaultMessage: "Licensed Hosts",
            })}
          >
            <Progress
              size="small"
              status="normal"
              percent={percent}
              format={format}
            />
          </Field>
        ) : null}

        {quotaType === LicenseQuotaType.CPUCore && quota > 0 ? (
          <Field
            label={intl.formatMessage({
              id: "authorizedCpuCoreCount",
              defaultMessage: "Licensed CPU Cores",
            })}
          >
            <Progress
              size="small"
              status="normal"
              percent={percent}
              format={format}
            />
          </Field>
        ) : null}

        {quotaType === LicenseQuotaType.CPUSocket && quota > 0 ? (
          <Field
            label={intl.formatMessage({
              id: "authorizedCpuSlotCount",
              defaultMessage: "Licensed CPUs",
            })}
          >
            <Progress
              size="small"
              status="normal"
              percent={percent}
              format={format}
            />
          </Field>
        ) : null}
        {
          //单独灾备服务模块，老用户升级上来后出现无限制的字段
          modules.includes("disaster-recovery") ? (
            <Field
              label={intl.formatMessage({
                id: "authorizedVmCount",
                defaultMessage: "Licensed VMs",
              })}
            >
              {quota >= 9999 ? (
                intl.formatMessage({
                  id: "unlimited",
                  defaultMessage: "Unlimited",
                })
              ) : (
                <Progress
                  size="small"
                  status="normal"
                  percent={percent}
                  format={format}
                />
              )}
            </Field>
          ) : quotaType === LicenseQuotaType.VM && quota > 0 ? (
            <Field
              label={intl.formatMessage({
                id: "authorizedVmCount",
                defaultMessage: "Licensed VMs",
              })}
            >
              <Progress
                size="small"
                status="normal"
                percent={percent}
                format={format}
              />
            </Field>
          ) : null
        }
        {quotaType === LicenseQuotaType.Capacity && (quota > 0 || used > 0) && (
          <Field
            label={intl.formatMessage({
              defaultMessage: "Authorized Capacity",
              id: "authorizedCapacity",
            })}
          >
            <Progress
              size="small"
              status="normal"
              percent={percent}
              format={() =>
                `${formatBytesToSize(used)}/${formatBytesToSize(quota)}`
              }
            />
          </Field>
        )}
      </>
    );
  };

  const licenseName = useMemo(() => {
    return translateLicenseModuleName(
      intl,
      props?.modules?.[0] as LicenseModuleNameType,
    );
  }, [intl, props]);

  const xdaysLaterWillExpireText = useMemo(() => {
    return intl.formatMessage(
      {
        id: "count.daysLaterWillExpire",
        defaultMessage: "Expires after {count} days",
      },
      {
        count: roundDayGap,
      },
    );
  }, [intl, roundDayGap]);

  const expiredWithinOneDayText = useMemo(() => {
    return intl.formatMessage({
      id: "expiredWithinOneDay",
      defaultMessage: "Expires in 1 day",
    });
  }, [intl]);

  const getAddOnsIconType = (addOnsName: string): IconTypes | undefined => {
    const iconType = addon_licenses.filter(
      (t: any) => t.modules?.[0] === addOnsName,
    )?.[0]?.icon as IconTypes;

    return iconType;
  };

  const handleDeleteClick = useCallback(() => {
    deleteCallback([props]);
  }, [deleteCallback, props]);

  const handleDeleteIconClick = useCallback(() => {
    handleDeleteClick();
  }, [handleDeleteClick]);

  const handleModuleDetailClick = useCallback(() => {
    setModuleDetailVisible(true);
  }, []);

  return JSON.stringify(props) === "{}" ? (
    <div className={style["card-unset"]} />
  ) : (
    <div
      className={cn(style.card, loading && style["card-loading"])}
      id={props?.modules?.[0]}
    >
      <div className={style.header}>
        <div className={style.left}>
          <div className={style.logo}>
            <Icon type={getAddOnsIconType(props.modules?.[0]) ?? "info"} />
          </div>
          <div className={style.title}>
            <span>{licenseName}</span>
          </div>

          <ExceptionIcon
            show={showException}
            tooltipTitle={intl.formatMessage(
              EXCEPTION_TOOLTIP_MAP[props?.modules?.[0]] ||
                EXCEPTION_TOOLTIP_MAP.default,
            )}
          />
        </div>
        {props?.modules?.[0] === "zmigrate" && (
          <button
            type="button"
            className={style["auth-detail-link"]}
            onClick={handleModuleDetailClick}
          >
            {intl.formatMessage({
              id: "authorization.details",
              defaultMessage: "Authorization Details",
            })}
          </button>
        )}
        {!props?.disable || deleteIconShow ? (
          <div className={style.right}>
            <div
              className={style["delete-icon"]}
              id={`delete-${props?.modules?.[0]}`}
            >
              <Auth resource="license" type="block" authKey="action.delete">
                <Icon type="trash" onClick={handleDeleteIconClick} />
              </Auth>
            </div>
          </div>
        ) : null}
      </div>

      <div className={style.divider} />

      <div className={style.regular}>
        <Field
          label={intl.formatMessage({
            id: "license.status",
            defaultMessage: "License Status",
          })}
        >
          <div style={STYLE_DISPLAY_FLEX}>
            <div className={style.status}>
              {getStatus({ ...props, isShowWarning, isIntraday })}
            </div>
            {isShowWarning && (
              <State
                prefix="dot"
                type="warning"
                name={xdaysLaterWillExpireText}
              />
            )}
            {isIntraday && (
              <State
                prefix="dot"
                type="warning"
                name={expiredWithinOneDayText}
              />
            )}
          </div>
        </Field>

        {getExtraInfo(props)}

        <Field
          label={intl.formatMessage({
            id: "issuedDate",
            defaultMessage: "Issued on",
          })}
        >
          {getServerTime(props?.issuedDate).format("YYYY-MM-DD HH:mm:ss")}
        </Field>
        <Field
          label={intl.formatMessage({
            id: "expiredDate",
            defaultMessage: "Expires on",
          })}
        >
          {isShowForever(props?.expiredDate, props?.issuedDate, props?.expired)
            ? intl.formatMessage({
                id: "permanentValidity",
                defaultMessage: "Perpetual",
              })
            : getServerTime(props?.expiredDate).format("YYYY-MM-DD HH:mm:ss")}
        </Field>
      </div>
      <ModuleAuthorizationDetailsModal
        visible={moduleDetailVisible}
        setVisible={setModuleDetailVisible}
        addonData={props}
      />
      {loading && (
        <div className={style["card-loading-mask"]}>
          <Spinner spinning />
        </div>
      )}
    </div>
  );
};

export default AddonsCard;
