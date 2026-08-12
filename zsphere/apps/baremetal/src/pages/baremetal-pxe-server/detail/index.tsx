import { gql, useQuery } from "@apollo/client";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { ClusterQueryType, Op } from "@zstack/zsphere-types";
import { Tabs } from "antd";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import List from "../../baremetal-cluster/list";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";

import style from "./style.module.less";

const { TabPane } = Tabs;

interface IProps {
  location: Location;
}

const QUERY_BAREMETAL_PXE_SERVER_LIST = gql`
  query baremetalPxeServerList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $type: BaremetalPxeServerQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    baremetalPxeServerList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
        description
        dhcpInterface
        dhcpRangeBegin
        dhcpRangeEnd
        hostname
        storagePath
        availableCapacity
        totalCapacity
        state
        sshPort
        status
        attachedClusterUuids
        createDate
        lastOpDate
      }
    }
  }
`;

const BaremetalPxeServerDetail: React.FC<IProps> = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(QUERY_BAREMETAL_PXE_SERVER_LIST, {
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });
  const { list = [] } = data?.baremetalPxeServerList || {};
  const current = list?.[0] || {};

  return (
    <AutoSkeleton name="baremetal-pxe-server-detail" loading={loading}>
      {current?.uuid ? (
        <div className="main-list">
          <Header current={current} refetch={refetch} />
          <Tabs className={style.tabs} type="card">
            <TabPane
              tab={intl.formatMessage({
                id: "overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <Overview current={current} refetch={refetch} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "cluster",
                defaultMessage: "Cluster",
              })}
              key="cluster"
              // style={{ padding: 24 }}
            >
              <List
                view="sub.pxe.server"
                defaultQuery={{
                  extraConditions: [
                    {
                      key: "uuid",
                      op: Op.eq,
                      value: current?.uuid,
                    },
                  ],
                  type: ClusterQueryType.BaremetalPxeserviceDetachableCluster,
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
              key="audit"
            >
              <Audit current={current} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default BaremetalPxeServerDetail;
