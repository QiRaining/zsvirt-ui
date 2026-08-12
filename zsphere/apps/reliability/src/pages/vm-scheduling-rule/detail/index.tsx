import { gql, useQuery } from "@apollo/client";
import { Tabs, TabPane } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AuditList from "zsv_auditing/auditing-sub-list";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";

import Header from "./header";
import HostGroupDetail from "./host-group-detail";
import Overview from "./overview";
import VmGroupDetail from "./vm-group-detail";

const VM_SCHEDULING_RULE_LIST = gql`
  query vmSchedulingRuleList(
    $conditions: [Condition!]
    $type: VmSchedulingRuleQueryType
    $extraConditions: [Condition!]
    $limit: Int
    $start: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmSchedulingRuleList(
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
        mode
        rule
        state
        excuteState
        vmGroup {
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
          createDate
          lastOpDate
          owner {
            uuid
            name
          }
        }
        hostGroup {
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
        zoneUuid
        zone {
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
  const { loading, data, refetch } = useQuery(VM_SCHEDULING_RULE_LIST, {
    variables: { conditions: [{ key: "uuid", value: uuid, op: Op.eq }] },
  });
  const current = data?.vmSchedulingRuleList?.list?.[0];

  useActionSubscribe({
    resourceTypeList: ["VmSchedulingRule", "VmGroup", "HostGroup"],
    onFinish() {
      refetch?.();
    },
  });

  return (
    <AutoSkeleton name="vm-scheduling-rule-detail" loading={loading}>
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
                  id: "vmGroup",
                  defaultMessage: "VM Scheduling Group",
                })}
                key="vmGroup"
              >
                <VmGroupDetail current={current} />
              </TabPane>
              {current?.hostGroup && (
                <TabPane
                  tab={intl.formatMessage({
                    id: "hostGroup",
                    defaultMessage: "Host Scheduling Group",
                  })}
                  key="hostGroup"
                >
                  <HostGroupDetail current={current} />
                </TabPane>
              )}
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
