import { Button, RangePicker } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Select } from "@zstack/zsphere-components";
import type { Condition, IQuery, IToolbarProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import { usePersistFn, useUpdateEffect } from "ahooks";
import dayjs from "dayjs";
import { produce } from "immer";
import React, { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useIntl } from "react-intl";

import useGetMillionSeconds from "./useGetMillionSeconds";

type IProps = Pick<IToolbarProps<IAudit>, "query" | "setQuery" | "view"> & {
  refetchAll: (query: IQuery, needInit?: boolean) => void;
  setView: (k: string) => void;
  isZsv?: boolean;
};

const Toolbar: React.FC<IProps> = ({
  query,
  refetchAll,
  view = "sub",
  setView,
}) => {
  const { MillionSeconds: millionSeconds, getMillionSeconds } =
    useGetMillionSeconds();
  const intl = useIntl();
  const [lastDays, setLastDays] = useState<number>(7);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [auditType, setAuditType] = useState<string>(
    view === "main.login" ? "Login" : "Resource",
  );

  const getTimeCondition: () => [Condition, Condition] = usePersistFn(() => {
    return [
      {
        key: "startTime",
        op: Op.eq,
        value: dayjs(millionSeconds)
          .subtract(lastDays, "days")
          .valueOf()
          .toString(),
      },
      {
        key: "endTime",
        op: Op.eq,
        value: dayjs(millionSeconds).valueOf().toString(),
      },
    ];
  });

  const queryConditions = useMemo<IQuery>(() => {
    const auditTypeExtraCondition =
      auditType === "Resource"
        ? {
            key: "auditType",
            value: "Resource",
            op: Op.eq,
          }
        : {
            key: "auditType",
            value: "Login",
            op: Op.eq,
          };

    if (lastDays === 0) {
      return produce(query, (draft) => {
        const targetIndex = draft.extraConditions?.findIndex(
          (cv) => cv.key === "auditType",
        );
        if (targetIndex === -1) {
          draft.extraConditions?.push(auditTypeExtraCondition);
        } else {
          draft.extraConditions?.splice(
            targetIndex!,
            1,
            auditTypeExtraCondition,
          );
        }
        return draft;
      });
    }
    return produce(query, (draft) => {
      const timeConditions = getTimeCondition();
      return {
        ...draft,
        extraConditions: [...timeConditions, auditTypeExtraCondition],
      };
    }) as IQuery;
  }, [lastDays, auditType]);

  useUpdateEffect(() => {
    refetchAll(queryConditions);
  }, [queryConditions]);

  //时间选择器初始值timeRange：需要查询一次当前时间
  useEffect(() => {
    getMillionSeconds?.();
  }, []);
  const [timeRange, setTimeRange] = useState<DateRange | undefined>(() => {
    const cv = getTimeCondition();
    return {
      from: dayjs(Number(cv[0].value)).toDate(),
      to: dayjs(Number(cv[1].value)).toDate(),
    };
  });

  const changeTimeCondition = usePersistFn(
    (draftQuery: IQuery, timeArr: [string, string]) => {
      const gteCondition = draftQuery.extraConditions?.find(
        (cv) => cv.key === "startTime" && cv.op === Op.eq,
      );
      const lteCondition = draftQuery.extraConditions?.find(
        (cv) => cv.key === "endTime" && cv.op === Op.eq,
      );
      const [gte, lte] = timeArr;
      if (gteCondition) {
        gteCondition.value = gte;
      } else {
        draftQuery.extraConditions?.push({
          key: "startTime",
          op: Op.eq,
          value: gte,
        });
      }
      if (lteCondition) {
        lteCondition.value = lte;
      } else {
        draftQuery.extraConditions?.push({
          key: "endTime",
          op: Op.eq,
          value: lte,
        });
      }
      return draftQuery;
    },
  );

  const onClick = usePersistFn(() => {
    getMillionSeconds?.();
    if (lastDays === 0 && timeRange?.from && timeRange?.to) {
      const timeArr: [string, string] = [
        dayjs(timeRange.from).valueOf().toString(),
        dayjs(timeRange.to).valueOf().toString(),
      ];
      const newQuery = produce(query, (draft) => {
        return changeTimeCondition(draft, timeArr);
      });
      refetchAll(newQuery);
    }
  });

  useUpdateEffect(() => {
    // 确保点击刷新按钮时获得的是最新的数据
    let timeArr = getTimeCondition().map<string>((cv) => String(cv.value)) as [
      string,
      string,
    ];
    if (!lastDays) {
      timeArr =
        timeRange?.from && timeRange?.to
          ? ([
              dayjs(timeRange.from).valueOf().toString(),
              dayjs(timeRange.to).valueOf().toString(),
            ] as [string, string])
          : (getTimeCondition().map<string>((cv) => String(cv.value)) as [
              string,
              string,
            ]);
    }
    const newQuery = produce(query, (draft) => {
      return changeTimeCondition(draft, timeArr);
    });
    refetchAll(newQuery);
  }, [millionSeconds]);

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <Button
            onClick={() => onClick()}
            variant="secondary"
            icon={<Icon type="refresh" />}
          />
          {view.startsWith("main") && (
            <Select
              width="s"
              value={auditType}
              onChange={(value: string) => {
                setAuditType(value);
                setView(value === "Resource" ? "main.resource" : "main.login");
              }}
              options={[
                {
                  value: "Resource",
                  label: intl.formatMessage({
                    id: "resourceOperation",
                    defaultMessage: "Resource Action",
                  }),
                },
                {
                  value: "Login",
                  label: intl.formatMessage({
                    id: "loginOperation",
                    defaultMessage: "Login Operation",
                  }),
                },
              ]}
            />
          )}
          <Select
            width="s"
            onChange={(value: number) => {
              setLastDays(value);
              setShowTimePicker(value === 0);
              if (value === 0) {
                const cv = getTimeCondition();
                setTimeRange({
                  from: dayjs(Number(cv[0].value)).toDate(),
                  to: dayjs(Number(cv[1].value)).toDate(),
                });
              }
            }}
            defaultValue={lastDays}
            options={[
              {
                value: 3,
                label: intl.formatMessage({
                  id: "last3Days",
                  defaultMessage: "Last 3 days",
                }),
              },
              {
                value: 7,
                label: intl.formatMessage({
                  id: "last7Days",
                  defaultMessage: "Last 7 days",
                }),
              },
              {
                value: 30,
                label: intl.formatMessage({
                  id: "last30Days",
                  defaultMessage: "Last 30 days",
                }),
              },
              {
                value: 0,
                label: intl.formatMessage({
                  id: "custom",
                  defaultMessage: "Custom",
                }),
              },
            ]}
          />
          {showTimePicker && (
            <RangePicker
              selected={timeRange}
              onSelect={setTimeRange}
              onConfirm={() => onClick()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
