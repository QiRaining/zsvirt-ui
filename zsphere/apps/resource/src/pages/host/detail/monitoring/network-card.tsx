import type {
  IDraggableCardProps,
  IBusinessMonitorProps,
} from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import { useState } from "react";
import { useIntl } from "react-intl";

import NetworkChart from "./network-chart";

const { MonitorSelect, MonitorCard } = BusinessMonitor;

interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const NetworkCard: FC<IProps> = ({ monitorKeys, monitorProps, cardProps }) => {
  const { namespace, uuid, resourceKey } = monitorProps;
  const [labels, setLabels] = useState<string[]>([]);

  const intl = useIntl();
  const labelName = "NetworkDeviceLetter";

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "nic",
        defaultMessage: "NIC",
      })}
      extra={
        <MonitorSelect
          namespace={namespace}
          metricName="NetworkOutBytes"
          labelName={labelName}
          filterLabels={`${resourceKey}=${uuid}`}
          labels={labels}
          setLabels={setLabels}
        />
      }
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <NetworkChart
        monitorKey=""
        labelName={labelName}
        labels={labels}
        isEmpty={labels.length === 0}
        {...monitorProps}
      />
    </MonitorCard>
  );
};

export default NetworkCard;
