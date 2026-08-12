import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import { get } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IIscsiServer;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const RelativeResource: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const lunDeviceUsageInfo = get(detail, "lunDeviceUsageInfo", {
    usedLunNum: 0,
    totalLunNum: 0,
    unusedLunNum: 0,
  });

  const list = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "virtualization.IQN.num",
          defaultMessage: "IQNs",
        }),
        value: detail?.iscsiTargets?.length,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.lun.num",
          defaultMessage: "LUNs",
        }),
        value: lunDeviceUsageInfo?.totalLunNum,
      },
      {
        label: intl.formatMessage({
          id: "virtualMachine.used.lun.num",
          defaultMessage: "Used LUNs",
        }),
        value: lunDeviceUsageInfo?.usedLunNum,
      },
      {
        label: intl.formatMessage({
          id: "virtualMachine.unused.lun.num",
          defaultMessage: "Unused LUNs",
        }),
        value: lunDeviceUsageInfo?.unusedLunNum,
      },
    ];
  }, [detail]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "relative.object",
        defaultMessage: "Related Objects",
      })}
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeResource;
