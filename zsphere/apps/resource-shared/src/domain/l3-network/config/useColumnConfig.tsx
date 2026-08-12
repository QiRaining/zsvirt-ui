import { Text } from "@zstack/design";
import {
  Tag,
  ResourceName,
  ResourceUsageProgress,
  ShareType,
  useShareTypeFilters,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/flat-network";
import { LeftNavType } from "@zstack/zsphere-types";
import type { L3Network } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export default (view?: string) => {
  const intl = useIntl();

  const shareTypeFilters = useShareTypeFilters(view);

  return useColumnConfig<L3Network>([
    {
      key: "name",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "l3-network",
      },
      render: (current: L3Network) => (
        <div className={style.nameCell}>
          <ResourceName
            isRouterManaged
            value={current?.name}
            link={{
              to: "/l3-network",
              microAppName: "virtualization-resource",
              uuid: current?.uuid,
              leftnav: LeftNavType.Network,
            }}
          />
          {current.isDefault && (
            <Tag round level="weak" className={style.defaultTag}>
              {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
            </Tag>
          )}
        </div>
      ),
    },
    {
      key: "ipam",
      formatter: (l3) =>
        l3.enableIPAM
          ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
          : intl.formatMessage({ id: "closed", defaultMessage: "Disabled" }),
      searchKey: "enableIPAM",
      filters: [
        {
          text: intl.formatMessage({ id: "open", defaultMessage: "Enabled" }),
          // 布尔值的过滤，java bool到mysql会自动转换成tinyInt  --- 0 or 1
          value: 1,
        },
        {
          text: intl.formatMessage({ id: "closed", defaultMessage: "Disabled" }),
          value: 0,
        },
      ],
    },
    {
      key: "vlan",
      formatter: (value) =>
        value?.portGroup?.vlanId === "0" ? undefined : value?.portGroup?.vlanId,
    },
    {
      key: "vSwitch",
      render: (current: L3Network) => (
        <ResourceName
          value={current?.vSwitch?.name || current?.vSwitchUuid}
          link={{
            to: "/l2-network",
            microAppName: "virtualization-resource",
            uuid: current?.vSwitch?.uuid,
            leftnav: LeftNavType.Network,
          }}
        />
      ),
    },
    {
      key: "dhcp.service",
      formatter: (l3) => {
        const dhcpServer =
          (l3.networkServices?.findIndex(
            (networkService) => networkService?.networkServiceType === "DHCP",
          ) ?? -1) > -1;

        return dhcpServer
          ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
          : intl.formatMessage({ id: "closed", defaultMessage: "Disabled" });
      },
      filters: [
        {
          text: intl.formatMessage({ id: "open", defaultMessage: "Enabled" }),
          value: "open",
        },
        {
          text: intl.formatMessage({ id: "closed", defaultMessage: "Disabled" }),
          value: "close",
        },
      ],
    },
    {
      key: "ipv4Cidr",
      formatter: (l3) =>
        l3.enableIPAM
          ? (l3?.ipRanges?.find(
              (ip) => ip.ipVersion === 4 && ip.ipRangeType === "Normal",
            )?.networkCidr ?? (
              <Text className={style["null-text"]}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </Text>
            ))
          : "-",
    },
    {
      key: "ipv6Cidr",
      formatter: (l3) =>
        l3.enableIPAM
          ? (l3?.ipRanges?.find((ip) => ip.ipVersion === 6)?.networkCidr ?? (
              <Text className={style["null-text"]}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </Text>
            ))
          : "-",
    },
    {
      key: "availableCapacity",
      minWidth: 120,
      render: (row: L3Network) => {
        if (!row.enableIPAM) {
          return "-";
        }

        const total = row?.ipCapacity?.ipv4TotalCapacity || 0;
        const available =
          total - (row?.ipCapacity?.ipv4UsedIpAddressNumber || 0);

        return (
          <ResourceUsageProgress
            isFormat={false}
            total={total}
            available={available}
          />
        );
      },
      width: 200,
    },
    {
      key: "toPublic",
      render: (row: L3Network) => <ShareType type={row?.shareType} />,
      filters: shareTypeFilters,
      filterEnumType: ConstantType.ShareType,
      auth: {
        type: "block",
        authKey: "share.type",
        resource: "common",
      },
    },
    {
      key: "cidr",
      formatter: (l3) => l3?.ipRanges?.[0]?.networkCidr,
    },
  ]);
};
