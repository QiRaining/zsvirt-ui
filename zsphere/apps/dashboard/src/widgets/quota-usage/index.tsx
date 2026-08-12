import { gql, useLazyQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { AuthHander, useAuth } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { getPercentageColor } from "@zstack/zsphere-utils";
import { useMount } from "ahooks";
import { find as _find } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import AutoSkeleton from "../../components/auto-skeleton";
import { formatPercentage } from "../../utils";
import useCheckCurrentLogin from "../useCheckCurrentLogin";
import useMetricConfig from "./metric-config";

import style from "./style.module.less";

const queryWidgetQuotaUsage = gql`
  query queryWidgetQuotaUsage($uuid: String!) {
    queryWidgetQuotaUsage(uuid: $uuid) {
      computing {
        name
        used
        total
      }
      storage {
        name
        used
        total
      }
      network {
        name
        used
        total
      }
      other {
        name
        used
        total
      }
    }
  }
`;

interface IQuotaUsageBarProps {
  value: number;
  colorInverse?: boolean;
}
const QuotaUsageBar: React.FC<IQuotaUsageBarProps> = ({
  value,
  colorInverse = false,
}) => {
  const formattedValue = formatPercentage(value);

  return (
    <div className={style.barContainer}>
      {formattedValue[0] > 0 && (
        <div
          className={style.barItem}
          style={{
            width: formattedValue[2],
            background: getPercentageColor(
              formattedValue[0],
              false,
              colorInverse,
            ),
            // background: `repeating-linear-gradient(90deg, ${getPercentageColor(formattedValue[0])}, ${getPercentageColor(formattedValue[0])} 2px, transparent 2px, transparent 4px)`
          }}
        />
      )}
    </div>
  );
};

interface IProps {
  [key: string]: any;
  quotaUsageType: string;
}
const QuotaUsageWidget: React.FC<IProps> = ({ quotaUsageType }) => {
  const { metricConfig } = useMetricConfig();
  const { currentUser } = usePlatformStore();
  const intl = useIntl();
  const { isAccount } = useCheckCurrentLogin();
  const uuid = isAccount ? currentUser?.accountUuid : currentUser?.userUuid;
  const currentResource = _find(metricConfig, { value: quotaUsageType }) || {};

  const [_queryWidgetQuotaUsage, { loading, data }] = useLazyQuery(
    queryWidgetQuotaUsage,
    {
      fetchPolicy: "no-cache",
    },
  );

  useMount(() => {
    _queryWidgetQuotaUsage({
      variables: {
        uuid,
      },
    });
  });

  const list = data?.queryWidgetQuotaUsage[quotaUsageType] || [];

  const formatNoLimit = (str: any) => {
    return str === "-1"
      ? intl.formatMessage({
          id: "noLimit",
          defaultMessage: "Unlimited",
        })
      : str;
  };

  const { hasAuth } = useAuth();
  return (
    <div className={style.container}>
      <AutoSkeleton name={`quota-usage-${quotaUsageType}`} loading={loading}>
        <div className={style.title}>{currentResource.label}</div>
        <div className={style.quotaContainer}>
          {currentResource.resources.map((item: any, i: number) => {
            const currentQuota = _find(list, { name: item.value }) || {};
            const quotaItemDom = (
              <div className={style.quotaItem} key={item.value}>
                <div className={style.quotaItemTitle}>
                  <span className={style.icon}>
                    <Icon type={item.iconType} />
                  </span>
                  {item.label}
                </div>
                <div className={style.quotaItemUsage}>
                  {item.formatter
                    ? item.formatter(currentQuota.used)
                    : currentQuota.used}
                  /
                  {item.formatter && currentQuota.total !== "-1"
                    ? item.formatter(currentQuota.total)
                    : formatNoLimit(currentQuota.total)}
                </div>
                <div className={style.quotaItemBar}>
                  <QuotaUsageBar
                    value={
                      currentQuota.total > 0
                        ? (currentQuota.used / currentQuota.total) * 100
                        : 0
                    }
                    colorInverse={false}
                  />
                </div>
              </div>
            );
            if (item?.auth) {
              return hasAuth(item?.auth) ? (
                <AuthHander key={item.value} {...item?.auth}>
                  {quotaItemDom}
                </AuthHander>
              ) : null;
            }
            return quotaItemDom;
          })}
        </div>
      </AutoSkeleton>
    </div>
  );
};

export default QuotaUsageWidget;
