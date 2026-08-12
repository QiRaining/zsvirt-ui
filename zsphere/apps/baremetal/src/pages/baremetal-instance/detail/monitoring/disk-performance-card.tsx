import type { IDraggableCardProps } from "@zstack/zsphere-components";
import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import DiskChart from "./disk-chart";

const { MonitorSelect, MonitorCard } = BusinessMonitor;

interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const DiskPerformanceCard: FC<IProps> = ({
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
        id: "disk.performance",
        defaultMessage: "Disk Performance",
      })}
      extra={
        <MonitorSelect
          namespace={namespace}
          metricName="DiskReadRequestPerSecond"
          labelName={labelName}
          filterLabels={`${resourceKey}=${uuid}`}
          labels={labels}
          setLabels={setLabels}
        />
      }
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <DiskChart
        monitorKey=""
        labelName={labelName}
        labels={labels}
        isEmpty={labels.length === 0}
        {...monitorProps}
      />
    </MonitorCard>
  );
};

export default DiskPerformanceCard;
