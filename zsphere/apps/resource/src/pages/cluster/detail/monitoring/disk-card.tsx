import type { IDraggableCardProps } from "@zstack/zsphere-components";
import type { IBusinessMonitorProps } from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import DiskChart from "./disk-chart";

const { MonitorCard } = BusinessMonitor;
interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const DiskCard: FC<IProps> = ({ monitorKeys, monitorProps, cardProps }) => {
  const intl = useIntl();

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "disk",
        defaultMessage: "Disk",
      })}
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <DiskChart monitorKey="" {...monitorProps} />
    </MonitorCard>
  );
};

export default DiskCard;
