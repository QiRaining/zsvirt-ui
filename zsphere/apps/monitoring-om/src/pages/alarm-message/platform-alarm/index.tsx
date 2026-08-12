import { RadioGroup } from "@zstack/design";
import { useAlarmStore as useStore } from "@zstack/zsphere-platform-store";
import { Op } from "@zstack/zsphere-types";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";
import AlarmMessageList from "zsv_shared/alarm-message/list";

import Chart from "./chart";

import styles from "./style.module.less";

type EmergencyLevel = "Emergent" | "Important" | "Normal";

type EmergencyLevelFilterValue = {
  key: EmergencyLevel;
  label: string;
};

const PlatformAlarm = () => {
  const intl = useIntl();
  const location = useLocation();

  const [visible, setVisible] = React.useState(false);

  const emergencyLevelFilterMap = useMemo<
    Record<EmergencyLevel, EmergencyLevelFilterValue[]>
  >(
    () => ({
      Emergent: [
        {
          key: "Emergent",
          label: intl.formatMessage({
            id: "emergencyLevel.emergent",
            defaultMessage: "Emergent",
          }),
        },
      ],
      Important: [
        {
          key: "Important",
          label: intl.formatMessage({
            id: "emergencyLevel.important",
            defaultMessage: "Major",
          }),
        },
      ],
      Normal: [
        {
          key: "Normal",
          label: intl.formatMessage({
            id: "emergencyLevel.normal",
            defaultMessage: "Info",
          }),
        },
      ],
    }),
    [intl],
  );

  // 从 dashborad 导航，需要从内存设置tablelist 缓存数据，tablelist 缓存数据bug
  React.useEffect(() => {
    const searchData = new URLSearchParams(location.search);
    const emergencyLevel = searchData.get(
      "emergencyLevel",
    ) as EmergencyLevel | null;

    if (emergencyLevel) {
      const nextValue = emergencyLevelFilterMap[emergencyLevel];

      if (nextValue?.length) {
        const views = ["main", "main.unread"];
        views.forEach((view) => {
          const cacheKey = `alarm.message-${view}-search-conditions`;
          const nextSessionData = [
            {
              name: {
                key: "emergencyLevel",
                label: intl.formatMessage({
                  id: "alarm.message.emergencyLevel",
                  defaultMessage: "Severity",
                }),

                type: "multipleSelect",
              },
              type: "fromFilter",
              values: nextValue,
              value: nextValue,
            },
          ];

          sessionStorage.setItem(cacheKey, JSON.stringify(nextSessionData));
        });
      }
    }

    setVisible(true);
  }, [emergencyLevelFilterMap, intl, location.search]);

  if (!visible) {
    return null;
  }
  return (
    <div className={styles.couldPlatform}>
      <Chart />
      <List />
    </div>
  );
};

export default PlatformAlarm;

function List() {
  const intl = useIntl();
  const [view, setView] = useState("main.unread");
  const setResourceType = useStore((state) => state.setResourceType);

  const defaultQuery = useMemo(() => {
    if (view === "main.unread") {
      return {
        conditions: [
          {
            key: "readStatus",
            op: Op.in,
            values: ["false"],
          },
        ],
      };
    }
    return {};
  }, [view]);

  return (
    <>
      <div className={styles["alarm-list-title"]}>
        <RadioGroup
          value={view}
          onValueChange={(value) => {
            setView(value);
            setResourceType("all");
          }}
          variant="outline"
          options={[
            {
              value: "main.unread",
              label: intl.formatMessage({
                id: "alarm.message.radio.button.realtime",
                defaultMessage: "Triggered Alarms",
              }),
            },
            {
              value: "main",
              label: intl.formatMessage({
                id: "alarm.message.radio.button.total",
                defaultMessage: "All Alarms",
              }),
            },
          ]}
        />
      </div>
      <AlarmMessageList key={view} view={view} defaultQuery={defaultQuery} />
    </>
  );
}
