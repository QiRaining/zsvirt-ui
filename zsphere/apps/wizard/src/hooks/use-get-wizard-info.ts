import { gql, useQuery } from "@apollo/client";
import type { IQuery } from "@zstack/zsphere-types";
import type { WizardInfo } from "@zstack/zsphere-types/graphql";

export const QUERY_GET_WIZARD_INFO = gql`
  query getWizardInfo {
    wizardInfo {
      hostList {
        sn
        ip
        port
        username
        password
        hostname
        isManagementNode
      }
      storageInfo {
        monList {
          sn
          ip
          port
          username
          password
        }
        mdsList {
          sn
          ip
          port
          username
          password
        }
        poolName
        storageType
      }
      storagePublicNetwork
      storageClusterNetwork
      tenantNetwork {
        start_ip
        end_ip
        netmask
        gateway
        vlan_id
        bond_mode
        xmit_hash_policy
      }
    }
  }
`;

export function useGetWizardInfo() {
  const { data, loading } = useQuery<
    {
      wizardInfo: WizardInfo;
    },
    IQuery
  >(QUERY_GET_WIZARD_INFO, {
    fetchPolicy: "network-only",
  });

  return {
    data: data?.wizardInfo,
    loading,
  };
}
