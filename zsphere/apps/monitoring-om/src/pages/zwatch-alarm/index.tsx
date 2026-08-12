import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { ZWatchAlarmQueryType } from "@zstack/zsphere-types";
import cls from "classnames";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import EventList from "./event/list";
import Header from "./header";
import ResourceList from "./resource";

import style from "./style.module.less";

const ZWatchAlarm: React.FC = () => {
  const intl = useIntl();
  const [routerTabTarget, setRouterTabTarget] = useState<undefined | string>();
  const search = useLocation().search;

  useEffect(() => {
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const { tabs = "platform" } = searchObj;
    if (typeof tabs === "string" && tabs?.includes("storage")) {
      setRouterTabTarget("storage.zwatchalarm");
    }
  }, [search]);

  return (
    <div className={cls("main-list-header-tabs-container", style.main)}>
      <Header />
      <Tabs
        type="line"
        contentId="main-tab"
        routerTarget={routerTabTarget}
        destroyInactiveTabPane={true}
      >
        <TabPane
          tab={intl.formatMessage({
            id: "resourceZwatchAlarm",
            defaultMessage: "Resource Alarm",
          })}
          key="resource.zwatchalarm"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.zwatch.alarm.resource",
          }}
        >
          <ResourceList />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({
            id: "eventZwatchAlarm",
            defaultMessage: "Event Alarm",
          })}
          key="event.zwatchalarm"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.zwatch.alarm.event",
          }}
        >
          <EventList
            view="main.virtualization"
            defaultQuery={{
              type: ZWatchAlarmQueryType.Event,
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ZWatchAlarm;
