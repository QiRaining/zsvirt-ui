import { List, ResourceName } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: IL2Network;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const RelativeObject: React.FC<IProps> = ({
  current,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const list = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "dateCenter",
          defaultMessage: "Data Center",
        }),
        value: (
          <ResourceName
            value={current?.zone?.name}
            link={{
              uuid: current?.zone?.uuid,
              to: "/zone",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.Network,
            }}
          />
        ),
      },
      // {
      //   label: intl.formatMessage({ id: 'cluster', defaultMessage: '集群' }),
      //   number: current?.clusters?.length,
      //   value: (
      //     <ItemList
      //       toggle
      //       ellipsis
      //       needWrap
      //       value={
      //         current?.clusters?.map(cluster => (
      //           <ResourceName
      //             value={cluster?.name}
      //             link={{
      //               uuid: cluster?.uuid,
      //               to: '/cluster',
      //               microAppName: 'virtualization-resource',
      //               leftnav: LeftNavType.ClusterHost
      //             }}
      //           />
      //         )) ?? []
      //       }
      //     />
      //   )
      // }
    ];
  }, [current, intl]);

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

export default RelativeObject;
