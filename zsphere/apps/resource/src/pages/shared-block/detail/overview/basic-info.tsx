import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { Constant, List } from "@zstack/zsphere-components";
import type { SharedBlock } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps {
  current: SharedBlock;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        value: current?.name,
      },
      {
        label: intl.formatMessage({ id: "state", defaultMessage: "State" }),
        value: current?.state && <Constant value={current.state} />,
      },
      {
        label: intl.formatMessage({
          id: "ready.state",
          defaultMessage: "Status",
        }),
        value: current?.status && <Constant value={current.status} />,
      },
      {
        label: intl.formatMessage({
          id: "lunDevice",
          defaultMessage: "LUN",
        }),
        value: current?.diskUuid,
      },
      {
        label: intl.formatMessage({ id: "lun.source", defaultMessage: "Source" }),
        value: current?.source,
      },
      {
        label: intl.formatMessage({ id: "uuid", defaultMessage: "UUID" }),
        copyable: true,
        value: current?.uuid,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value:
          current?.createDate &&
          getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ];
  }, [current, intl, getServerTime]);

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
