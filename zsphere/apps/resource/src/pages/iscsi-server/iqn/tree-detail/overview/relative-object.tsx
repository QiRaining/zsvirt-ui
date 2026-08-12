import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import { find, get, sumBy } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IIscsiServer;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  iscsiTargetUuid: string;
}

const RelativeResource: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
  iscsiTargetUuid,
}) => {
  const intl = useIntl();
  const iscsiTarget = find(get(detail, "iscsiTargets", []), {
    uuid: iscsiTargetUuid,
  });

  const lunTotal = get(iscsiTarget, ["iscsiLuns", "length"], 0) || 0;
  const usedLunNum =
    sumBy(
      get(iscsiTarget, "iscsiLuns", []),
      (iscsiLun) => iscsiLun?.scsiLunVmInstanceRefs?.length || 0,
    ) || 0;

  const list = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "virtualization.lun.num",
          defaultMessage: "LUNs",
        }),
        value: lunTotal,
      },
      {
        label: intl.formatMessage({
          id: "virtualMachine.used.lun.num",
          defaultMessage: "Used LUNs",
        }),
        value: usedLunNum,
      },
      {
        label: intl.formatMessage({
          id: "virtualMachine.unused.lun.num",
          defaultMessage: "Unused LUNs",
        }),
        value: lunTotal - usedLunNum,
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
