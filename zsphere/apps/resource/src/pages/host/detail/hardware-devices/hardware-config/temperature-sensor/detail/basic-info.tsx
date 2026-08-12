import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant } from "@zstack/zsphere-components";
import type { Sensor } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { formatValue, renderStatus } from "../utils";

export interface IProps {
  current: Sensor;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        value: current.name,
      },
      {
        label: intl.formatMessage({
          id: "common.state",
          defaultMessage: "Status",
        }),
        value: renderStatus(current),
      },
      {
        label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
        value: <Constant value={current.type as any} />,
      },
      {
        label: intl.formatMessage({
          id: "current.read.value",
          defaultMessage: "Current Read Value",
        }),
        value: formatValue(intl, current),
      },
      {
        label: intl.formatMessage({
          id: "last.update.time",
          defaultMessage: "Last Updated",
        }),
        value: dayjs(current.lastUpdateTime).format("YYYY-MM-DD HH:mm:ss"),
      },
    ];
  }, [current, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      {...props}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
