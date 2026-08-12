import { Drawer, DrawerHeader, DrawerBody } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import {
  List,
  DraggableCard,
  useMetricNameConfig,
  useAuth,
} from "@zstack/zsphere-components";
import type { ZWatchAlarmVO as IZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import { secToTime } from "@zstack/zsphere-utils";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import Modify from "zsv_shared/zwatch-alarm/resource/action/modify";

import { getHostPrefix } from "../../../../utils";
import Level from "../../../components/level";

interface IProps {
  detail: IZWatchAlarmVO;
  source?: any;
  refetch?: () => void;
}

const operatorMap: any = {
  GreaterThan: ">",
  GreaterThanOrEqualTo: "≥",
  LessThan: "<",
  LessThanOrEqualTo: "≤",
};

const BasicInfo: React.FC<IProps> = ({ detail, source }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);
  const { hasAuth } = useAuth();
  const canEditConfig = hasAuth({
    authKey: "editConfig",
    resource: "zwatch.alarm.resource",
    type: "action",
  });
  const {
    translateResourceType,
    translateMetricName,
    translateThreshold,
    timeMap,
  } = useMetricNameConfig();
  const currentLang = intl.locale;
  const isEn = useMemo(() => currentLang === "en-US", [currentLang]);
  const formatMetricName: Function = () => {
    if (
      detail?.namespace === "ZStack/VM" &&
      detail?.userTag?.tag === "VRouter"
    ) {
      return translateMetricName("ZStack/VRouter", detail?.metricName || "");
    }
    const alarmWithNoThreshold = [
      "PhysicalNetworkInterface",
      "RaidState",
      "PowerSupply",
    ];
    const translatedMetricName = translateMetricName(
      detail?.namespace || "",
      detail?.metricName || "",
    );
    if (alarmWithNoThreshold.includes(detail?.metricName || "")) {
      return (
        translatedMetricName +
        intl.formatMessage({
          id: "abnormal",
          defaultMessage: "Abnormal",
        })
      );
    }
    return translatedMetricName;
  };

  const { getServerTime } = useTime();
  const formatResourceType: Function = () => {
    if (
      detail?.namespace === "ZStack/VM" &&
      detail?.userTag?.tag === "VRouter"
    ) {
      return translateResourceType("ZStack/VRouter");
    }
    return translateResourceType(detail?.namespace || "");
  };
  const hideThreshold =
    detail?.namespace === "ZStack/MN" ||
    [
      "PhysicalNetworkInterface",
      "RaidState",
      "PowerSupply",
      "LoadBalancerBackendStatus",
    ].includes(detail?.metricName || "");
  const formatTime = (s: number) => {
    let result: string = "";
    const time: any = secToTime(s);
    Object.keys(time).forEach((key: string) => {
      if (time[key] > 0) {
        result += `${time[key]}${isEn ? ` ${timeMap[key]}` : timeMap[key]}`;
      }
    });
    return result;
  };

  const [hidePeriod, _setHidePeriod] = useState(false);

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "resourceType",
          defaultMessage: "Resource Type",
        }),
        value: `${getHostPrefix(detail.metricName)}${formatResourceType()}`,
      },
      {
        label: intl.formatMessage({
          id: "alarmLevel",
          defaultMessage: "Severity",
        }),
        value: <Level level={detail?.emergencyLevel || ("Important" as any)} />,
      },
      {
        label: intl.formatMessage({
          id: "alarmEntry",
          defaultMessage: "Metric Item",
        }),
        value: formatMetricName?.(),
      },
      {
        label: intl.formatMessage({
          id: "alarmTriggerRule",
          defaultMessage: "Alarm Trigger Rule",
        }),
        value: (
          <>
            {!hideThreshold && (
              <>
                {operatorMap[detail?.comparisonOperator || ""]}{" "}
                {translateThreshold(
                  detail.namespace!,
                  detail?.metricName || "",
                  detail?.threshold || 0,
                )}{" "}
              </>
            )}{" "}
            {!hidePeriod &&
              (detail?.period !== 0
                ? `
                ${!hideThreshold ? "，" : ""}
                ${intl.formatMessage({
                  id: "sustain",
                  defaultMessage: "lasts",
                })}
                ${formatTime(detail?.period || 60)?.trim()}
              `
                : "")}
          </>
        ),
      },
      {
        label: intl.formatMessage({
          id: "alarm.interval", //
          defaultMessage: "Alarm Interval",
        }),
        value:
          detail?.repeatCount === 1
            ? intl.formatMessage({ id: "onlyOnce", defaultMessage: "Only once" })
            : formatTime(detail?.repeatInterval || 60),
      },
      {
        label: intl.formatMessage({
          id: "alarm.recover.notice",
          defaultMessage: "Alarm Recovery Notification",
        }),
        value: detail?.enableRecovery
          ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
          : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
      {
        label: intl.formatMessage({
          id: "alarm.recover.resource",
          defaultMessage: "Alert Resource Quantity",
        }),
        value: detail?.filteredAlarmResourceCount || 0,
      },
      {
        label: intl.formatMessage({
          id: "noticeObjectCount",
          defaultMessage: "Endpoint Count",
        }),
        value: detail?.topicNum || 0,
      },
    ],
    [detail, intl, getServerTime],
  );

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
        isList
        collapsed={false}
        titleActions={
          canEditConfig
            ? [
                {
                  icon: "edit",
                  tooltip: intl.formatMessage({
                    id: "edit.config",
                    defaultMessage: "Modify Configuration",
                  }),
                  onClick() {
                    setVisible(true);
                  },
                },
              ]
            : []
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      {Modify.displayName === "ErrorFallbackComponent" ? (
        <Drawer open={visible} setOpen={setVisible}>
          <DrawerHeader onClose={() => setVisible(false)}>
            ErrorFallbackComponent
          </DrawerHeader>
          <DrawerBody>
            <Modify />
          </DrawerBody>
        </Drawer>
      ) : (
        <Modify
          visible={visible}
          setVisible={setVisible}
          selectedList={[detail]}
          source={source}
          position="header"
          view="main.virtualization"
        />
      )}
    </>
  );
};

export default BasicInfo;
