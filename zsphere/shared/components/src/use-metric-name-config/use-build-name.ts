import { AlarmStatus, ComparisonOperator } from "@zstack/zsphere-types";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";
import { parseNumber } from "@zstack/zsphere-utils";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import useMetricNameConfig from "./index";

const comparisonOperatorReverseMap = {
  [ComparisonOperator.GreaterThan]: ComparisonOperator.LessThanOrEqualTo,
  [ComparisonOperator.LessThan]: ComparisonOperator.GreaterThanOrEqualTo,
  [ComparisonOperator.GreaterThanOrEqualTo]: ComparisonOperator.LessThan,
  [ComparisonOperator.LessThanOrEqualTo]: ComparisonOperator.GreaterThan,
};

// 第一个参数控制消息内容是否带有资源名称，第二个参数控制是否带持续时间的后缀
const initUseBuildName = (
  isMessage: boolean,
  isTriggerAction: boolean = false,
  showRecover: boolean = false,
) => {
  const useBuildName = () => {
    const intl = useIntl();
    const {
      translateMetricName,
      translateEventName,
      translateMetricLabels,
      translatePeriod,
    } = useMetricNameConfig();

    const buildName = useCallback(
      (val: AlarmHistories) => {
        const alarmWithNoCondtion = [
          "DbFencerIpReachable",
          "TimeNeededToSyncDB",
        ];
        const alarmWithNoThreshold = [
          "PhysicalNetworkInterface",
          "RaidState",
          "PowerSupply",
          "LoadBalancerBackendStatus",
        ];
        const {
          type,
          namespace,
          metricName,
          name,
          threshold,
          period,
          comparisonOperator,
          resourceName = "",
          alarmStatus,
        } = val;
        const withRecoverPrefix = (content: string) =>
          alarmStatus === AlarmStatus.OK && showRecover
            ? `${intl.formatMessage({
                id: "reourceAlreadyRecover",
                defaultMessage: "Resource Recovered",
              })} ${content}`
            : content;

        const pre =
          type === "alarm"
            ? translateMetricName(
                namespace!,
                metricName!,
                isMessage ? resourceName : undefined,
              )
            : translateEventName(namespace!, name!);

        if (alarmWithNoCondtion.includes(metricName!)) {
          return withRecoverPrefix(pre);
        }
        if (alarmWithNoThreshold.includes(metricName!)) {
          const statusStr =
            alarmStatus === AlarmStatus.OK
              ? intl.formatMessage({
                  id: "alreadyRecover",
                  defaultMessage: "Recovered",
                })
              : intl.formatMessage({
                  id: "abnormal",
                  defaultMessage: "Abnormal",
                });
          return withRecoverPrefix(pre + statusStr);
        }
        if (!comparisonOperator) {
          return withRecoverPrefix(pre);
        }
        let _comparisonOperator = comparisonOperator! as ComparisonOperator;
        if (alarmStatus === AlarmStatus.OK) {
          _comparisonOperator =
            comparisonOperatorReverseMap[
              comparisonOperator! as ComparisonOperator
            ];
        }

        // 适配推送消息带单位。例：1KB、70%，只有容量需要转换单位，即只需处理[K/M/T]B的场景。
        const unit = threshold?.match(/(\w)B/)?.[1];
        const _threshold = unit
          ? parseNumber(parseFloat(threshold!), unit)
          : parseFloat(threshold!);
        const operation = translateMetricLabels(
          namespace!,
          metricName!,
          _threshold,
          undefined!,
          _comparisonOperator,
        );

        if (isTriggerAction && period && translatePeriod(Number(period))) {
          return withRecoverPrefix(
            `${pre}${operation}，${intl.formatMessage(
              { id: "duration.$time", defaultMessage: "lasts{time}" },
              { time: translatePeriod(Number(period)) },
            )}`,
          );
        }

        return withRecoverPrefix(pre + operation);
      },
      [intl],
    );

    return buildName;
  };
  return useBuildName;
};

export const useBuildName = initUseBuildName(true, false, true);
export const useBuildSimpleName = initUseBuildName(false, false, true);
export const useBuildTriggerName = initUseBuildName(false, false, true);
export const useBuildTriggerActionName = initUseBuildName(false, true, true);
