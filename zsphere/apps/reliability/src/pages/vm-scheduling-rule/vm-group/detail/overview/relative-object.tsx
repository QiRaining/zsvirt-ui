import { List, ResourceName, DraggableCard } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { VmGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: VmGroup;
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
    const { zone } = detail;

    return [
      {
        label: intl.formatMessage({
          id: "data.center",
          defaultMessage: " Data Center",
        }),
        value: (
          <ResourceName
            value={zone?.name}
            link={{
              to: "/zone",
              microAppName: "virtualization-resource",
              uuid: zone?.uuid,
              leftnav: LeftNavType.ClusterHost,
              keepState: true,
            }}
            isRouterManaged
          />
        ),
      },
    ];
  }, [detail, intl]);

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
