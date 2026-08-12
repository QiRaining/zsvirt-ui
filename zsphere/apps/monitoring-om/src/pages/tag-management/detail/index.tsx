import { useQuery, gql } from "@apollo/client";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { TagQueryResp } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import AuditList from "./audit";
import Config from "./config";
import Header from "./header";
import Overview from "./overview";

const queryTagList = gql`
  query queryTagList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: TagQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $resourceType: String
    $resourceConditions: [Condition!]
  ) {
    tagList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      replyWithCount: true
      sortBy: $sortBy
      sortDirection: $sortDirection
      resourceType: $resourceType
      resourceConditions: $resourceConditions
    ) {
      total
      list {
        uuid
        name
        color
        type
        createDate
        value
        lastOpDate
        description
        owner {
          uuid
          type
          name
        }
        resourceCount
      }
    }
  }
`;

interface IProps {
  location: Location;
}

const Detail: React.FC<IProps> = () => {
  const [searchParams] = useSearchParams();
  const intl = useIntl();

  const uuid = searchParams.get("uuid") || "";

  const { data, refetch } = useQuery<{ tagList: TagQueryResp }, IQuery>(
    queryTagList,
    {
      variables: {
        conditions: [
          {
            key: "uuid",
            op: Op.eq,
            value: uuid,
          },
        ],
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const current = data?.tagList?.list?.[0] ?? ({} as any);

  useActionSubscribe({
    resourceTypeList: ["Tag"],
    onProgress: () => {
      refetch?.();
    },
  });

  return (
    <div className="zsv-detail-container">
      <Header current={current} refetch={refetch} />
      <Tabs type="line">
        <TabPane
          tab={intl.formatMessage({
            id: "virtualization.overview",
            defaultMessage: "Overview",
          })}
          key="overview"
        >
          <Overview current={current!} />
        </TabPane>

        <TabPane
          tab={intl.formatMessage({
            id: "virtualization.relatedResource",
            defaultMessage: "Associated Resource",
          })}
          key="config"
          className="no-padding"
        >
          <Config current={current!} refetch={refetch} />
        </TabPane>

        <TabPane
          tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
          key="auditing"
          auth={{
            type: "view",
            authKey: "list",
            resource: "auditing",
          }}
        >
          <AuditList current={current} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Detail;
