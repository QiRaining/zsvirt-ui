import { gql, useQuery } from "@apollo/client";
import { L2NetworkQueryType, Op } from "@zstack/zsphere-types";
import type { L2NetworkQueryResp } from "@zstack/zsphere-types/graphql";

const QUERY_L2_NETWORK = gql`
  query QUERY_L2_NETWORK(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: L2NetworkQueryType
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    l2NetworkList(
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        portGroups {
          vlanId
        }
      }
      total
    }
  }
`;

export const useL2Network = (clusterUuid: string) => {
  const { data } = useQuery<{ l2NetworkList: L2NetworkQueryResp }>(
    QUERY_L2_NETWORK,
    {
      variables: {
        conditions: [
          {
            key: "cluster.uuid",
            op: Op.eq,
            value: clusterUuid,
          },
          {
            key: "cluster.hypervisorType",
            op: Op.ne,
            value: "ESX",
          },
          {
            key: "type",
            op: Op.notIn,
            values: [
              "VxlanNetworkPool",
              "HardwareVxlanNetworkPool",
              "portGroup",
            ],
          },
        ],
        type: L2NetworkQueryType.CreateL3AllCandidate,
      },
    },
  );

  return { data };
};
