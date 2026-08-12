import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import { VmInstanceState } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import { formatStorage } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import type { DisplayLocationType } from "../../../types";

interface IProps {
  detail: any;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  displayLocation: DisplayLocationType;
}

const BasicInfo: React.FC<IProps> = ({ detail = {}, displayLocation }) => {
  const intl = useIntl();
  const {
    vmInstance = {},
    volumeSnapshotRefs,
    description,
    uuid,
    createDate,
    volume,
    totalSize,
    size,
  } = detail;
  const { getServerTime } = useTime();
  const vm = vmInstance || volume?.vmInstance?.[0] || {};
  const { name: vmName, uuid: vmUuid, state: vmState } = vm || {};
  const haveMemorySnapshot: boolean = !!volumeSnapshotRefs?.some(
    (ref: { volumeType: string }) => ref.volumeType === "Memory",
  );
  const resourceNameProps = {
    isRouterManaged: true,
    value: vmName,
    link: {
      uuid: vmUuid,
      to: "/vm",
      microAppName: "virtualization-resource",
      leftnav: LeftNavType.ClusterHost,
      keepState: false,
    },
  };

  const vmNameItem = useMemo(() => {
    if (vmState === VmInstanceState.Destroyed) {
      return <Text>{vmName}</Text>;
    }

    return displayLocation === "list" ? (
      <ResourceName {...resourceNameProps} />
    ) : (
      <Text>{vmName}</Text>
    );
  }, [vm, displayLocation, resourceNameProps]);

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.vm",
          defaultMessage: "Virtual Machine",
        }),
        value: vmNameItem,
      },
      {
        label: intl.formatMessage({
          id: "memory.snapshot",
          defaultMessage: "Memory Snapshot",
        }),
        value: haveMemorySnapshot
          ? intl.formatMessage({ id: "yes", defaultMessage: "Yes" })
          : intl.formatMessage({ id: "no", defaultMessage: "No" }),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.harddisk.count",
          defaultMessage: "Disks",
        }),
        value: volumeSnapshotRefs?.length ?? 1,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.totalCapacity",
          defaultMessage: "Total Capacity",
        }),
        value: formatStorage(totalSize || size || 0, 2),
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{uuid || ""}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: <LongText value={description || undefined} canModify />,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate!).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [detail, intl],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
