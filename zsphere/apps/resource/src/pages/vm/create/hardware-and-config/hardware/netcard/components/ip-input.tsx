import { useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { getFreeIpOfL3Network } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import type { AutoCompleteProps } from "antd";
import { AutoComplete } from "antd";
import React, { useEffect } from "react";

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
