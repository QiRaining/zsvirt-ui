import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";
import MigrationActivityList from "zsv_shared/migration-activity/list";

import HaLog from "./ha-log";
import Header from "./header";
import History from "./history";

import style from "./style.module.less";

interface IProps {
  type?: "completed" | "running";
}

const OperationLog: React.FC<IProps> = ({ type = "completed" }) => {
  const intl = useIntl();

  return (
    <div className={cls("main-list-header-tabs-container", style.buttonMargin)}>
      <Header />
      <>
        {type === "completed" && (
          <Tabs type="line">
            <TabPane
              tab={intl.formatMessage({
                id: "cloud.operation.tasks",
                defaultMessage: "Operation Task",
              })}
              auth={{
                authKey: "list",
                type: "view",
                resource: "virtualization.operation.tasks",
              }}
              key="could.platform"
            >
              <History className={style.main} view="virtualization.main" />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "cloud.ha.tasks",
                defaultMessage: "HA Task",
              })}
              auth={{
                authKey: "list",
                type: "view",
                resource: "virtualization.ha.task",
              }}
              key="could.ha"
            >
              <HaLog className={style.main} view="main" />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "scheduling.task",
                defaultMessage: "Scheduling Task",
              })}
              auth={{
                authKey: "list",
                type: "view",
                resource: "virtualization.scheduling.task",
              }}
              key="scheduling.task"
            >
              <MigrationActivityList className={style.main} view="main" />
            </TabPane>
          </Tabs>
        )}
      </>
    </div>
  );
};

export default OperationLog;
