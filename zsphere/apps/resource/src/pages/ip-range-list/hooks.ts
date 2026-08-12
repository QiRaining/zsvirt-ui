import { useQuery, gql } from "@apollo/client";

interface ICount {
  ipv4Num: number;
  ipv6Num: number;
}

const getIpRangeCount = gql`
  query ipRangeCount($l3NetworkUuid: String!) {
    ipRangeCount(l3NetworkUuid: $l3NetworkUuid) {
      ipv4Num
      ipv6Num
    }
  }
`;

export const useIpRangeCount = (l3NetworkUuid: string) => {
  const { data: ipRangeCount, refetch } = useQuery<{
    ipRangeCount: ICount;
  }>(getIpRangeCount, {
    variables: {
      l3NetworkUuid,
    },
  });
  const { ipv4Num = 0, ipv6Num = 0 } = ipRangeCount?.ipRangeCount || {};

  return {
    ipv4Num,
    ipv6Num,
    refetch,
  };
};
