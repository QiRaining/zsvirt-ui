import { gql, useQuery } from "@apollo/client";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import L2NetworkList from "zsv_resource/l2-network/list";

import BareMetalChassisList from "../../baremetal-chassis/list";
import BareMetalInstanceList from "../../baremetal-instance/list";
import Audit from "./audit";
import Header from "./header";
import Overview from "./overview";

const QUERY_BAREMETAL_CLUSTER_LIST = gql`
  query queryClusterList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    clusterList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
        description
        createDate
        lastOpDate
        clusterKVMCpuModel
        checkCpuModel
        checkCpuModelId
        displayNetworkCidr
        migrateNetworkCidr
        type
        state
        hypervisorType
        isShowDrsTab
        isSupported
        isMaintenanceOfAllHost
        isAttachL2network
        isAttachPrimaryStorage
        isAttachBaremetalPxeServer
        primaryStorageCount
        volumeCount
        baremetalChassisNum
        baremetalInstanceNum
        baremetalPxeServer {
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
        runningVm
        zoneUuid
        zone {
          name
          uuid
        }
        hostList {
          uuid
          name
        }
      }
      total
    }
  }
`;

const BareMetalClusterDetail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { loading, data, refetch } = useQuery(QUERY_BAREMETAL_CLUSTER_LIST, {
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });
  const { list = [] } = data?.clusterList || {};
  const current = list?.[0] || {};

  const l2DefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "cluster.uuid",
          value: current.uuid,
          op: Op.eq,
        },
        {
          key: "type",
          op: Op.ne,
          value: "portGroup",
        },
      ],
    };
  }, [current.uuid]);

  useActionSubscribe({
    resourceTypeList: ["Cluster", "BaremetalPxeServer"],
    onFinish: () => {
      refetch?.();
    },
  });

  return (
    <AutoSkeleton name="baremetal-cluster-detail" loading={loading}>
      {current?.uuid ? (
        <div className="zsv-detail-container">
          <Header current={current} refetch={refetch} />
          <Tabs type="line" destroyInactiveTabPane contentId="main-tab">
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
                id: "baremetal.device",
                defaultMessage: "Bare Metal Chassis",
              })}
              key="bare-metal-device"
              auth={{
                resource: "virtualization.bm.chassis",
                authKey: "list",
                type: "view",
              }}
            >
              <BareMetalChassisList
                defaultQuery={{
                  conditions: [{ key: "clusterUuid", op: Op.eq, value: uuid }],
                }}
                view="sub.baremetal.cluster"
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "baremetal.host",
                defaultMessage: "Bare Metal Instance",
              })}
              key="bare-metal-host"
              auth={{
                resource: "virtualization.bm.instance",
                authKey: "list",
                type: "view",
              }}
            >
              <BareMetalInstanceList
                view="sub.baremetal.cluster"
                customView="custom"
                withResourceAttribute
                defaultQuery={{
                  conditions: [
                    { key: "clusterUuid", op: Op.eq, value: uuid },
                    {
                      key: "state",
                      op: Op.ne,
                      value: "Destroyed",
                    },
                  ],
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({
                id: "distributed.switch",
                defaultMessage: "Distributed Switch",
              })}
              key="distributed-switch"
              auth={{
                resource: "virtualization.l2.network",
                authKey: "list",
                type: "view",
              }}
            >
              <L2NetworkList
                source={current}
                view="sub.baremetal.cluster"
                defaultQuery={l2DefaultQuery}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
              key="auditing"
              auth={{
                type: "view",
                authKey: "list",
                resource: "virtualization.auditing",
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

export default BareMetalClusterDetail;
