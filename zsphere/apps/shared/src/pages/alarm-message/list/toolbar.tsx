import { RangePicker } from "@zstack/design";
import { useUpdateEffect } from "ahooks";
import dayjs from "dayjs";
import {
  mergeWith,
  isArray as _isArray,
  assign,
  cloneDeep,
  remove,
} from "lodash-es";
import React, { useState, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
// DateRange mirrors react-day-picker v9's Range type
interface DateRange {
  from?: Date;
  to?: Date;
  /** pad the range to a full week */
  toReserved?: Date;
}
import {
  AuthHander,
  Select,
  useAuth,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import { useGetMillionSeconds } from "@zstack/zsphere-hooks";
import { useAlarmStore as useStore } from "@zstack/zsphere-platform-store";
import type {
  IToolbarProps,
  IQuery,
  Condition as ICondition,
} from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";

const { Option } = Select;

const ONE_HOUR_SECONDS = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR_SECONDS;
export const ONE_WEEK = 7 * ONE_DAY;

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
    getMillionSecondsFn: <T>(v: T) => T;
    customTime: number | "auto";
    setCustomTime: Function;
  }
> = ({
  setQuery,
  query,
  setCustomTime,
  customTime,
  getMillionSecondsFn,
  source,
  view,
}) => {
  const [searchParams] = useSearchParams();
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const { MillionSeconds, loading, getMillionSeconds } = useGetMillionSeconds();
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [namespace, setNamespace] = useState("all");
  const { filterList: filterValue, resourceType } = useStore();
  const isCdpTask = searchParams.get("namespace") as any;

  useUpdateEffect(() => {
    if (filterValue && view?.startsWith("main")) {
      setCustomTime(ONE_WEEK);
      setNamespace("all");
    }
  }, [filterValue]);

  useUpdateEffect(() => {
    if (resourceType && view?.startsWith("main")) {
      setCustomTime(ONE_WEEK);
      setNamespace(resourceType);
    }
  }, [resourceType]);
  useEffect(() => {
    if (isCdpTask) {
      setCustomTime(ONE_WEEK);
      setNamespace("ZStack/CdpTask");
    }
  }, []);
  useEffect(() => {
    getMillionSeconds();
    getMillionSecondsFn(getMillionSeconds);
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
      } else if (namespace === "all") {
        remove(
          _query?.conditions as Array<ICondition>,
          (condition) => condition?.key === "namespace",
        );
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
          ],
        },
        customizer,
      );

      setQuery(mergeQuery);
    },
    [namespace, query, setQuery],
  );

  const {
    translateResourceType,
    translateEventType,
    translateAlarmAuth,
    resourceNamespaceList,
    namespaceList: resourceList,
  } = useMetricNameConfig();

  useEffect(() => {
    if (loading === false) {
      setStartTime(MillionSeconds - ONE_WEEK);
      setEndTime(MillionSeconds);
    }
  }, [loading, MillionSeconds]);

  useUpdateEffect(() => {
    if (customTime === "auto") {
      return;
    }

    setStartTime(MillionSeconds - customTime); // 自定义时间的时候显示上次选中的周期
    setEndTime(MillionSeconds);

    let conditions;
    if (namespace !== "all") {
      conditions = [
        {
          key: "namespace",
          op: Op.eq,
          value: namespace,
        },
      ];
    }

    myMergeQuery(MillionSeconds - customTime, MillionSeconds, conditions);
  }, [customTime, MillionSeconds]);

  useUpdateEffect(() => {
    // 根据资源类型过滤
    if (namespace === "all") {
      myMergeQuery(startTime, endTime);
      return;
    }
    myMergeQuery(startTime, endTime, [
      {
        key: "namespace",
        op: Op.eq,
        value: namespace,
      },
    ]);
  }, [namespace, startTime, endTime]);

  const onConfirm = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from || !range?.to) {
        return;
      }

      let conditions;
      if (namespace !== "all") {
        conditions = [
          {
            key: "namespace",
            op: Op.eq,
            value: namespace,
          },
        ];
      }

      setStartTime(range.from.getTime());
      setEndTime(range.to.getTime());

      myMergeQuery(
        dayjs(range.from).valueOf(),
        dayjs(range.to).valueOf(),
        conditions,
      );
    },
    [namespace, myMergeQuery],
  );

  return (
    <div>
      <div className="flex">
        <div>
          <Select
            optionLabelProp="label"
            style={{
              width: "160px",
              marginRight: "4px",
              display:
                source?.__typename === "ZWatchAlarmVO" ? "none" : undefined,
            }}
            value={namespace}
            onChange={(val) => setNamespace(val)}
          >
            <Option
              value="all"
              label={`${intl.formatMessage({
                id: "resourceType",
                defaultMessage: "Resource Type",
              })}：${intl.formatMessage({ id: "all", defaultMessage: "All" })}`}
            >
              {intl.formatMessage({ id: "all", defaultMessage: "All" })}
            </Option>
            {resourceList?.map((_namespace) => {
              const text = resourceNamespaceList.includes(_namespace)
                ? translateResourceType(_namespace)
                : translateEventType(_namespace);

              const auth = translateAlarmAuth(_namespace);

              if (auth) {
                return hasAuth(auth) ? (
                  <Option value={_namespace} label={text} key={_namespace}>
                    <AuthHander {...auth}>{text}</AuthHander>
                  </Option>
                ) : null;
              }

              return (
                <Option value={_namespace} label={text} key={_namespace}>
                  {text}
                </Option>
              );
            })}
          </Select>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
        >
          <Select
            style={{
              width: "120px",
              flexShrink: 0,
              marginRight: customTime === "auto" ? "4px" : "0px",
            }}
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
            <RangePicker
              selected={{ from: new Date(startTime), to: new Date(endTime) }}
              onSelect={(range) =>
                range?.from && range?.to
                  ? (setStartTime(range.from.getTime()),
                    setEndTime(range.to.getTime()))
                  : undefined
              }
              onConfirm={() =>
                onConfirm({ from: new Date(startTime), to: new Date(endTime) })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ToolbarWrapper = (props: any) => {
  const {
    view,
    className = "",
    setQuery,
    myQuery,
    customTime,
    setCustomTime,
    source,
    getMillionSecondsFn,
  } = props;

  return (
    <div data-testid="list" className={className}>
      <Toolbar
        view={view}
        query={myQuery}
        source={source}
        setQuery={setQuery}
        getMillionSecondsFn={getMillionSecondsFn}
        refetch={() => {}}
        selectedList={[]}
        customTime={customTime}
        setCustomTime={setCustomTime}
      />
    </div>
  );
};

export default ToolbarWrapper;
