import { Icon } from "@zstack/icon";
import {
  DraggableCard,
  IconState,
  ItemList,
  List,
  ResourceName,
} from "@zstack/zsphere-components";
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
  authKey: "list",
  type: "view" as const,
  resource: "virtualization.vmGroup",
};

const RelativeResource: React.FC<IProps> = ({
  _setEditConfigVisible,
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const list = useMemo(() => {
    const host = detail?.host ?? detail.lastHost;

    return [
      {
        label: intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" }),
        value: (
          <ResourceName
            value={detail.cluster?.name}
            icon={<Icon type="server-1" />}
            link={{
              uuid: detail.cluster?.uuid,
              to: "/cluster",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.ClusterHost,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "host", defaultMessage: "Host" }),
        value: (
          <ResourceName
            value={host?.name ?? host?.uuid}
            icon={
              host?.state ? (
                <IconState
                  className={styles.hostIcon}
                  resourceKey="hard-drive"
                  state={host?.state ?? -1}
                />
              ) : undefined
            }
            link={{
              uuid: host?.uuid,
              to: "/host",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.ClusterHost,
            }}
          />
        ),
      },
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
                icon={<Icon type="dportgroup" />}
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
            isRouterManaged
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "snapshot.strategy",
          defaultMessage: "Snapshot Policy",
        }),
        value: detail?.snapshotSchedulerJob?.[0]?.schedulerJobGroup?.[0] && (
          <ResourceName
            value={detail.snapshotSchedulerJob[0].schedulerJobGroup[0].name}
            link={{
              microAppName: "virtualization-data-protection",
              to: "/snapshot/strategy",
              uuid: detail.snapshotSchedulerJob[0].schedulerJobGroup[0].uuid,
            }}
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
      className={styles.relativeObject}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeResource;
