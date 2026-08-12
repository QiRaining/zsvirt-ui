import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";

import Header from "./header";
import HostGroupList from "./host-group/list";
import VmSchedulingRuleList from "./list";
import VmGroupList from "./vm-group/list";

const VmSchedulingRule: React.FC = () => {
  const intl = useIntl();

  // 处理header切换zone
  const [selectedZoneUuid, setSelectedZoneUuid] = useState<
    string | undefined
  >();
  const defaultQuery = useMemo(() => {
    const conditions = [];

    if (selectedZoneUuid) {
      conditions.push({
        key: "zoneUuid",
        op: Op.eq,
        value: selectedZoneUuid,
      });
    }

    return {
      conditions,
    };
  }, [selectedZoneUuid]);

  return (
    <ZoneUuidContext.Provider value={{ zoneUuid: selectedZoneUuid }}>
      <div className="main-list-header-tabs-container main-list-header-tabs-detail">
        <Header
          selectedZoneUuid={selectedZoneUuid}
          setSelectedZoneUuid={setSelectedZoneUuid}
        />
        <Tabs type="line" destroyInactiveTabPane contentId="main-tab">
          <TabPane
            tab={intl.formatMessage({
              id: "vmSchedulingRule",
              defaultMessage: "VM Scheduling Policy",
            })}
            key="resource.vmSchedulingRule"
            auth={{
              authKey: "list",
              resource: "virtualization.vm.scheduling.rule",
              type: "view",
            }}
          >
            <VmSchedulingRuleList
              view="virtualization.main"
              defaultQuery={defaultQuery}
            />
          </TabPane>
          <TabPane
            tab={intl.formatMessage({
              id: "vmGroup",
              defaultMessage: "VM Scheduling Group",
            })}
            key="resource.vmGroup"
            auth={{
              authKey: "list",
              resource: "virtualization.vmGroup",
              type: "view",
            }}
          >
            <VmGroupList
              view="virtualization.main"
              defaultQuery={defaultQuery}
            />
          </TabPane>
          <TabPane
            tab={intl.formatMessage({
              id: "hostGroup",
              defaultMessage: "Host Scheduling Group",
            })}
            key="resource.hostGroup"
            auth={{
              authKey: "list",
              resource: "virtualization.hostGroup",
              type: "view",
            }}
          >
            <HostGroupList
              view="virtualization.main"
              defaultQuery={defaultQuery}
            />
          </TabPane>
        </Tabs>
      </div>
    </ZoneUuidContext.Provider>
  );
};

export default VmSchedulingRule;
