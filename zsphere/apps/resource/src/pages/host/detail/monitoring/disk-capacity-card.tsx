import type {
  IDraggableCardProps,
  IBusinessMonitorProps,
} from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import { useIntl } from "react-intl";

import DiskCapacityChart from "./disk-capacity-chart";

const { MonitorCard } = BusinessMonitor;
interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const DiskCapacityCard: FC<IProps> = ({
  monitorKeys,
  monitorProps,
  cardProps,
}) => {
  const intl = useIntl();

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "disk.capacity",
        defaultMessage: "Disk Capacity",
      })}
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <DiskCapacityChart monitorKey="" {...monitorProps} />
    </MonitorCard>
  );
};

export default DiskCapacityCard;
