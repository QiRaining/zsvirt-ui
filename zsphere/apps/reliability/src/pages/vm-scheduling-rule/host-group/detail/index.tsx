import { gql, useQuery } from "@apollo/client";
import { Tabs, TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import {
  HostQueryType,
  Op,
  VmSchedulingRuleQueryType,
} from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AuditList from "zsv_auditing/auditing-sub-list";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import HostList from "zsv_resource/host/list";

import VmSchedulingRule from "../../list";
import Header from "./header";
import Overview from "./overview";

const HOST_GROUP_LIST = gql`
  query hostGroupList(
    $conditions: [Condition!]
    $type: HostGroupQueryType
    $extraConditions: [Condition!]
    $limit: Int
    $start: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    hostGroupList(
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      limit: $limit
      start: $start
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      total
      list {
        uuid
        name
        description
        hostCount
        vmSchedulingRuleCount
        associatedVmSchedulingRuleList {
          uuid
          name
          rule
          mode
          hostGroup {
            uuid
            name
          }
        }
        clusterUuid
        zoneUuid
        zone {
          uuid
          name
        }
        cluster {
          name
          uuid
        }
        owner {
          uuid
          name
        }
        createDate
        lastOpDate
      }
    }
  }
`;

const Detail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const zoneUuid = searchParams.get("zoneUuid") || "";
  const { loading, data, refetch } = useQuery(HOST_GROUP_LIST, {
    variables: { conditions: [{ key: "uuid", value: uuid, op: Op.eq }] },
  });
  const current = data?.hostGroupList?.list?.[0];

  const defaultQueryHostList = useMemo(() => {
    return {
      extraConditions: [
        { key: "hostGroupUuid", op: Op.eq, value: current?.uuid },
      ],
      type: HostQueryType.GetHostByHostGroup,
    };
  }, [current?.uuid]);

  const defaultQueryVmSchedulingRuleList = useMemo(() => {
    return {
      extraConditions: [
        { key: "hostGroupUuid", op: Op.eq, value: current?.uuid },
      ],
      type: VmSchedulingRuleQueryType.AssociateHostGroup,
    };
  }, [current?.uuid]);

  return (
    <AutoSkeleton name="host-group-detail" loading={loading}>
      {current ? (
        <ZoneUuidContext.Provider value={{ zoneUuid }}>
          <div className="zsv-detail-container">
            <Header current={current} refetch={refetch} />
            <Tabs type="line">
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
                  id: "host",
                  defaultMessage: "Host",
                })}
                key="host"
              >
                <HostList
                  view="sub.virtualization.host-group"
                  defaultQuery={defaultQueryHostList}
                  source={current}
                />
              </TabPane>
              <TabPane
                tab={intl.formatMessage({
                  id: "vmSchedulingRule",
                  defaultMessage: "VM Scheduling Policy",
                })}
                key="vmSchedulingRule"
              >
                <VmSchedulingRule
                  view="sub.virtualization.host-group"
                  defaultQuery={defaultQueryVmSchedulingRuleList}
                />
              </TabPane>
              <TabPane
                tab={intl.formatMessage({
                  id: "audit",
                  defaultMessage: "Event",
                })}
                key="audit"
              >
                <AuditList
                  view="sub"
                  defaultQuery={{
                    conditions: [
                      {
                        key: "resourceUuid",
                        op: Op.eq,
                        value: current.uuid,
                      },
                    ],
                  }}
                />
              </TabPane>
            </Tabs>
          </div>
        </ZoneUuidContext.Provider>
      ) : null}
    </AutoSkeleton>
  );
};
export default Detail;
