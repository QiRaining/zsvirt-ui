import { useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Text } from "@zstack/zsphere-components";
import { AutoComplete, AutoCompleteProps } from "antd";
import { useEffect, useRef } from "react";

const GET_FREE_IP_OF_L3_NETWORK = gql`
  query getFreeIpOfL3Network($l3NetworkUuid: String!, $ipVersion: Int) {
    getFreeIpOfL3Network(l3NetworkUuid: $l3NetworkUuid, ipVersion: $ipVersion) {
      ipv4List
      ipv6List
    }
  }
`;

export interface IpInputProps extends AutoCompleteProps {
  ipVersion: 4 | 6;
  l3NetworkUuid: string | undefined;
}

export default function IpInput({
  l3NetworkUuid,
  ipVersion,
  value,
  onChange,
  ...props
}: IpInputProps) {
  const hasAutoSelected = useRef(false);
  const [query, { data }] = useLazyQuery(GET_FREE_IP_OF_L3_NETWORK, {
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

  // 当获取到可用IP列表且当前没有值时，自动选中第一个
  useEffect(() => {
    if (list.length > 0 && !value && onChange && !hasAutoSelected.current) {
      onChange(list[0], list[0]);
      hasAutoSelected.current = true;
    }
  }, [list, value, onChange]);

  useEffect(() => {
    hasAutoSelected.current = false;
  }, [l3NetworkUuid]);

  return (
    <AutoComplete
      value={value}
      onChange={onChange}
      popupClassName="!z-[1200]"
      {...props}
    >
      {l3NetworkUuid
        ? list.map((item: string) => {
            return (
              <AutoComplete.Option key={item} value={item}>
                <Text value={item} />
              </AutoComplete.Option>
            );
          })
        : undefined}
    </AutoComplete>
  );
}
