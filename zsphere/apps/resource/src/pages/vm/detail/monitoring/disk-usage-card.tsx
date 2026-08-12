import type { IDraggableCardProps } from "@zstack/zsphere-components";
import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import DiskUsageChart from "./disk-usage-chart";

const { MonitorSelect, MonitorCard } = BusinessMonitor;

interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
  zwatchState?: string;
}

const DiskUsageCard: FC<IProps> = ({
  zwatchState,
  monitorKeys,
  monitorProps,
  cardProps,
}) => {
  const { namespace, uuid, resourceKey } = monitorProps;
  const [labels, setLabels] = useState<string[]>([]);

  const intl = useIntl();
  const labelName = "DiskDeviceLetter";

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "disk.usage.amount",
        defaultMessage: "Disk usage",
      })}
      extra={
        <MonitorSelect
          namespace={namespace}
          metricName="DiskUsedCapacityInPercent"
          labelName={labelName}
          filterLabels={`${resourceKey}=${uuid}`}
          labels={labels}
          setLabels={setLabels}
        />
      }
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <DiskUsageChart
        monitorKey=""
        labelName={labelName}
        labels={labels}
        isEmpty={labels.length === 0}
        zwatchState={zwatchState}
        {...monitorProps}
      />
    </MonitorCard>
  );
};

export default DiskUsageCard;
