import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import { mergeWith } from "lodash-es";
import { useMemo } from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

import style from "./style.module.less";

const zwatchAlarmList = gql`
  query zwatchAlarmList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $start: Int
    $limit: Int
    $type: ZWatchAlarmQueryType
  ) {
    zwatchAlarmList(
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
      start: $start
      limit: $limit
      type: $type
      replyWithCount: true
    ) {
      list {
        uuid
        name
        zhName
        description
        period
        namespace
        metricName
        threshold
        repeatCount
        repeatInterval
        enableRecovery
        emergencyLevel
        comparisonOperator
        eventName
        thirdpartyPlatformName
        state
        status
        topicNum
        createDate
        lastOpDate
        actions {
          alarmUuid
          subscriptionUuid
          actionUuid
          actionType
        }
        labels {
          uuid
          key
          operator
          value
        }
        userTag {
          uuid
          tag
          type
          resourceType
          resourceUuid
        }
        owner {
          uuid
          name
        }
        platform {
          uuid
          name
        }
      }
      total
    }
  }
`;

export default function List(props: IListProps<ZWatchAlarmVO>) {
  const columnConfig = useColumnConfig({ view: props.view });
  const actionConfig = useActionConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);

  const defaultQuery = useMemo(() => {
    return mergeWith({}, props.defaultQuery, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
  }, [props.defaultQuery]);

  return (
    <TableList
      className={style.resourceTable}
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={zwatchAlarmList}
      type="ZWatchAlarmVO"
      resource="zwatch.alarm.resource"
      {...props}
      defaultQuery={defaultQuery}
    />
  );
}
