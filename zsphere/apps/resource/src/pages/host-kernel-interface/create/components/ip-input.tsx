import { useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { getFreeIpOfL3Network } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import type { AutoCompleteProps } from "antd";
import { AutoComplete } from "antd";
import { useRef, useEffect } from "react";

export interface IProps extends AutoCompleteProps {
  ipVersion: 4 | 6;
  l3NetworkUuid: string | undefined;
}

export default function IpInput({
  l3NetworkUuid,
  ipVersion,
  value,
  onChange,
  ...props
}: IProps) {
  const hasAutoSelected = useRef(false);
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
    <AutoComplete value={value} onChange={onChange} {...props}>
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
