import type { IDraggableCardProps } from "@zstack/zsphere-components";
import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import IPChart from "./ip-chart";

const { MonitorCard } = BusinessMonitor;
interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const IPCard: FC<IProps> = ({ monitorKeys, monitorProps, cardProps }) => {
  const intl = useIntl();

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "monitor.data",
        defaultMessage: "Monitoring Data",
      })}
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <IPChart monitorKey="" {...monitorProps} />
    </MonitorCard>
  );
};

export default IPCard;
