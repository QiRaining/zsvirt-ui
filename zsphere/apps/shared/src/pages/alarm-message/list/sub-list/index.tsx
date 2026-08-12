import { TableList } from "@zstack/zsphere-components";
import type { IListProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import { useUpdateEffect, usePersistFn } from "ahooks";
import { merge, isEqual } from "lodash-es";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useActionConfig, useQueryConfig, useColumnConfig } from "../../config";
import { getAlarmHistoriesList } from "../index";
import ToolBarPicker from "./toolbar";

const List: React.FC<IListProps<AlarmHistories> & { nameSpace: string }> = (
  props,
) => {
  const { defaultQuery, source, nameSpace, onFetchChange, ...restProps } =
    props;
  const getMillionSecondsRef = useRef<Function>();
  const intl = useIntl();
  const pagination = useRef({ start: 0, limit: 10, conditions: [] as any[] });
  const [list, setList] = useState<AlarmHistories[]>([]);
  const actionConfig = useActionConfig(list);
  const columnConfig = useColumnConfig();

  const renderAction = useCallback(({ node, current }: any) => {
    if (current.alarmStatus === "OK") {
      return "-";
    }
    return node;
  }, []);

  const [myQuery, setQuery] = useState<IQuery>(() =>
    merge({}, defaultQuery, { start: 0, limit: 10 }),
  );
  const queryConfig = useQueryConfig(myQuery);
  const [skip, setSkip] = useState(true);

  // 当外部 defaultQuery 变化时（比如切换资源），同步更新 myQuery
  useUpdateEffect(() => {
    setQuery((prev) => ({
      ...prev,
      conditions: defaultQuery?.conditions ?? prev.conditions,
    }));
  }, [defaultQuery]);

  useUpdateEffect(() => {
    setSkip(false);
  }, [myQuery]);

  const getMillionSecondsFn = usePersistFn((cb) => {
    getMillionSecondsRef.current = cb;
  });

  const onRefetchBtnClick = usePersistFn((args: any) => {
    getMillionSecondsRef?.current?.(args?.refetch);
  });

  // 监听 zwatch 推送，刷新 toolbar 的 MillionSeconds 使查询时间上界包含新报警
  useEffect(() => {
    const handler = () => {
      getMillionSecondsRef?.current?.();
    };
    bus.addListener("action:refreshTime:AlarmHistories", handler);
    return () => {
      bus.removeListener("action:refreshTime:AlarmHistories", handler);
    };
  }, []);

  const beforeQuery = useCallback((query?: IQuery) => {
    if (!query) {
      // action refetch
      return;
    }
    const conditions = query?.conditions ?? [];
    const conditionsIsEqual = conditions
      .filter((condition) => condition.key !== "isPagination")
      .every((condition, index) =>
        isEqual(condition, pagination.current.conditions?.[index]),
      );

    pagination.current.conditions = conditions;
    // start和limit不同表示为翻页行为
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

  const toolbarHandleTooltip = useMemo(
    () => (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "alarmMessage.tooltip",
          defaultMessage: `### Alarm Message
A maximum of 1,000 alarm messages are displayed on the UI. You can select a time range to display alarm messages you want based on your business needs.`,
        })}
      </ReactMarkdown>
    ),
    [intl],
  );

  const handleFetchChange = useCallback(
    (param: { list: AlarmHistories[]; total: number }) => {
      setList(param.list);
      onFetchChange?.(param);
    },
    [onFetchChange],
  );

  const renderMiddleToolbar = useCallback(
    () => (
      <ToolBarPicker
        defaultQuery={defaultQuery}
        myQuery={myQuery}
        nameSpace={nameSpace}
        setQuery={setQuery}
        setSkip={setSkip}
        getMillionSecondsFn={getMillionSecondsFn}
      />
    ),
    [defaultQuery, myQuery, nameSpace, getMillionSecondsFn],
  );

  return (
    <>
      <TableList
        renderMiddleToolbar={renderMiddleToolbar}
        toolbarHandleTooltip={toolbarHandleTooltip}
        beforeQuery={beforeQuery}
        onRefetchBtnClick={onRefetchBtnClick}
        toolbar={["refresh", "operation", "search"]}
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={getAlarmHistoriesList}
        skip={skip}
        type="AlarmHistories"
        resource="alarm.message"
        rowKey="dataUuid"
        renderAction={renderAction}
        {...restProps}
        onFetchChange={handleFetchChange}
        defaultQuery={myQuery}
      />
    </>
  );
};

export default List;
