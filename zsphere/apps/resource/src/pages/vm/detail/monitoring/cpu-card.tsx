import type { IDraggableCardProps } from "@zstack/zsphere-components";
import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import CPUChart from "./cpu-chart";

const { MonitorCard, MonitorSelect } = BusinessMonitor;

interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
  zwatchState?: string;
}

const CPUCard: FC<IProps> = ({
  zwatchState,
  monitorKeys,
  monitorProps,
  cardProps,
}) => {
  const { namespace, uuid, resourceKey } = monitorProps;
  const [labels, setLabels] = useState<string[]>(["Average"]);

  const intl = useIntl();
  const labelName = "CPUNum";

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "cpu",
        defaultMessage: "CPU",
      })}
      extra={
        <MonitorSelect
          namespace={namespace}
          metricName="CPUUsedUtilization"
          labelName={labelName}
          filterLabels={`${resourceKey}=${uuid}`}
          staticOptions={[
            {
              label: intl.formatMessage({
                id: "average",
                defaultMessage: "Average",
              }),
              value: "Average",
            },
          ]}
          labels={labels}
          setLabels={setLabels}
          selectFirstOption={false}
        />
      }
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <CPUChart
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

export default CPUCard;
