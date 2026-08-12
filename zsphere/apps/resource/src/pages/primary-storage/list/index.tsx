import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { PrimaryStorageVO } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useDefaultResourceAttributeConfig } from "../../../components/resource-attribute";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const PRIMARY_STORAGE_LIST = gql`
  query primaryStorageList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $type: PrimaryStorageQueryType
    $extraConditions: [Condition!]
  ) {
    primaryStorageList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      type: $type
      replyWithCount: true
    ) {
      total
      list {
        uuid
        name
        description
        createDate
        lastOpDate
        attachedClusterUuids
        reservedCapacity
        reservedPhysicalCapacity
        availableCapacity
        availablePhysicalCapacity
        fsid
        defaultProtocol
        mons {
          hostname
        }
        mountPath
        pools {
          uuid
          type
          aliasName
          poolName
          availableCapacity
        }
        sharedBlockGroupType
        sharedBlocks {
          uuid
          name
        }
        state
        status
        systemUsedCapacity
        totalCapacity
        totalPhysicalCapacity
        type
        url
        volumeCount
        vmInstanceCount
        cbdMdsCount
        systemTag {
          nocephx
          thinProvision
          thinProvisionUuid
          gatewayCidr
          rootVolumePoolName
          dataVolumePoolName
          imageCachePoolName
          nfsMountOptions
          cephToken
          cephVendor
          coldMigrateNetwork
        }
        expired {
          isExpired
          dayDifference
        }
        zone {
          uuid
          name
        }
        clusters {
          uuid
          name
        }
        primaryStorageCapacity {
          totalPhysicalCapacity
          availablePhysicalCapacity
          overProvisioningPrimaryStorage
          thresholdPrimaryStoragePhysicalCapacity
          systemUsedCapacity
          reservedCapacity
          volumeSnapshotSize
          imageCacheSize
          volumeSize
          vmTemplateVolumeCacheSize
        }
        storageCapacityForLocalStorage {
          reservedPhysicalCapacity
          totalPhysicalCapacity
          availablePhysicalCapacity
          availableCapacity
        }
        zoneUuid
      }
    }
  }
`;

export default function PrimaryStorageList(
  props: IListProps<PrimaryStorageVO> & { gql?: any },
) {
  const intl = useIntl();
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({
    view: props.view,
    defaultQuery: props.defaultQuery,
  });
  const resourceAttributeConfig = useDefaultResourceAttributeConfig();

  const subViewToolbarHandleTooltip = props.view === "main" && (
    <ReactMarkdown>
      {intl.formatMessage({
        id: "primaryStorage.tab.have.tooltip",
        defaultMessage: "### Primary Storage\n\n1. A primary storage is a storage server used to store disk files, such as root volumes, data volumes, root volume snapshots, data volume snapshots, and image caches, for virtual machines.\n2. Supported types: LocalStorage, NFS, SharedMountPoint, Ceph, and SharedBlock.\n3. Notice:\n    - Make sure that the IP address, user name, and password are correct, and the user has the sudo permission.\n    - Make sure that the read/write permission is provided for directories provided by NFS and SharedMountPoint primary storages.\n    - Make sure that the IP address of the management node can access the corresponding SSH port to deploy software and agents.",
      })}
    </ReactMarkdown>
  );

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={props?.gql ?? PRIMARY_STORAGE_LIST}
      type="PrimaryStorageVO"
      resource="primary.storage"
      toolbarHandleTooltip={subViewToolbarHandleTooltip}
      toolbar={["search", "refresh", "operation", "setting"]}
      resourceAttributeConfig={resourceAttributeConfig}
      {...props}
    />
  );
}
