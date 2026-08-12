import { ResourceName, useMetricNameConfig } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zwatch-alarm-resource";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { AlarmState, AlarmStatus, EmergencyLevel } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO as IZWatchAlarm } from "@zstack/zsphere-types/graphql";
import type { ColumnFilterItem } from "antd/es/table/interface";
import { useIntl } from "react-intl";

import Metrics from "../constant/Metrics.json";

import styles from "./style.module.less";

const alarmWithNoThreshold = [
  "PhysicalNetworkInterface",
  "RaidState",
  "PowerSupply",
  "LoadBalancerBackendStatus",
];

export const getHostPrefix = (metricName?: string) =>
  metricName?.match(/(KVM|XDragon)(.)*(Host)/)?.[1] ?? "";

export interface IProps {
  view?: string;
}

export default ({ view }: IProps = {}) => {
  const intl = useIntl();
  const { currentUser } = usePlatformStore();
  const {
    operatorMap,
    translateResourceType,
    translateAlarmNameByLocale,
    translateThreshold,
    translateMetricName,
    translateEmergencyLevel,
    systemAlarmUuidList,
  } = useMetricNameConfig();
  let namespaceFilters: ColumnFilterItem[] | undefined;
  if (!view?.startsWith("sub.")) {
    const namespaces =
      currentUser?.currentIdentity !== "Admin"
        ? ["ZStack/VM", "ZStack/Image", "ZStack/L3Network"]
        : Object.keys(Metrics);
    namespaceFilters = namespaces.map((item) => {
      return {
        text: translateResourceType(item),
        value: item,
      };
    });
  }
  return useColumnConfig([
    {
      key: "name",
      formatter: ({ name, zhName }: IZWatchAlarm) =>
        translateAlarmNameByLocale(name, zhName),
      render: ({ uuid, name, zhName }: IZWatchAlarm) => {
        const value = translateAlarmNameByLocale(name, zhName);
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ minWidth: 0 }}>
              <ResourceName
                value={value}
                link={{
                  microAppName: "virtualization-monitoring-om",
                  to: "/zwatch-alarm/resource",
                  uuid,
                }}
                isRouterManaged
              />
            </div>
            {systemAlarmUuidList.includes(uuid) && (
              <div style={{ flexShrink: 0 }} className={styles["txt-bubble"]}>
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "namespace",
      formatter: (current: IZWatchAlarm) => {
        if (
          current.namespace === "ZStack/VM" &&
          current?.userTag?.tag === "VRouter"
        ) {
          return translateResourceType("ZStack/VRouter");
        }
        return `${getHostPrefix(current?.metricName)}${translateResourceType(
          current?.namespace || "",
        )}`;
      },
      filters: namespaceFilters,
    },
    {
      key: "metricName",
      formatter: ({
        comparisonOperator,
        namespace = "",
        metricName = "",
        threshold = 0,
        userTag,
      }: any) => {
        const operator =
          operatorMap[comparisonOperator as keyof typeof operatorMap];
        const thresholdLabel = translateThreshold(
          namespace,
          metricName,
          threshold,
        );
        const hideThreshold =
          namespace === "ZStack/MN" ||
          alarmWithNoThreshold.includes(metricName);
        const rule = !hideThreshold ? `${operator}${thresholdLabel}` : "";
        if (namespace === "ZStack/VM" && userTag?.tag === "VRouter") {
          return `${translateMetricName("ZStack/VRouter", metricName)}${rule}`;
        }
        const status = alarmWithNoThreshold.includes(metricName)
          ? intl.formatMessage({ id: "abnormal", defaultMessage: "Abnormal" })
          : "";
        return `${translateMetricName(namespace, metricName)}${rule}${status}`;
      },
    },
    {
      key: "state",
      filterOptions: AlarmState,
    },
    {
      key: "status",
      filterOptions: AlarmStatus,
    },
    {
      key: "emergencyLevel",
      render: (current: IZWatchAlarm) =>
        translateEmergencyLevel(current.emergencyLevel as EmergencyLevel),
      filters: [
        {
          text: translateEmergencyLevel(EmergencyLevel.Emergent),
          value: EmergencyLevel.Emergent,
        },
        {
          text: translateEmergencyLevel(EmergencyLevel.Important),
          value: EmergencyLevel.Important,
        },
        {
          text: translateEmergencyLevel(EmergencyLevel.Normal),
          value: EmergencyLevel.Normal,
        },
      ],
    },
    {
      key: "owner",
      auth: {
        type: "block",
        resource: "zwatch.alarm.resource",
        authKey: "owner",
      },
    },
  ]);
};
