import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { useState } from "react";
import { useIntl } from "react-intl";
import { ProtectedResourceContext } from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import VmContainer from "./components/vmContainer";
import ProtectedResourceHeader from "./header";
import PlatformDatabaseList from "./platformDatabase";

import style from "./style.module.less";

const ProtectedResource = () => {
  const intl = useIntl();
  const [store, setStore] = useState<any>({});

  return (
    <ProtectedResourceContext.Provider value={{ store, setStore }}>
      <div className="main-list-header-tabs-container">
        <ProtectedResourceHeader />
        <Tabs
          className={style.tabs}
          type="line"
          destroyInactiveTabPane
          contentId="main-tab"
        >
          <TabPane
            tab={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
            key="resource.vm"
            auth={{
              type: "view",
              authKey: "list",
              resource: "virtualization.protected.resource.vm",
            }}
          >
            <VmContainer store={store} setStore={setStore} />
          </TabPane>
          <TabPane
            tab={intl.formatMessage({
              id: "platform.database",
              defaultMessage: "Platform Database",
            })}
            key="resource.database"
            auth={{
              type: "view",
              authKey: "list",
              resource: "virtualization.protected.resource.database",
            }}
          >
            <PlatformDatabaseList />
          </TabPane>
        </Tabs>
      </div>
    </ProtectedResourceContext.Provider>
  );
};

export default ProtectedResource;
