import type {
  IBusinessMonitorProps,
  IDraggableCardProps,
} from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import CapacityChart from "./capacity-chart";

const { MonitorCard } = BusinessMonitor;

export interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const CapacityCard: React.FC<IProps> = ({
  monitorKeys,
  monitorProps,
  cardProps,
}) => {
  const intl = useIntl();

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "capacity.monitor",
        defaultMessage: "Capacity Monitoring",
      })}
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <CapacityChart monitorKey="" {...monitorProps} />
    </MonitorCard>
  );
};

export default CapacityCard;
