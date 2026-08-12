import { TabPane, Tabs } from "@zstack/zsphere-components";
import type { SnmpAgent } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import SnmpTrapList from "../../snmp-trap/list";
import Overview from "./overview";

import style from "./style.module.less";

interface IProps {
  current: SnmpAgent;
  refetch: Function;
}

const Detail: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();

  return (
    <>
      <Tabs type="line">
        <TabPane
          className={style.tabpane}
          key="overview"
          tab={intl.formatMessage({
            id: "snmp.overview.tab.title",
            defaultMessage: "SNMP Configurations",
          })}
        >
          <Overview current={current} refetch={refetch} />
        </TabPane>
        <TabPane
          className={style.tabpane}
          key="trap"
          tab={intl.formatMessage({
            id: "snmp.trap",
            defaultMessage: "SNMP Trap Receiver",
          })}
          auth={{
            type: "view",
            authKey: "list",
            resource: "snmp.trap",
          }}
        >
          <SnmpTrapList view="virtualization.main" />
        </TabPane>
      </Tabs>
    </>
  );
};

export default Detail;
