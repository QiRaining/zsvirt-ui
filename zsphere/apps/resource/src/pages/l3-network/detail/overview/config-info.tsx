import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { L3Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps {
  current: L3Network;
}

export default function ConfigInfo({ current, ...props }: IProps) {
  const intl = useIntl();

  const ipv4Cidr = useMemo(() => {
    return current.ipRanges?.find(
      (item) => item.ipVersion === 4 && item.ipRangeType === "Normal",
    )?.networkCidr;
  }, [current]);

  const ipv6Cidr = useMemo(() => {
    return current.ipRanges?.find(
      (item) => item.ipVersion === 6 && item.ipRangeType === "Normal",
    )?.networkCidr;
  }, [current]);

  const ipAllocMap = useMemo<Record<string, string>>(
    () => ({
      AscDelayRecycleIpAllocatorStrategy: intl.formatMessage({
        id: "AscDelayRecycleIpAllocator",
        defaultMessage: "Allocate in Cycle",
      }),
      FirstAvailableIpAllocatorStrategy: intl.formatMessage({
        id: "FirstAvailableIpAllocator",
        defaultMessage: "Allocate in Order",
      }),
      RandomIpAllocatorStrategy: intl.formatMessage({
        id: "RandomIpAllocator",
        defaultMessage: "Random allocation",
      }),
    }),
    [intl],
  );

  const dhcpService = !!current.networkServices?.find(
    (item) => item.networkServiceType === "DHCP",
  );

  const list: ListItem[] = useMemo(
    () => [
      {
        label: "MTU",
        value: current.mtu,
      },
      {
        label: "VLAN ID",
        value:
          current.portGroup?.vlanId === "0"
            ? undefined
            : current.portGroup?.vlanId,
      },
      {
        label: intl.formatMessage({
          id: "dhcpService",
          defaultMessage: "DHCP Service",
        }),
        value: dhcpService
          ? intl.formatMessage({
              id: "open",
              defaultMessage: "Enabled",
            })
          : intl.formatMessage({
              id: "close",
              defaultMessage: "Disabled",
            }),
      },
      {
        label: intl.formatMessage({
          id: "ip.address.manegement",
          defaultMessage: "IP Address Management",
        }),
        value: current.enableIPAM
          ? intl.formatMessage({
              id: "open",
              defaultMessage: "Enabled",
            })
          : intl.formatMessage({
              id: "close",
              defaultMessage: "Disabled",
            }),
      },
      {
        label: "IPv4 CIDR",
        show: current.enableIPAM,
        value: ipv4Cidr,
        copyable: true,
        children: ipv4Cidr
          ? [
              {
                label: intl.formatMessage({
                  id: "ip.allocation.strategy",
                  defaultMessage: "IP Allocation Policy",
                }),
                value:
                  ipAllocMap[
                    current.ipAllocateStrategy ?? "RandomIpAllocatorStrategy"
                  ],
              },
            ]
          : undefined,
      },
      {
        label: "IPv6 CIDR",
        show: current.enableIPAM,
        value: ipv6Cidr,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "ipv4.dhcpService.ip",
          defaultMessage: "IPv4 DHCP IP",
        }),
        value: current.dhcpIp?.ipv4,
        show: dhcpService,
        copyable: true,
      },
      {
        label: intl.formatMessage({
          id: "ipv6.dhcpService.ip",
          defaultMessage: "IPv6 DHCP IP",
        }),
        value: current.dhcpIp?.ipv6?.toLowerCase(),
        show: dhcpService,
        copyable: true,
      },
    ],
    [intl, current, ipAllocMap, ipv4Cidr, ipv6Cidr, dhcpService],
  );

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
      isList
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
