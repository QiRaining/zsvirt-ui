import { DraggableCard } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import { includes } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IPrimaryStorage;
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
    const _list = [
      {
        label: intl.formatMessage({
          id: "virtualization.data.center",
          defaultMessage: " Data Center",
        }),
        value: (
          <ResourceName
            value={detail?.zone?.name}
            link={{
              uuid: detail?.zoneUuid,
              to: "/zone",
              microAppName: "virtualization-resource",
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "clusterNum",
          defaultMessage: "Clusters",
        }),
        value: detail?.attachedClusterUuids?.length || 0,
      },
      {
        label: intl.formatMessage({
          id: "virtualMachine.num",
          defaultMessage: "VMs",
        }),
        value: detail?.vmInstanceCount,
      },
    ];

    if (includes(["Ceph"], detail?.type)) {
      _list.push({
        label: intl.formatMessage({
          id: "monitoringNode.num",
          defaultMessage: "Monitoring Node Count",
        }),
        value: detail?.mons?.length || 0,
      });
    }

    return _list;
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
