import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import Header from "./header";
import UserGroupList from "./user-group/list";
import UserList from "./user/list";

import style from "./style.module.less";

const Account: React.FC = () => {
  const intl = useIntl();

  return (
    <div className="main-list-header-tabs-container">
      <Header />
      <Tabs
        className={style.tabs}
        type="line"
        destroyInactiveTabPane
        contentId="main-tab"
      >
        <TabPane
          tab={intl.formatMessage({ id: "user", defaultMessage: "User" })}
          key="resource.user"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.user",
          }}
        >
          <div className="zsv-list-padding">
            <UserList
              view="virtualization.main"
              defaultQuery={{
                conditions: [
                  {
                    key: "name",
                    op: Op.ne,
                    value: "admin",
                  },
                ],
              }}
            />
          </div>
        </TabPane>
        <TabPane
          tab={intl.formatMessage({
            id: "user.group",
            defaultMessage: "User Group",
          })}
          key="resource.userGroup"
          auth={{
            type: "view",
            authKey: "list",
            resource: "virtualization.userGroup",
          }}
        >
          <div className="zsv-list-padding">
            <UserGroupList
              view="virtualization.main"
              defaultQuery={{
                conditions: [
                  {
                    key: "name",
                    op: Op.ne,
                    value: "admin",
                  },
                ],
              }}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Account;
