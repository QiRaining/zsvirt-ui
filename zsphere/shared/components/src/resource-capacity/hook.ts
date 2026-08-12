import { gql, useQuery } from "@apollo/client";
import {
  HostCpuMemoryCapacity as IHostCpuMemoryCapacity,
  PrimaryStorageCapacity as IPrimaryStorageCapacity,
  LocalStorageHostCapacity as ILocalStorageCapacity,
  QueryhostCpuMemoryCapacityArgs,
  QuerylocalStorageHostCapacityArgs,
  QueryprimaryStorageCapacityArgs,
} from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

const hostCpuMemoryCapacityGql = gql`
  query hostCpuMemoryCapacity(
    $zoneUuids: [String!]
    $clusterUuids: [String!]
    $hostUuids: [String!]
  ) {
    hostCpuMemoryCapacity(
      zoneUuids: $zoneUuids
      clusterUuids: $clusterUuids
      hostUuids: $hostUuids
    ) {
      hostUuids
      totalMemory
      reservedMemory
      reservedPhysicalMemory
      overProvisioningTotalMemory
      overProvisioningAvailableMemory
      overProvisioningMemory
      availableMemory
      totalPhysicalMemory
      availablePhysicalMemory
      availableCpu
      totalCpu
      cpuNum
      cpuSockets
      totalCpuGHz
      timestamp
      CPUAllUsedUtilization
      MemoryUsedInPercent
      MemoryFreeBytes
      MemoryUsedBytes
    }
  }
`;

export function useHostCpuMemoryCapacity(
  variables?: QueryhostCpuMemoryCapacityArgs,
) {
  const {
    data: originData,
    loading,
    refetch,
  } = useQuery<{ hostCpuMemoryCapacity: IHostCpuMemoryCapacity }>(
    hostCpuMemoryCapacityGql,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    },
  );

  const data = useMemo(() => {
    return originData?.hostCpuMemoryCapacity || {};
  }, [originData]);

  return {
    data,
    loading,
    refetch,
  };
}

const primaryStorageCapacityGql = gql`
  query primaryStorageCapacity(
    $zoneUuids: [String!]
    $primaryStorageUuids: [String!]
  ) {
    primaryStorageCapacity(
      zoneUuids: $zoneUuids
      primaryStorageUuids: $primaryStorageUuids
    ) {
      primaryStorageUuids
      availableCapacity
      reservedCapacity
      totalCapacity
      overProvisioningPrimaryStorage
      availablePhysicalCapacity
      reservedPhysicalCapacity
      totalPhysicalCapacity
      systemUsedCapacity
      volumeSnapshotSize
      imageCacheSize
      volumeSize
      vmTemplateVolumeCacheSize
      timestamp
    }
  }
`;

export function usePrimaryStorageCapacity(
  variables?: QueryprimaryStorageCapacityArgs,
) {
  const {
    data: originData,
    loading,
    refetch,
  } = useQuery<{ primaryStorageCapacity: IPrimaryStorageCapacity }>(
    primaryStorageCapacityGql,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    },
  );

  const data = useMemo(() => {
    return originData?.primaryStorageCapacity || {};
  }, [originData]);

  return {
    data,
    loading,
    refetch,
  };
}

const localStorageCapacityGql = gql`
  query localStorageHostCapacity(
    $hostUuid: String!
    $primaryStorageUuid: String
  ) {
    localStorageHostCapacity(
      hostUuid: $hostUuid
      primaryStorageUuid: $primaryStorageUuid
    ) {
      hostUuid
      primaryStorageUuid
      availableCapacity
      totalCapacity
      overProvisioningPrimaryStorage
      availablePhysicalCapacity
      reservedCapacity
      reservedPhysicalCapacity
      totalPhysicalCapacity
      systemUsedCapacity
      volumeSnapshotSize
      imageCacheSize
      volumeSize
      vmTemplateVolumeCacheSize
    }
  }
`;

export function useLocalStorageCapacity(
  variables?: QuerylocalStorageHostCapacityArgs,
) {
  const {
    data: originData,
    loading,
    refetch,
  } = useQuery<{ localStorageHostCapacity: ILocalStorageCapacity }>(
    localStorageCapacityGql,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    },
  );

  const data = useMemo(() => {
    return originData?.localStorageHostCapacity || {};
  }, [originData]);

  return {
    data,
    loading,
    refetch,
  };
}
