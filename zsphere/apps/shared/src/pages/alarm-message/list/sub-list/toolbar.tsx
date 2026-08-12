import { RangePicker } from "@zstack/design";
import { Select } from "@zstack/zsphere-components";
import { useGetMillionSeconds } from "@zstack/zsphere-hooks";
import { useAlarmStore as useStore } from "@zstack/zsphere-platform-store";
import type {
  Condition as ICondition,
  IQuery,
  IToolbarProps,
} from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import { useUpdateEffect } from "ahooks";
import dayjs from "dayjs";
import { isArray as _isArray, assign, cloneDeep, mergeWith } from "lodash-es";
import React, { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useIntl } from "react-intl";

const { Option } = Select;

const ONE_HOUR_SECONDS = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR_SECONDS;
const ONE_WEEK = 7 * ONE_DAY;

const hourList = [1, 12].map((hour) => [hour, hour * ONE_HOUR_SECONDS]);
const dayList = [1, 7, 15].map((day) => [day, day * ONE_DAY]);

type keyQuery = keyof Omit<IQuery, "fields">;
type valueQuery = IQuery[keyQuery];

export function customizer(objValue: valueQuery, srcValue: valueQuery) {
  if (_isArray(objValue) && _isArray(srcValue)) {
    const combined = srcValue?.reduce((acc: ICondition[], cur: ICondition) => {
      const target = acc.find(
        (item: ICondition) => item.key === cur.key && item.op === cur.op,
      );
      if (target) {
        assign(target, cur);
      } else {
        acc.push(cur);
      }
      return acc;
    }, objValue);

    return combined;
  }
}

const Toolbar: React.FC<
  IToolbarProps<IAudit> & {
    nameSpace: string;
    getMillionSecondsFn: <T>(v: T) => T;
    defaultQuery: IQuery;
  }
> = ({ setQuery, query, nameSpace, getMillionSecondsFn, defaultQuery }) => {
  const intl = useIntl();
  const { MillionSeconds, loading, getMillionSeconds } = useGetMillionSeconds();
  const [customTime, setCustomTime] = useState<number | "auto">(ONE_WEEK);
  const [timeRange, setTimeRange] = useState<DateRange | undefined>();
  const { filterList: filterValue, resourceType } = useStore();

  useUpdateEffect(() => {
    if (filterValue) {
      setCustomTime(ONE_WEEK);
    }
  }, [filterValue]);

  useUpdateEffect(() => {
    if (resourceType) {
      setCustomTime(ONE_WEEK);
    }
  }, [resourceType]);

  useEffect(() => {
    getMillionSeconds();
    getMillionSecondsFn((refetch) => {
      if (customTime === "auto") {
        refetch?.();
      } else {
        getMillionSeconds();
      }
    });
  }, [getMillionSeconds, getMillionSecondsFn]);

  const myMergeQuery = useCallback(
    (_startTime: number, _endTime: number, conditions?: ICondition[]) => {
      if (typeof _startTime !== "number" || typeof _endTime !== "number") {
        return;
      }

      const _query = cloneDeep(query);
      if (conditions && _query.conditions) {
        _query.conditions = cloneDeep(
          mergeWith(
            { conditions: _query.conditions },
            { conditions },
            customizer,
          )?.conditions,
        );
      } else if (conditions) {
        _query.conditions = conditions;
      }

      const mergeQuery = mergeWith(
        _query,
        {
          conditions: [
            {
              key: "createTime",
              op: Op.gte,
              value: String(_startTime),
            },
            {
              key: "createTime",
              op: Op.lte,
              value: String(_endTime),
            },
            {
              key: "namespace",
              op: Op.eq,
              value: nameSpace,
            },
          ],
        },
        customizer,
      );

      // additional logic for handle the tab cache scenario, when the uuid has been changed,
      // we need to update the resourceUuid condition
      if (mergeQuery?.conditions) {
        const newUuid = defaultQuery?.conditions?.find(
          (condition) => condition.key === "resourceUuid",
        )?.value as string;
        if (newUuid) {
          const oldConditionIndex = mergeQuery.conditions.findIndex(
            (condition) => condition.key === "resourceUuid",
          );
          const tempConditions = [...mergeQuery.conditions];
          tempConditions[oldConditionIndex].value = newUuid;
          setQuery({ ...mergeQuery, conditions: tempConditions });
        } else {
          setQuery(mergeQuery);
        }
      } else {
        setQuery(mergeQuery);
      }
    },
    [query, setQuery, nameSpace, defaultQuery],
  );

  useEffect(() => {
    if (loading === false) {
      setTimeRange({
        from: dayjs(MillionSeconds - ONE_WEEK).toDate(),
        to: dayjs(MillionSeconds).toDate(),
      });
    }
  }, [loading, MillionSeconds]);

  useUpdateEffect(() => {
    if (customTime === "auto") {
      if (timeRange?.from && timeRange?.to) {
        myMergeQuery(timeRange.from.getTime(), timeRange.to.getTime());
      }
      return;
    }

    const start = MillionSeconds - customTime;
    const end = MillionSeconds;
    setTimeRange({
      from: dayjs(start).toDate(),
      to: dayjs(end).toDate(),
    });

    myMergeQuery(start, end);
  }, [customTime, MillionSeconds, defaultQuery, timeRange]);

  const onOk = useCallback(
    (range: DateRange | undefined) => {
      setTimeRange(range);
      if (range?.from && range?.to) {
        myMergeQuery(range.from.getTime(), range.to.getTime());
      }
    },
    [myMergeQuery],
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
      }}
    >
      <Select
        style={{ width: "120px", flexShrink: 0 }}
        value={customTime}
        onChange={(val) => setCustomTime(val)}
      >
        {hourList.map(([hour, value]) => (
          <Option key={value} value={value}>
            {intl.formatMessage(
              { id: "count.hour", defaultMessage: "{count} hours" },
              { count: hour },
            )}
          </Option>
        ))}
        {dayList.map(([day, value]) => (
          <Option key={value} value={value}>
            {intl.formatMessage(
              { id: "count.day", defaultMessage: "{count} days" },
              { count: day },
            )}
          </Option>
        ))}
        <Option value="auto">
          {intl.formatMessage({
            id: "customTime",
            defaultMessage: "Custom",
          })}
        </Option>
      </Select>
      {customTime === "auto" && (
        <RangePicker selected={timeRange} onSelect={onOk} />
      )}
    </div>
  );
};

const ToolbarWrapper = (props: any) => {
  const {
    view,
    className = "",
    setQuery,
    myQuery,
    source,
    getMillionSecondsFn,
    nameSpace,
  } = props;
  return (
    <div data-testid="list" className={className}>
      <Toolbar
        nameSpace={nameSpace}
        view={view}
        query={myQuery}
        source={source}
        setQuery={setQuery}
        getMillionSecondsFn={getMillionSecondsFn}
        refetch={() => {}}
        selectedList={[]}
        {...props}
      />
    </div>
  );
};

export default ToolbarWrapper;
