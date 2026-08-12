import { useAuth } from "@zstack/zsphere-components";
import { Tabs } from "antd";
import cls from "classnames";
import React, { memo, useMemo } from "react";
import PlatformAlarmMessageList from "zsv_shared/alarm-message/list";
import OperationList from "zsv_shared/operation-log/list/wrapper";

import { AlarmMessageContent, AlarmMessageTab } from "../alarm-message";
import { TAB_KEYS } from "../constants";
import type { TabControllerRefs } from "../types";
import OperationTab from "./operation-tab";

import style from "../style.module.less";

interface AlarmTabsProps {
  currentTab: string;
  visible: boolean;
  operationNum: number | null;
  platformAlarmMessageDefaultQuery: any;
  tabBarLeftExtraContent: React.ReactNode;
  tabBarRightExtraContent: React.ReactNode;
  controllerRefs: TabControllerRefs;
  onTabChange: (key: string) => void;
  onExpand: (targetTab?: string) => void;
  resizing?: boolean;
}

const MessageTabs: React.FC<AlarmTabsProps> = memo(
  ({
    currentTab: _currentTab,
    visible,
    operationNum,
    tabBarLeftExtraContent,
    tabBarRightExtraContent,
    platformAlarmMessageDefaultQuery,
    controllerRefs,
    onTabChange,
    onExpand,
    resizing,
  }) => {
    const { hasAuth } = useAuth();

    const hasOperationLogAuth = hasAuth({
      type: "view",
      authKey: "list",
      resource: "virtualization.task",
    });

    const hasAlarmMessageAuth = hasAuth({
      type: "view",
      authKey: "list",
      resource: "virtualization.alarm.message",
    });

    const handleTabChange = (key: string) => {
      onTabChange(key);
    };
    const handleTabClick = (key: string) => {
      if (!visible) {
        onExpand(key);
      }
    };

    // 创建 Tabs items 数组以适配新版本 Ant Design Tabs API
    const tabsItems = useMemo(() => {
      const items = [];

      // 操作日志标签页
      if (hasOperationLogAuth) {
        items.push({
          label: <OperationTab operationNum={operationNum} />,
          key: TAB_KEYS.OPERATION_LOG,
          forceRender: true,
          children: <OperationList />,
        });
      }

      // 告警消息标签页
      if (hasAlarmMessageAuth) {
        items.push({
          label: (
            <AlarmMessageTab
              listController={controllerRefs.alarmListControllerRef}
            />
          ),
          key: TAB_KEYS.ALARM_MESSAGE,
          forceRender: true,
          children: (
            <AlarmMessageContent>
              <PlatformAlarmMessageList
                view="virtualization.global.list"
                isLayoutList
                className={style.tableListWrap}
                controller={controllerRefs.alarmListControllerRef}
                defaultQuery={platformAlarmMessageDefaultQuery}
                beforeQuery={(query) => ({
                  ...query,
                  start: platformAlarmMessageDefaultQuery.start,
                  limit: platformAlarmMessageDefaultQuery.limit,
                })}
              />
            </AlarmMessageContent>
          ),
        });
      }

      return items;
    }, [
      hasOperationLogAuth,
      hasAlarmMessageAuth,
      operationNum,
      controllerRefs,
      platformAlarmMessageDefaultQuery,
    ]);

    return (
      <Tabs
        className={cls(style["tab-container"], {
          [style["tab-container-resizing-active"]]: resizing,
        })}
        onChange={handleTabChange}
        onTabClick={handleTabClick}
        tabBarExtraContent={{
          left: tabBarLeftExtraContent,
          right: tabBarRightExtraContent,
        }}
        items={tabsItems}
      />
    );
  },
);

MessageTabs.displayName = "MessageTabs";

export default MessageTabs;
