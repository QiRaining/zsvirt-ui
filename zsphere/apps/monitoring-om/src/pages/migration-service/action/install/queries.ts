import { gql } from "@apollo/client";

export const INSTALL_MIGRATION_SERVICE = gql`
  mutation installMigrationService($input: InstallMigrationServiceInput!) {
    installMigrationService(input: $input) {
      actionId
    }
  }
`;

export const getZoneList = gql`
  query zoneList($conditions: [Condition!], $start: Int, $limit: Int) {
    zoneList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
      sortDirection: asc
    ) {
      total
      list {
        uuid
        name
      }
    }
  }
`;

export const queryClusterForZSVCreateInstance = gql`
  query queryClusterForZSVCreateInstance(
    $start: Int
    $limit: Int
    $type: ClusterQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $conditions: [Condition!]
    $extraConditions: [Condition!]
  ) {
    clusterList(
      start: $start
      limit: $limit
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      conditions: $conditions
      extraConditions: $extraConditions
      replyWithCount: true
    ) {
      total
      list {
        name
        uuid
        architecture
        clusterKVMCpuModel
        type
        state
        hypervisorType
        hostNum
        zoneUuid
      }
    }
  }
`;

export const queryHostForZSVCreateInstance = gql`
  query queryHostForZSVCreateInstance(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $topNumber: Int
    $fields: [String!]
    $type: HostQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    hostList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      fields: $fields
      limit: $limit
      topNumber: $topNumber
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        name
        uuid
        architecture
        hypervisorType
        state
        status
        hostNodeInfo {
          nodeType
        }
        cluster {
          name
          uuid
          clusterKVMCpuModel
          resourceConfigValue {
            vmVideoType
            haVmHaLevel
            vmVmHaAcrossClusters
            vmEmulateHyperV
            kvmAutoSetVmNicMultiqueue
          }
        }
        hostSystemInfo {
          hostCpuModelName
          cpuGHz
        }
      }
      total
    }
  }
`;

export const CHECK_IP_AVAILABILITY = gql`
  mutation checkIpAvailability($input: CheckIpAvailabilityParam!) {
    checkIpAvailability(input: $input) {
      available
    }
  }
`;
