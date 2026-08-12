import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { formatStorageToObj } from "@zstack/zsphere-utils";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps extends IDraggableCardProps {
  current?: SchedulerJobGroup;
}

export default function BasicInfo({ current, ...props }: IProps) {
  const intl = useIntl();
  const qos = useMemo(
    () => JSON.parse(current?.jobData || "{}"),
    [current],
  ).backupQosStruct;
  const empty = intl.formatMessage({
    id: "not.limited",
    defaultMessage: "Unlimited",
  });

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "download.bandwidth",
          defaultMessage: "Downstream Bandwidth",
        }),
        value: qos?.networkReadBandwidth
          ? formatBandwidth(qos.networkReadBandwidth)
          : empty,
      },
      {
        label: intl.formatMessage({
          id: "upload.bandwidth",
          defaultMessage: "Upstream Bandwidth",
        }),
        value: qos?.networkWriteBandwidth
          ? formatBandwidth(qos.networkWriteBandwidth)
          : empty,
      },
      {
        label: intl.formatMessage({
          id: "disk.read.speed",
          defaultMessage: "Disk Read Speed",
        }),
        value: qos?.volumeReadBandwidth
          ? formatDiskSpeed(qos.volumeReadBandwidth)
          : empty,
      },
      {
        label: intl.formatMessage({
          id: "disk.write.speed",
          defaultMessage: "Disk Write Speed",
        }),
        value: qos?.volumeWriteBandwidth
          ? formatDiskSpeed(qos.volumeWriteBandwidth)
          : empty,
      },
    ],
    [qos, intl, empty],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "advanced.config",
        defaultMessage: "Advanced Settings",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}

export function formatBandwidth(value: number) {
  const { number, unit } = formatStorageToObj(value, 0, "");
  return `${number} ${unit}bps`;
}

export function formatDiskSpeed(value: number) {
  const { number, unit } = formatStorageToObj(value);
  return `${number} ${unit}/s`;
}
