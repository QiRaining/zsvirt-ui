import { useQuery } from "@apollo/client";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import type { IRouterByAuth } from "@zstack/zsphere-components/lib/auth/type";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IActionSubscribe } from "@zstack/zsphere-types";
import { AccountType, Op, UserGroupQueryType } from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { accountList } from "../../../../gql/account.gql";
import UserGroupList from "../../user-group/list";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";
import RelatedResource from "./related-resource";
import SharedResource from "./shared-resource";

const Detail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(accountList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });
  const { list = [] } = data?.accountList ?? {};
  const current = list?.[0] ?? {};

  const isSystemAdmin = current?.type === AccountType.SystemAdmin;

  const sharedResourceProps = {
    uuid: current?.uuid,
    linkedAccountUuid: current?.uuid,
    name: current?.name,
  };

  const TabPaneList: {
    key: string;
    tab: string;
    component: React.ReactNode;
    auth?: IRouterByAuth;
    className?: string;
  }[] = useMemo(() => {
    return [
      {
        key: "overview",
        tab: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        component: <Overview current={current} refetch={refetch} />,
      },
      ...(isSystemAdmin
        ? [
            {
              key: "related.resource",
              className: "no-padding",
              tab: intl.formatMessage({
                id: "relatedResource",
                defaultMessage: "Associated Resource",
              }),
              component: (
                <RelatedResource current={current} refetch={refetch} />
              ),
            },
            {
              key: "audit",
              tab: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
              auth: {
                type: "view",
                authKey: "list",
                resource: "auditing",
              },
              component: <Audit current={current} />,
            },
          ]
        : [
            {
              key: "user.group",
              tab: intl.formatMessage({
                id: "user.group",
                defaultMessage: "User Group",
              }),
              auth: {
                type: "view",
                authKey: "list",
                resource: "virtualization.userGroup",
              },
              component: (
                <UserGroupList
                  view="virtualization.sub.user"
                  source={current}
                  defaultQuery={{
                    type: UserGroupQueryType.GET_USERGROUP_BY_ACCOUNT,
                    extraConditions: [
                      {
                        key: "accountUuid",
                        op: Op.eq,
                        value: current?.uuid,
                      },
                    ],
                  }}
                />
              ),
            },
            {
              key: "shared.resource",
              className: "no-padding",
              tab: intl.formatMessage({
                id: "sharedResource",
                defaultMessage: "Share Resource",
              }),
              component: <SharedResource current={sharedResourceProps} />,
            },
            {
              key: "related.resource",
              className: "no-padding",
              tab: intl.formatMessage({
                id: "relatedResource",
                defaultMessage: "Associated Resource",
              }),
              component: (
                <RelatedResource current={current} refetch={refetch} />
              ),
            },
            {
              key: "audit",
              tab: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
              auth: {
                type: "view",
                authKey: "list",
                resource: "auditing",
              },
              component: <Audit current={current} />,
            },
          ]),
    ];
  }, [intl, current, isSystemAdmin, sharedResourceProps]);

  useActionSubscribe({
    resourceTypeList: ["AccountVO"],
    onFinish: () => {
      refetch?.();
    },
  } as IActionSubscribe);

  return (
    <AutoSkeleton name="user-detail" loading={loading}>
      {current?.uuid ? (
        <div className="zsv-detail-container">
          <Header current={current} refetch={refetch} />
          <Tabs type="line">
            {TabPaneList.map((item) => (
              <TabPane
                key={item.key}
                tab={item.tab}
                auth={item.auth}
                className={item.className}
              >
                {item.component}
              </TabPane>
            ))}
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default Detail;
