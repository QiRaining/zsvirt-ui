import { Text } from "@zstack/design";
import {
  ResourceUsageProgress,
  ShareType,
  useShareTypeFilters,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/ip-range";
import type { IpRange as IIpRange } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import styles from "../style.module.less";

enum AddressMode {
  "Stateful-DHCP" = "Stateful-DHCP",
  "Stateless-DHCP" = "Stateless-DHCP",
  "SLAAC" = "SLAAC",
}

export default (view?: any) => {
  const intl = useIntl();
  const noneText = (
    <Text className={styles["null-text"]}>
      {intl.formatMessage({ id: "none", defaultMessage: "None" })}
    </Text>
  );

  const shareTypeFilters = useShareTypeFilters(view);
  const typeMap = {
    Normal: intl.formatMessage({
      id: "normalIpRange",
      defaultMessage: "Normal",
    }),
    AddressPool: intl.formatMessage({
      id: "addresspoolIpRange",
      defaultMessage: "Address Pool",
    }),
  };

  return useColumnConfig<IIpRange>([
    {
      key: "ipv4Cidr",
      formatter: (item) => (item.ipVersion === 4 ? item.networkCidr : noneText),
    },
    {
      key: "ipv6Cidr",
      formatter: (item) => (item.ipVersion === 6 ? item.networkCidr : noneText),
    },
    {
      key: "ipRangeType",
      render: (item) => <Text>{typeMap[item.ipRangeType as "Normal"]}</Text>,
      filters: Object.entries(typeMap).map(([value, text]) => ({
        value,
        text,
      })),
    },
    {
      key: "shareType",
      render: (row: IIpRange) => <ShareType type={row.shareType} />,
      // authKey: 'shareType'
      filters: shareTypeFilters,
      filterEnumType: ConstantType.ShareType,
      auth: {
        resource: "common",
        type: "block",
        authKey: "share.type",
      },
    },
    {
      key: "addressMode",
      filterOptions: AddressMode,
    },
    {
      key: "ipv4Capacity",
      render: (row: IIpRange) => {
        const total = row.ipCapacity?.ipv4TotalCapacity || 0;
        const available =
          total - (row.ipCapacity?.ipv4UsedIpAddressNumber || 0);

        return (
          <ResourceUsageProgress
            isFormat={false}
            total={total}
            available={available}
            resourceType="network"
          />
        );
      },
    },
  ]);
};
