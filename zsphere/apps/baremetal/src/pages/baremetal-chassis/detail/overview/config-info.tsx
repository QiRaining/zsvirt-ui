import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { BaremetalChassis as IBaremetalChassis } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { useFormatHardwareInfos } from "../../config/useColumnConfig";

export interface IProps {
  detail: IBaremetalChassis;
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
  const { cpuNum, memorySizeSize, cpuModel } = useFormatHardwareInfos(detail);

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: "CPU",
        value: cpuNum,
      },
      {
        label: intl.formatMessage({
          id: "cpuModel",
          defaultMessage: "CPU Type",
        }),
        value: cpuModel,
      },
      {
        label: intl.formatMessage({
          id: "memory",
          defaultMessage: "Memory",
        }),
        value: memorySizeSize,
      },
      {
        label: intl.formatMessage({
          id: "ipmiAddress",
          defaultMessage: "IPMI Address",
        }),
        value: detail?.ipmiAddress,
      },
      {
        label: intl.formatMessage({
          id: "ipmiUsername",
          defaultMessage: "IPMI Username",
        }),
        value: detail?.ipmiUsername,
      },
      {
        label: intl.formatMessage({
          id: "ipmiPort",
          defaultMessage: "IPMI Port",
        }),
        value: detail?.ipmiPort,
      },
    ],
    [
      cpuNum,
      intl,
      cpuModel,
      memorySizeSize,
      detail?.ipmiAddress,
      detail?.ipmiUsername,
      detail?.ipmiPort,
    ],
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
