import { Button, RangePicker } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Select } from "@zstack/zsphere-components";
import type { IToolbarProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Condition,
  OperationLog as IOperationLog,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn, useUpdateEffect } from "ahooks";
import dayjs from "dayjs";
import { produce } from "immer";
import React, { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useIntl } from "react-intl";

import style from "./style.module.less";

type IProps = Pick<IToolbarProps<IOperationLog>, "query" | "setQuery"> & {
  refetchAll: (query: IQuery, needInit?: boolean) => void;
  defaultQueryDaysNum: number;
  fromSchedHistory?: boolean;
};

const Toolbar: React.FC<IProps> = ({
  defaultQueryDaysNum,
  query,
  refetchAll,
  fromSchedHistory,
}) => {
  const intl = useIntl();
  const [lastDays, setLastDays] = useState<number>(defaultQueryDaysNum);
  // const [status, setStatus] = useState<string>('All')

  const getTimeCondition: () => [Condition, Condition] = usePersistFn(() => {
    return [
      {
        key: "createDate",
        op: Op.gte,
        value: dayjs().subtract(lastDays, "days").format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        key: "createDate",
        op: Op.lte,
        value: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      },
    ];
  });

  const queryConditions = useMemo<IQuery>(() => {
    // const statusCondition =
    //   status === 'All'
    //     ? {
    //         key: 'status',
    //         value: 'Running',
    //         op: Op.ne
    //       }
    //     : {
    //         key: 'status',
    //         value: status,
    //         op: Op.eq
    //       }
    if (lastDays === 0) {
      return produce(query, (draft) => {
        // const targetIndex = draft.conditions?.findIndex(cv => cv.key === 'status')
        // if (targetIndex === -1) {
        //   draft.conditions?.push(statusCondition)
        // } else {
        //   draft.conditions?.splice(targetIndex!, 1, statusCondition)
        // }
        return draft;
      });
    }
    return produce(query, (draft) => {
      const conditions = getTimeCondition();
      // conditions.push(statusCondition)
      return {
        ...draft,
        conditions: draft.conditions
          ?.filter((cv) => cv.key !== "createDate")
          ?.concat(conditions as any),
      };
    }) as IQuery;
  }, [lastDays]);

  useUpdateEffect(() => {
    refetchAll(queryConditions);
  }, [queryConditions]);

  const [timeRange, setTimeRange] = useState<DateRange | undefined>(() => {
    const cv = getTimeCondition();
    return {
      from: dayjs(cv[0].value).toDate(),
      to: dayjs(cv[1].value).toDate(),
    };
  });

  const changeTimeCondition = usePersistFn(
    (draftQuery: IQuery, timeArr: [string, string]) => {
      const gteCondition = draftQuery.conditions?.find(
        (cv) => cv.key === "createDate" && cv.op === Op.gte,
      );
      const lteCondition = draftQuery.conditions?.find(
        (cv) => cv.key === "createDate" && cv.op === Op.lte,
      );
      const [gte, lte] = timeArr;
      if (gteCondition) {
        gteCondition.value = gte;
      }
      if (lteCondition) {
        lteCondition.value = lte;
      }
      return draftQuery;
    },
  );

  const onClick = usePersistFn(() => {
    // 确保点击刷新按钮时获得的是最新的数据
    let timeArr: [string, string];
    if (!lastDays && timeRange?.from && timeRange?.to) {
      timeArr = [
        dayjs(timeRange.from).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(timeRange.to).format("YYYY-MM-DD HH:mm:ss"),
      ];
    } else {
      timeArr = getTimeCondition().map<string>((cv) => cv.value!) as [
        string,
        string,
      ];
    }
    const newQuery = produce(query, (draft) => {
      return changeTimeCondition(draft, timeArr);
    });
    refetchAll(newQuery);
  });

  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const selectDayOptions = [
    {
      key: "last3Days",
      value: 3,
      label: intl.formatMessage({ id: "last3Days", defaultMessage: "Last 3 days" }),
    },
    {
      key: "last7Days",
      value: 7,
      label: intl.formatMessage({ id: "last7Days", defaultMessage: "Last 7 days" }),
    },
    {
      key: "lastMonth",
      value: 30,
      label: intl.formatMessage({
        id: "lastMonth",
        defaultMessage: "Recent 1 Month",
      }),
    },
    {
      key: "custom",
      value: 0,
      label: intl.formatMessage({ id: "custom", defaultMessage: "Custom" }),
    },
  ];

  return (
    <div className={style.toolbar}>
      <div className="flex justify-between">
        <div>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              onClick={() => onClick()}
              icon={<Icon type="refresh" />}
            />
            <Select
              width="s"
              onChange={(value: number) => {
                setLastDays(value);
                setShowTimePicker(value === 0);
                if (value === 0) {
                  const cv = getTimeCondition();
                  setTimeRange({
                    from: dayjs(cv[0].value).toDate(),
                    to: dayjs(cv[1].value).toDate(),
                  });
                }
              }}
              defaultValue={lastDays}
              options={
                fromSchedHistory ? selectDayOptions.slice(1) : selectDayOptions
              }
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
    </div>
  );
};

export default Toolbar;
