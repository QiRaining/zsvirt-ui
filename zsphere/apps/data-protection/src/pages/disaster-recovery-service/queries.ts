import { gql } from "@apollo/client";

export const GET_DISASTER_RECOVERY_SERVICE = gql`
  query disasterRecoveryService {
    disasterRecoveryService {
      status
      version
      managementAddress
      licenseSummary
      packageName
      packageVersion
      packageChecksum
      packageUrl
      localFileName
      storagePath
      uploadMethod
      target {
        clusterName
        hostName
        storageName
        managementNetwork
        spec
      }
      platformContext {
        platformType
        managementNodeAddress
        managementNodeUuid
        siteId
        suggestedSiteName
        certificateFingerprint
        bootstrapTokenState
        entrySource
      }
      selfChecks {
        code
        status
      }
      blockers {
        code
        count
      }
      taskLogs {
        id
        code
        status
        createdAt
      }
    }
  }
`;

export const RUN_DISASTER_RECOVERY_SERVICE_ACTION = gql`
  mutation runDisasterRecoveryServiceAction(
    $input: RunDisasterRecoveryServiceActionInput!
  ) {
    runDisasterRecoveryServiceAction(input: $input) {
      actionId
    }
  }
`;
