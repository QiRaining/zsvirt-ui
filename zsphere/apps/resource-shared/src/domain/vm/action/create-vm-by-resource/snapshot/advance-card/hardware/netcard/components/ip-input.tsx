import { gql, useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import type { AutoCompleteProps } from "antd";
import { AutoComplete } from "antd";
import { useEffect } from "react";

const getFreeIpOfL3Network = gql`
  query getFreeIpOfL3Network($l3NetworkUuid: String!, $ipVersion: Int) {
    getFreeIpOfL3Network(l3NetworkUuid: $l3NetworkUuid, ipVersion: $ipVersion) {
      ipv4List
      ipv6List
    }
  }
`;

export interface IProps extends AutoCompleteProps {
  ipVersion: 4 | 6;
  l3NetworkUuid: string | undefined;
}

export default function IpInput({
  l3NetworkUuid,
  ipVersion,
  ...props
}: IProps) {
  const [query, { data }] = useLazyQuery(getFreeIpOfL3Network, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (l3NetworkUuid) {
      query({
        variables: { l3NetworkUuid, ipVersion },
      });
    }
  }, [query, ipVersion, l3NetworkUuid]);

  const list = data?.getFreeIpOfL3Network?.[`ipv${ipVersion}List`] ?? [];

  return (
    <AutoComplete {...props}>
      {l3NetworkUuid
        ? list.map((item: string) => {
            return (
              <AutoComplete.Option key={item} value={item}>
                <Text>{item}</Text>
              </AutoComplete.Option>
            );
          })
        : undefined}
    </AutoComplete>
  );
}
