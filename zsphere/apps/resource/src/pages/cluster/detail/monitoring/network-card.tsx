import type { IDraggableCardProps } from "@zstack/zsphere-components";
import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import NetworkChart from "./network-chart";

const { MonitorCard } = BusinessMonitor;
interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const NetworkCard: FC<IProps> = ({ monitorKeys, monitorProps, cardProps }) => {
  const intl = useIntl();

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "nic",
        defaultMessage: "NIC",
      })}
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <NetworkChart monitorKey="" {...monitorProps} />
    </MonitorCard>
  );
};

export default NetworkCard;
