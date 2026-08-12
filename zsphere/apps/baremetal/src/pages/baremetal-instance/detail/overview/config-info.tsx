import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

export interface IProps {
  detail: IBaremetalInstance;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  serRouterTabTarget?: (prop: string) => void;
}

const RelativeObject: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();

  const { hardwareInfo, managementIp, port } = detail;

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: "CPU",
        value: `${hardwareInfo?.cpuNum} ${intl.formatMessage({
          id: "cpuCore",
          defaultMessage: "Cores",
        })} `,
      },
      {
        label: intl.formatMessage({
          id: "cpuModel",
          defaultMessage: "CPU Type",
        }),
        value: hardwareInfo?.cpuModel,
      },
      {
        label: intl.formatMessage({
          id: "memory",
          defaultMessage: "Memory",
        }),
        value: formatBytesToSize(hardwareInfo?.memory),
      },
      {
        label: intl.formatMessage({
          id: "default.ip",
          defaultMessage: "Default IP",
        }),
        value: managementIp,
      },
      {
        label: intl.formatMessage({
          id: "ipmiPort",
          defaultMessage: "IPMI Port",
        }),
        value: port,
      },
    ],
    [hardwareInfo, intl, managementIp, port],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeObject;
