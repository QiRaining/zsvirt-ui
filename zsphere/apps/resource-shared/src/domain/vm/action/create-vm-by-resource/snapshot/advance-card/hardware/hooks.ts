import { gql, useQuery } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import type { VolumeList } from "@zstack/zsphere-types/graphql";
import type {
  CheckVNicAvailabilityResult,
  CheckVNicIpAvailabilityParam,
} from "@zstack/zsphere-types/graphql";
import { sortBy as _sortBy } from "lodash-es";
import { useMemo } from "react";

const checkVNicIpAvailability = gql`
  mutation checkVNicIpAvailability($input: CheckVNicIpAvailabilityParam!) {
    checkVNicIpAvailability(input: $input) {
      available
      duplicateIps
      l3Network {
        uuid
        name
      }
    }
  }
`;

const volumeList = gql`
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
        # cdpTaskStatus
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
            vmTemplateVolumeCacheSize
            imageCacheSize
            systemUsedCapacity
            volumeSize
            overProvisioningPrimaryStorage
            volumeSnapshotSize
            reservedCapacity
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
          # cdpTaskStatus
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
    }
  }
`;

const useQueryReleatedResource = (vmUuid: string, volumeUuids: string[]) => {
  const { data: volumeData, loading: volumeLoading } = useQuery<{
    volumeList: VolumeList;
  }>(volumeList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          op: Op.in,
          values: volumeUuids,
        },
      ],
      vmInstanceUuid: vmUuid,
      limit: 100,
    },
  });

  const result = useMemo(() => {
    if (volumeLoading) {
      return {
        volumeList: [],
      };
    }

    const _volumeList = volumeData?.volumeList?.list ?? [];
    const formatedVolumeData = _volumeList.map((t: any) => {
      return {
        ...t,
        diskType: "volume",
      };
    });

    return {
      volumeList: _sortBy(formatedVolumeData, [
        (volume) => new Date(volume.lastAttachDate!).valueOf(),
        "deviceId",
      ]),
    };
  }, [volumeLoading, volumeData, vmUuid]);

  return result;
};

const useCheckVNicIpAvailability = () => {
  const [remoteCheckVNicIpAvailability, { data, loading }] = useMutation<
    { checkVNicIpAvailability: CheckVNicAvailabilityResult },
    {
      input: CheckVNicIpAvailabilityParam;
    }
  >(checkVNicIpAvailability);

  return {
    loading,
    data,
    remoteCheckVNicIpAvailability,
  };
};

export { useQueryReleatedResource, useCheckVNicIpAvailability };
