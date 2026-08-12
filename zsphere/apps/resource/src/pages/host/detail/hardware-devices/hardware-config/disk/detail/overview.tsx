import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { HostBlockDevices } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps {
  current: HostBlockDevices;
}

export default function Overview({ current }: IProps) {
  const intl = useIntl();

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({ id: "device", defaultMessage: "Device" }),
        value: current.name,
      },
      {
        label: intl.formatMessage({ id: "model", defaultMessage: "Model" }),
        value: current.model,
      },
      {
        label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
        value: current.mediaType,
      },
      {
        label: intl.formatMessage({
          id: "serial.number",
          defaultMessage: "Serial Number",
        }),
        value: current.serialNumber,
      },
      {
        label: intl.formatMessage({ id: "capacity", defaultMessage: "Capacity" }),
        value: formatStorage(current.size ?? 0, 2),
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
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
