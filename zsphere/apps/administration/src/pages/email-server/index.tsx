import { TabPane, Tabs } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import Header from "./header";
import { EmailServerContext } from "./hook";
import List from "./main";

import style from "./style.module.less";

const LogServer: React.FC = () => {
  const [store, setStore] = React.useState<EmailServerContext["store"]>({});
  const { currentUser } = usePlatformStore();
  const intl = useIntl();

  return (
    <EmailServerContext.Provider
      value={{
        store,
        setStore,
      }}
    >
      <div className="main-list-header-tabs-container">
        <Header />
        <div className={style.body}>
          <Tabs
            type="line"
            onTabClick={() => {
              setStore({
                ...store,
                emailServer: undefined,
              });
            }}
          >
            <TabPane
              tab={intl.formatMessage({
                id: "existing.resources",
                defaultMessage: "Existing Resources",
              })}
              key="have"
              auth={{
                type: "block",
                resource: "email.server",
                authKey: "all.resource",
              }}
              className={style.tabpane}
            >
              <List
                view="main.virtualization"
                defaultQuery={{
                  type: "All",
                  start: 0,
                  limit: 20,
                }}
              />
            </TabPane>

            <TabPane
              tab={intl.formatMessage({
                id: "own",
                defaultMessage: "Existing",
              })}
              key="own"
              auth={{
                type: "block",
                resource: "email.server",
                authKey: "selfhave.resource",
              }}
              className={style.tabpane}
            >
              <List
                view="main.virtualization.selfhave"
                defaultQuery={{
                  type: "SelfHave",
                  extraConditions: [
                    {
                      key: "accountUuid",
                      op: Op.eq,
                      value: currentUser.accountUuid,
                    },
                  ],
                  start: 0,
                  limit: 20,
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "share",
                defaultMessage: "Share",
              })}
              key="share"
              auth={{
                type: "block",
                resource: "email.server",
                authKey: "shared.resource",
              }}
            >
              <List
                view="main.virtualization.share"
                defaultQuery={{
                  type: "Share",
                  extraConditions: [
                    {
                      key: "accountUuid",
                      op: Op.eq,
                      value: currentUser.accountUuid,
                    },
                  ],
                  start: 0,
                  limit: 20,
                }}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </EmailServerContext.Provider>
  );
};

export default LogServer;
