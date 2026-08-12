import { Icon } from "@zstack/icon";
import {
  IconState,
  ItemList,
  List,
  ResourceName,
} from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  detail: IVM;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  setEditConfigVisible: (visible: boolean) => void;
}
export const vmGroupAuth = {
  authKey: "vm.group",
  type: "block" as const,
  resource: "vm",
};
const RelativeResource: React.FC<IProps> = ({
  _setEditConfigVisible,
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const list = useMemo(() => {
    const _host = detail?.host ?? detail?.lastHost;

    return [
      {
        label: intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" }),
        value: (
          <ResourceName
            value={detail.cluster?.name}
            icon={<Icon type="server-1" colorNumber={600} size={16} />}
            link={{
              uuid: detail.cluster?.uuid,
              to: "/cluster",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.ClusterHost,
            }}
          />
        ),
      },
      // {
      //   label: intl.formatMessage({ id: 'host', defaultMessage: '主机' }),
      //   value: (
      //     <ResourceName
      //       value={host?.name ?? host?.uuid}
      //       icon={
      //         host?.state ? (
      //           <IconState
      //             className={styles.hostIcon}
      //             resourceKey="hard-drive"
      //             size={16}
      //             state={host?.state ?? -1}
      //             color="info"
      //             colorNumber={600}
      //           />
      //         ) : undefined
      //       }
      //       link={{
      //         uuid: host?.uuid,
      //         to: '/host',
      //         microAppName: 'virtualization-resource',
      //         leftnav: LeftNavType.ClusterHost
      //       }}
      //     />
      //   )
      // },
      {
        label: intl.formatMessage({
          id: "primary.storage",
          defaultMessage: "Data Storage",
        }),
        value: (
          <ResourceName
            value={detail.primaryStorage?.name}
            icon={
              <IconState
                className={styles.hostIcon}
                resourceKey="storage-3"
                size={16}
                state={detail?.primaryStorage?.state ?? -1}
                color="info"
                colorNumber={600}
              />
            }
            link={{
              uuid: detail.primaryStorage?.uuid,
              to: "/primary-storage",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.DataStorage,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "network", defaultMessage: "Network" }),
        number: detail.vmNics?.length,
        value: !!detail.vmNics?.length && (
          <ItemList
            toggle
            ellipsis
            needWrap
            value={detail.vmNics?.map((vmnic) => (
              <ResourceName
                key={vmnic.uuid}
                value={vmnic.l3Network?.name}
                icon={
                  <Icon
                    type="dportgroup"
                    colorNumber={600}
                    size={16}
                    color="info"
                  />
                }
                link={{
                  uuid: vmnic.l3Network?.uuid,
                  to: "/l3-network",
                  microAppName: "virtualization-resource",
                  leftnav: LeftNavType.Network,
                }}
              />
            ))}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "roleApiModule.vm-group",
          defaultMessage: "VM Scheduling Group",
        }),
        auth: vmGroupAuth,
        value: (
          <ResourceName
            canModify
            value={detail?.vmGroup?.name}
            link={{
              microAppName: "virtualization-reliability",
              to: `/vm-scheduling-rule/vm-group`,
              from: LeftNavType.ClusterHost,
              uuid: detail?.vmGroup?.uuid,
              zoneUuid: detail?.zoneUuid,
            }}
          />
        ),
      },
      //先注释
      // {
      //   label: intl.formatMessage({ id: 'snapshot.policy', defaultMessage: '快照策略' }),
      //   number: detail.snapshotSchedulerJob?.length,
      //   value: (
      //     <ItemList
      //       toggle
      //       ellipsis
      //       needWrap
      //       value={
      //         detail.snapshotSchedulerJob?.map(item => (
      //           <ResourceName
      //             canModify
      //             value={item?.name}
      //             link={{
      //               microAppName: 'resource-pool',
      //               to: '/vm-scheduling-rule/vm-group',
      //               uuid: item?.uuid
      //             }}
      //           />
      //         ))!
      //       }
      //     />
      //   )
      // }
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
