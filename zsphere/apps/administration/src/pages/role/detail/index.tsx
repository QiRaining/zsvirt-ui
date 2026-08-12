import { useQuery } from "@apollo/client";
import { TabPane, Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IActionSubscribe } from "@zstack/zsphere-types";
import {
  AccountQueryType,
  UserGroupQueryType,
  Op,
} from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { zsvRoleList } from "../../../gql/role.gql";
import UserGroupList from "../../account-information/user-group/list";
import UserList from "../../account-information/user/list";
import { isSodOrResourceViewerRole } from "../utils";
import ApiAuth from "./api-auth";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";

const Detail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(zsvRoleList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });
  const { list = [] } = data?.zsvRoleList ?? {};
  const current = list?.[0] ?? {};

  useActionSubscribe({
    resourceTypeList: ["Role"],
    onFinish: () => {
      refetch?.();
    },
  } as IActionSubscribe);

  return (
    <AutoSkeleton name="role-detail" loading={loading}>
      {current?.uuid ? (
        <div className="zsv-detail-container">
          <Header current={current} refetch={refetch} />
          <Tabs type="line">
            <TabPane
              key="overview"
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
            >
              <Overview current={current} refetch={refetch} />
            </TabPane>
            <TabPane
              key="associated.user"
              tab={intl.formatMessage({
                id: "associated.user",
                defaultMessage: "Associated User",
              })}
            >
              <UserList
                view="virtualization.sub.role"
                toolbar={["refresh", "search"]}
                defaultQuery={{
                  type: AccountQueryType.GET_ACCOUNT_BY_ROLE,
                  extraConditions: [
                    {
                      key: "roleUuid",
                      op: Op.eq,
                      value: current?.uuid,
                    },
                  ],
                }}
              />
            </TabPane>
            {!isSodOrResourceViewerRole(current?.uuid) && (
              <>
                <TabPane
                  key="associated.user.group"
                  tab={intl.formatMessage({
                    id: "associated.user.group",
                    defaultMessage: "Associated User Group",
                  })}
                >
                  <UserGroupList
                    view="virtualization.sub.role"
                    toolbar={["refresh", "search"]}
                    defaultQuery={{
                      type: UserGroupQueryType.GET_USERGROUP_BY_ROLE,
                      extraConditions: [
                        {
                          key: "roleUuid",
                          op: Op.eq,
                          value: current?.uuid,
                        },
                      ],
                    }}
                  />
                </TabPane>
                <TabPane
                  key="api.auth"
                  tab={intl.formatMessage({
                    id: "api.auth",
                    defaultMessage: "API Permissions",
                  })}
                >
                  <ApiAuth current={current} refetch={refetch} />
                </TabPane>
              </>
            )}
            <TabPane
              key="audit"
              tab={intl.formatMessage({
                id: "audit",
                defaultMessage: "Event",
              })}
              auth={{
                type: "view",
                authKey: "list",
                resource: "auditing",
              }}
            >
              <Audit current={current} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default Detail;
