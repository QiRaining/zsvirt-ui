import type {
  IDraggableCardProps,
  IBusinessMonitorProps,
} from "@zstack/zsphere-components";
import { BusinessMonitor } from "@zstack/zsphere-components";
import type { FC } from "react";
import { useIntl } from "react-intl";

import MemoryChart from "./memory-chart";

const { MonitorCard } = BusinessMonitor;
interface IProps {
  monitorKeys: string[];
  monitorProps: IBusinessMonitorProps;
  cardProps: IDraggableCardProps;
}

const MemoryCard: FC<IProps> = ({ monitorKeys, monitorProps, cardProps }) => {
  const intl = useIntl();

  return (
    <MonitorCard
      title={intl.formatMessage({
        id: "memory",
        defaultMessage: "Memory",
      })}
      monitorKeys={monitorKeys}
      {...cardProps}
    >
      <MemoryChart monitorKey="" {...monitorProps} />
    </MonitorCard>
  );
};

export default MemoryCard;
