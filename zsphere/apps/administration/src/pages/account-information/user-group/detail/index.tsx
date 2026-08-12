import { useQuery } from "@apollo/client";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IActionSubscribe } from "@zstack/zsphere-types";
import { AccountQueryType, Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { userGroupList } from "../../../../gql/user-group.gql";
import UserList from "../../user/list";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";
import SharedResource from "./shared-resource";

const Detail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(userGroupList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });
  const { list = [] } = data?.userGroupList ?? {};
  const current = list?.[0] ?? {};

  useActionSubscribe({
    resourceTypeList: ["UserGroup"],
    onFinish: () => {
      refetch?.();
    },
  } as IActionSubscribe);

  return (
    <AutoSkeleton name="user-group-detail" loading={loading}>
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
              key="user.group"
              tab={intl.formatMessage({ id: "user", defaultMessage: "User" })}
            >
              <UserList
                source={current}
                view="virtualization.sub.userGroup"
                defaultQuery={{
                  type: AccountQueryType.GET_ACCOUNT_BY_USERGROUP,
                  extraConditions: [
                    {
                      key: "userGroupUuid",
                      op: Op.eq,
                      value: current?.uuid,
                    },
                  ],
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "sharedResource",
                defaultMessage: "Share Resource",
              })}
              key="shared.resource"
              className="no-padding"
            >
              <SharedResource current={current} />
            </TabPane>
            <TabPane
              key="audit"
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
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
