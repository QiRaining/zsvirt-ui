import { Tabs2 as Tabs, TabPane2 as TabPane } from "@zstack/zsphere-components";
import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";

import Header from "./header";
import PlatformAlarm from "./platform-alarm";

import style from "./style.module.less";

const ZWatchAlarmMessage: React.FC = () => {
  const intl = useIntl();

  return (
    <div
      className={cls(
        style.container,
        "main-list-header-tabs-container",
        "main-list",
      )}
    >
      <Header />
      <Tabs type="line" destroyInactiveTabPane contentId="main-tab">
        <TabPane
          tab={intl.formatMessage({
            id: "platformAlarmMessage",
            defaultMessage: "Platform Alarms",
          })}
          key="platformAlarmMessage"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.zwatch.alarm.platform.message",
          }}
        >
          <PlatformAlarm />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ZWatchAlarmMessage;
