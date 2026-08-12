import type {
  IDraggableCardProps,
  IBusinessMonitorProps,
} from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import CPUChart from "./cpu-chart";

const { MonitorSelect, MonitorCard } = BusinessMonitor;

interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const CPUCard: FC<IProps> = ({ monitorKeys, monitorProps, cardProps }) => {
  const { namespace, uuid, resourceKey } = monitorProps;
  const [labels, setLabels] = useState(["Average"]);

  const intl = useIntl();
  const labelName = "CPUNum";

  const staticOptions = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "average",
          defaultMessage: "Average",
        }),
        value: "Average",
      },
    ];
  }, [intl]);

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
          labels={labels}
          setLabels={setLabels}
          staticOptions={staticOptions}
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
        {...monitorProps}
      />
    </MonitorCard>
  );
};

export default CPUCard;
