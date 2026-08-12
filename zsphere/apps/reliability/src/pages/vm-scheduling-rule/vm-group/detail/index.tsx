import { gql, useQuery } from "@apollo/client";
import { Tabs, TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import {
  Op,
  VmInstanceState,
  VmQueryType,
  VmSchedulingRuleQueryType,
} from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AuditList from "zsv_auditing/auditing-sub-list";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import VmList from "zsv_resource/vm/list";

import VmSchedulingRule from "../../list";
import Header from "./header";
import Overview from "./overview";

const VM_GROUP_LIST = gql`
  query vmGroupList(
    $conditions: [Condition!]
    $type: VmGroupQueryType
    $extraConditions: [Condition!]
    $limit: Int
    $start: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmGroupList(
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
        vmCount
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
        zoneUuid
        zone {
          uuid
          name
        }
        createDate
        lastOpDate
        owner {
          uuid
          name
        }
      }
    }
  }
`;

const Detail: React.FC = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const zoneUuid = searchParams.get("zoneUuid") || "";
  const { loading, data, refetch } = useQuery(VM_GROUP_LIST, {
    variables: { conditions: [{ key: "uuid", value: uuid, op: Op.eq }] },
  });
  const current = data?.vmGroupList?.list?.[0];

  const defaultQueryVmList = useMemo(() => {
    return {
      conditions: [
        { key: "state", op: Op.ne, value: VmInstanceState.Destroyed },
      ],
      extraConditions: [
        { key: "vmGroupUuid", op: Op.eq, value: current?.uuid },
      ],
      type: VmQueryType.GetVmByVmGroup,
    };
  }, [current?.uuid]);

  const defaultQueryVmSchedulingRuleList = useMemo(() => {
    return {
      extraConditions: [
        { key: "vmGroupUuid", op: Op.eq, value: current?.uuid },
      ],
      type: VmSchedulingRuleQueryType.AssociateVmGroup,
    };
  }, [current?.uuid]);

  return (
    <AutoSkeleton name="vm-group-detail" loading={loading}>
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
                tab={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
                key="vm"
              >
                <VmList
                  view="sub.virtualization.vm-group"
                  defaultQuery={defaultQueryVmList}
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
                  view="sub.virtualization.vm-group"
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
