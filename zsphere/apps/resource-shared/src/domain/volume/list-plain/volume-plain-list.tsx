import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { Volume as IVolume } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const QUERY_VOLUME_LIST = gql`
  fragment volumeFields on Volume {
    uuid
    name
    description
    primaryStorageUuid
    vmInstanceUuid
    deviceId
    installPath
    type
    format
    size
    actualSize
    state
    status
    diskOfferingUuid
    rootImageUuid
    isHaveMemorySnapshot
    createDate
    isHaveSnapshot
    lastOpDate
    isShareable
    volumeQos
    backupTaskType
    backupStatus
    lastDetachDate
    lastAttachDate(vmInstanceUuid: $vmInstanceUuid)
    backupTaskStatus
    lastVmInstanceUuid
    primaryStorage {
      uuid
      name
      type
      availableCapacity
      primaryStorageCapacity {
        availablePhysicalCapacity
        overProvisioningPrimaryStorage
        thresholdPrimaryStoragePhysicalCapacity
        reservedCapacity
        volumeSnapshotSize
        imageCacheSize
        volumeSize
        vmTemplateVolumeCacheSize
      }
      storageCapacityForLocalStorage {
        totalPhysicalCapacity
        availablePhysicalCapacity
        reservedPhysicalCapacity
      }
      zone {
        uuid
        name
      }
    }
    rootImage {
      name
      uuid
      size
    }
    lastVmOrTemplate {
      uuid
    }
    vmInstance {
      name
      uuid
      state
      type
      zoneUuid
      hypervisorType
      clusterUuid
    }
    owner {
      name
      uuid
      type
      linkedAccountUuid
    }
    bandwidth {
      volumeUuid
      volumeBandwidth
      volumeBandwidthRead
      volumeBandwidthWrite
      iopsTotal
      iopsRead
      iopsWrite
      volumeBandwidthUpthreshold
      volumeBandwidthReadUpthreshold
      volumeBandwidthWriteUpthreshold
    }
    systemTag {
      WWN
      VirtioSCSI
      notSupportActualSize
      volumeAttributeUserConfig
      VolumeProvisioningStrategy
      capability
      cephStoragePool
    }
    tag {
      ownerUuid
      name
      uuid
      color
    }
    relatedResource {
      backupData
    }
    resourceConfig {
      vmcacheMode
      aionative
    }
  }

  query volumeList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: VolumeQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $vmInstanceUuid: String
  ) {
    volumeList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        ...volumeFields
      }
    }
  }
`;

export interface IVolumePlainListProps extends Omit<
  ITableListProps<IVolume>,
  "gql"
> {
  toolbar?: ITableListProps<IVolume>["toolbar"];
  gql?: DocumentNode;
  source?: any;
}

const VolumePlainList: React.FC<IVolumePlainListProps> = ({
  actionConfig,
  columnConfig,
  queryConfig,
  ...props
}) => {
  const intl = useIntl();

  const defaultQueryConfig = useQueryConfig({
    view: props.view,
    defaultQuery: props.defaultQuery,
  });

  const defaultColumnConfig = useColumnConfig({
    view: props.view,
  });

  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IVolume>["actionConfig"];

  const volumeActions: ITableListProps<IVolume>["toolbar"] = [
    "refresh",
    "operation",
    "search",
    "setting",
  ];
  const [update, forceUpdate] = useState<number>(1);

  useActionSubscribe({
    resourceTypeList: ["SchedulerJobForVmAndVolume"],
    onFinish: () => {
      forceUpdate((pv) => pv + 1);
    },
  });

  const _toolbar: ITableListProps<IVolume>["toolbar"] = props.view?.startsWith(
    "sub",
  )
    ? volumeActions
    : [...volumeActions, "export"];

  return (
    <TableList
      key={update}
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={QUERY_VOLUME_LIST}
      type="Volume"
      resource="volume"
      toolbar={_toolbar}
      toolbarHandleTooltip={
        props.view === "main" && (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "volume.list.tooltip",
              defaultMessage: `### Volume
1. To attach a VirtIO volume to a virtual machine, make sure that a VirtIO driver is installed on the virtual machine.

  - Mainstream Linux distributions such as CentOS 6 and CentOS 7 are integrated with VirtIO drivers. Therefore, you do not need to install them again.
  - For Windows-based virtual machines, you need to install VirtIO drivers manually by installing GuestTools on the VM details page.
2. When you create a volume, if you did not select a primary storage or attach the volume to a virtual machine, this volume will be uninstantiated.
3. You can attach up to 24 data volumes to a virtual machine.`,
            })}
          </ReactMarkdown>
        )
      }
      {...props}
    />
  );
};

export default VolumePlainList;
