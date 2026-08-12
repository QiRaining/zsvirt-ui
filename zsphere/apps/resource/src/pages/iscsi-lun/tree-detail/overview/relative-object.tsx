import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IIscsiLun;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const RelativeResource: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const list = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "virtualMachine.mounted.vm.num",
          defaultMessage: "Mounted VMs",
        }),
        value: detail?.scsiLunVmInstanceRefs?.length || 0,
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
