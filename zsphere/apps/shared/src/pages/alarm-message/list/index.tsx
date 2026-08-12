import { gql } from "@apollo/client";
import type {
  ITableListController,
  ITableListProps,
} from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";
import { useUpdateEffect, usePersistFn } from "ahooks";
import { isEqual, defaults } from "lodash-es";
import React, { useCallback, useState, useRef } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";
import ToolBarPicker, { ONE_WEEK } from "./toolbar";

export const getAlarmHistoriesList = gql`
  query getAlarmHistoriesList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: String
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    getAlarmHistoriesList(
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      unreadCount
      list {
        uuid
        accountUuid
        alarmName
        alarmZhName
        alarmStatus
        alarmUuid
        subscriptionUuid
        comparisonOperator
        context
        dataUuid
        emergencyLevel
        labels
        error
        metricName
        metricValue
        name
        namespace
        period
        readStatus
        resource {
          tagType
          tags {
            name
            color
            uuid
          }
        }
        resourceUuid
        resourceName
        canLink
        resourceType
        threshold
        createTime
        times
        type
        firstTime
        ackData {
          ackPeriod
          ackDate
          resumeAlert
          operatorAccountUuid
          owner {
            uuid
            name
          }
        }
        operatorAccountUuid
        operatorAccount {
          uuid
          name
        }
        isGatewayVm
      }
    }
  }
`;

const List: React.FC<
  IListProps<AlarmHistories> & {
    isLayoutList?: boolean;
    footer?: any;
    controller?: React.Ref<ITableListController>;
    toolbar?: string[];
    beforeQuery?: ITableListProps<AlarmHistories>["beforeQuery"];
  }
> = (props) => {
  const intl = useIntl();
  const {
    isLayoutList,
    toolbar = ["refresh", "operation", "search", "export"],
  } = props;
  const getMillionSecondsRef = useRef<Function>();
  const pagination = useRef({ start: 0, limit: 10, conditions: [] as any[] });
  const [list, setList] = useState<AlarmHistories[]>([]);
  const actionConfig = useActionConfig(list);
  const columnConfig = useColumnConfig(isLayoutList, props.view);

  const renderAction = useCallback(({ node, current }: any) => {
    if (current.alarmStatus === "OK") {
      return "-";
    }
    return node;
  }, []);

  const [myQuery, setQuery] = useState<IQuery>(() => {
    return defaults({}, props.defaultQuery, { start: 0, limit: 20 });
  });
  const queryConfig = useQueryConfig(myQuery);

  const [skip, setSkip] = useState(!isLayoutList);

  const [customTime, setCustomTime] = useState<number | "auto">(ONE_WEEK);

  useUpdateEffect(() => {
    setSkip(false);
  }, [myQuery]);

  const getMillionSecondsFn = usePersistFn((cb) => {
    getMillionSecondsRef.current = cb;
  });

  const onRefetchBtnClick = usePersistFn(() => {
    getMillionSecondsRef?.current?.();
  });

  const beforeQuery = useCallback((query?: IQuery) => {
    if (!query) {
      return;
    }
    const conditions = query?.conditions ?? [];
    const oldConditions = pagination.current.conditions ?? [];

    // 过滤掉两边的 isPagination，用于比较
    const filteredConditions = conditions.filter(
      (condition) => condition.key !== "isPagination",
    );
    const filteredOldConditions = oldConditions.filter(
      (condition) => condition.key !== "isPagination",
    );

    const conditionsIsEqual =
      filteredConditions.length === filteredOldConditions.length &&
      filteredConditions.every((condition, index) => {
        const oldCondition = filteredOldConditions[index];
        return oldCondition && isEqual(condition, oldCondition);
      });

    // 只有当 conditions 相等且 start/limit 不同时，才认为是翻页
    if (
      conditionsIsEqual &&
      ["start", "limit"].some(
        (key) => query?.[key as "start"] !== pagination.current[key as "start"],
      )
    ) {
      pagination.current = {
        start: query?.start ?? 0,
        limit: query?.limit ?? 0,
        conditions,
      };
      const _query = {
        ...query,
        conditions: conditions?.concat({
          key: "isPagination",
          op: Op.eq,
          value: "true",
        }),
      };

      return _query;
    }
    return query;
  }, []);

  return (
    <>
      <TableList
        pagination={!isLayoutList}
        renderMiddleToolbar={
          isLayoutList
            ? undefined
            : () => (
                <ToolBarPicker
                  view={props.view}
                  defaultQuery={props.defaultQuery}
                  source={props?.source}
                  myQuery={myQuery}
                  setQuery={setQuery}
                  setSkip={setSkip}
                  getMillionSecondsFn={getMillionSecondsFn}
                  customTime={customTime}
                  setCustomTime={setCustomTime}
                />
              )
        }
        renderToolbar={isLayoutList ? () => {} : undefined}
        beforeQuery={beforeQuery}
        onRefetchBtnClick={
          customTime === "auto" ? undefined : () => onRefetchBtnClick()
        }
        toolbar={toolbar as any}
        toolbarHandleTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.alarmMessage.tooltip",
              defaultMessage:
                "### Alarm Message\n\nA maximum of 1,000 alarm messages are displayed on the UI. You can select a time range to display alarm messages you want based on your business needs.\n",
            })}
          </ReactMarkdown>
        }
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={isLayoutList ? undefined : queryConfig}
        onFetchChange={({ list: _list }) => setList(_list)}
        gql={getAlarmHistoriesList}
        allGqlKeysWhenExport={true}
        skip={skip}
        type="AlarmHistories"
        resource="alarm.message"
        rowKey="dataUuid"
        renderAction={renderAction}
        {...props}
        fixHeaderOnTop={true}
        rowSelection={!isLayoutList ? undefined : {}}
        defaultQuery={myQuery}
      />
    </>
  );
};

export default List;
