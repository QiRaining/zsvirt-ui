import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { HostGroup } from "@zstack/zsphere-types/graphql";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

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

const HostGroupList: React.FC<IListProps<HostGroup>> = ({
  helper,
  ...props
}) => {
  const { zoneUuid } = useContext(ZoneUuidContext);

  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({ view: props?.view, zoneUuid });

  const intl = useIntl();

  const helperMemo: ITableListProps<HostGroup>["helper"] = useMemo(
    () => ({
      authKey: "create.host.group",
      text: intl.formatMessage({
        id: "hostGroup.hepler",
        defaultMessage: "No host scheduling group is available.",
      }),
      microAppName: "resource-pool",
      to: "/vm-scheduling-rule/host-group/create",
      // injectRouteStateBackMark: true,
      ...helper,
    }),
    [intl, helper],
  );

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={HOST_GROUP_LIST}
      helper={helperMemo}
      type="HostGroup"
      resource="host.group"
      {...props}
    />
  );
};

export default HostGroupList;
