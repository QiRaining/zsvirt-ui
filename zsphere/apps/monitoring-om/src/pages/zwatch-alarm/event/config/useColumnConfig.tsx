import {
  ResourceName,
  Tag,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import type { IOption } from "@zstack/zsphere-engine/src/zwatch-alarm-event/useColumnConfig";
import useColumnConfig from "@zstack/zsphere-engine/src/zwatch-alarm-event/useColumnConfig";
import { AlarmState, EmergencyLevel } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO as IZWatchAlarm } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import Events from "../constant/Events.json";

import styles from "./style.module.less";

export default () => {
  const intl = useIntl();
  const {
    translateEventName,
    translateEventType,
    translateEmergencyLevel,
    systemAlarmUuidList,
  } = useMetricNameConfig();
  const options: IOption<IZWatchAlarm> = [
    {
      key: "eventName",
      formatter: (current: IZWatchAlarm) => {
        const name = translateEventName(
          current.namespace,
          current.eventName ?? "",
        );
        return name;
      },
      render: ({ uuid, eventName, namespace }: IZWatchAlarm) => {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ minWidth: 0 }}>
              <ResourceName
                value={translateEventName(namespace, eventName ?? "")}
                link={{
                  uuid,
                  microAppName: "virtualization-monitoring-om",
                  to: "/zwatch-alarm/event",
                  onClick: (e) => {
                    const window = (e.target as HTMLElement)?.ownerDocument
                      ?.defaultView;
                    if (window) {
                      window.needClearTab = false;
                    }
                  },
                }}
              />
            </div>
            {systemAlarmUuidList.includes(uuid) && (
              <div style={{ margin: "-1px -2px -1px 8px" }}>
                <Tag round level="weak" className={styles.tag}>
                  {intl.formatMessage({
                    id: "default",
                    defaultMessage: "Default",
                  })}
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "namespace",
      formatter: (current: IZWatchAlarm) =>
        translateEventType(current.namespace ?? ""),
      filters: Object.keys(Events)
        .concat(["ZStack/HA"])
        .map((item) => {
          return {
            text: translateEventType(item),
            value: item,
          };
        }),
    },
    {
      key: "emergencyLevel",
      formatter: (current) =>
        translateEmergencyLevel(current.emergencyLevel as EmergencyLevel),
    },
    {
      key: "emergencyLevel",
      formatter: (current) =>
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
      key: "state",
      filterOptions: AlarmState,
    },
    {
      key: "owner",
      auth: {
        type: "block",
        resource: "zwatch.alarm.event",
        authKey: "owner",
      },
    },
  ];
  return useColumnConfig(options);
};
