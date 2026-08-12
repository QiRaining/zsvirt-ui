import type { ISelectProps, ISelectOption } from "@zstack/zsphere-components";
import { Select } from "@zstack/zsphere-components";
import type { SchedulerJobHistory } from "@zstack/zsphere-types/graphql";
import { groupBy } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import type { StatusType } from "./status";
import { getStatus, formatStatusText } from "./status";

import style from "./style.module.less";

export interface IResultFilterProps extends ISelectProps {
  historyList?: SchedulerJobHistory[];
}

export type OptionValueType = StatusType | "all.result";

export default function ResultFilter({
  historyList,
  ...props
}: IResultFilterProps) {
  const intl = useIntl();
  const options = useMemo<ISelectOption[]>(() => {
    const optionMap = groupBy(historyList, getStatus);
    const keys = Object.keys(optionMap);
    return [
      {
        label: `${intl.formatMessage({
          id: "all.result",
          defaultMessage: "All Results",
        })} (${historyList?.length ?? 0})`,
        value: "all.result",
      },
      ...keys.map((value) => ({
        label: `${formatStatusText(intl, value as StatusType)} (${
          optionMap[value].length
        })`,
        value,
      })),
    ];
  }, [historyList, intl]);
  return (
    <Select
      width={120}
      className={style.resultFilter}
      dropdownMatchSelectWidth={false}
      bordered={false}
      options={options}
      defaultValue="all.result"
      {...props}
    />
  );
}
