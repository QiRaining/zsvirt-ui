import { DraggableCard, List, ResourceName } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: HostVO;
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
          id: "data.center",
          defaultMessage: " Data Center",
        }),
        value: (
          <ResourceName
            value={detail.zone?.name}
            link={{
              uuid: detail.zone?.uuid,
              to: "/zone",
              microAppName: "virtualization-resource",
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" }),
        value: (
          <ResourceName
            value={detail.cluster?.name}
            link={{
              uuid: detail.cluster?.uuid,
              to: "/cluster",
              microAppName: "virtualization-resource",
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "host.group",
          defaultMessage: "Host Scheduling Group",
        }),
        auth: {
          authKey: "host.group",
          resource: "host",
          type: "block",
        },
        value: (
          <ResourceName
            value={detail?.hostGroup?.name}
            link={{
              microAppName: "virtualization-reliability",
              to: `/vm-scheduling-rule/host-group`,
              from: LeftNavType.ClusterHost,
              uuid: detail?.hostGroup?.uuid,
              zoneUuid: detail?.zone?.uuid,
            }}
          />
        ),
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
