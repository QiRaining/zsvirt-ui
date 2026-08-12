import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

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

const List: React.FC<IListProps<VmSchedulingRule>> = ({ helper, ...props }) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const intl = useIntl();

  const helperMemo: ITableListProps<VmSchedulingRule>["helper"] = useMemo(
    () => ({
      authKey: "create.vm.scheduling.rule",
      text: intl.formatMessage({
        id: "vmSchedulingRule.hepler",
        defaultMessage: "No VM scheduling policy is available.",
      }),
      microAppName: "resource-pool",
      to: "/vm-scheduling-rule",
      injectRouteStateBackMark: true,
      ...helper,
    }),
    [intl, helper],
  );

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={VM_SCHEDULING_RULE_LIST}
      helper={helperMemo}
      type="VmSchedulingRule"
      resource="vm.scheduling.rule"
      {...props}
    />
  );
};

export default List;
