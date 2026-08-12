import { Text } from "@zstack/design";
import { formatSpeed } from "@zstack/virtualization-resource/src/pages/physical-nic/config/useColumnConfig";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import { Tag, TableDetailLink } from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/bond";
import { PhysicalNetworkType } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { Bond } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const flexCenterStyle = { display: "flex", alignItems: "center" } as const;
const textMarginRightStyle = { marginRight: "8px" } as const;
const tagBackgroundStyle = { backgroundColor: "white" } as const;
const inlineFlexCenterStyle = {
  display: "inline-flex",
  alignItems: "center",
} as const;
const spanMarginStyle = { margin: "0 4px" } as const;
const spanMarginWithColorStyle = {
  margin: "0 4px",
  color: "--neutral-300",
} as const;

export default () => {
  const intl = useIntl();

  return useColumnConfig<Bond>([
    {
      key: "host",
      render: ({ host }) => (
        <ResourceName
          value={host?.name}
          link={{
            to: `/host`,
            microAppName: "virtualization-resource",
            uuid: host?.uuid,
            leftnav: LeftNavType.ClusterHost,
            keepState: false,
          }}
        />
      ),
    },
    {
      key: "speed",
      title: intl.formatMessage({
        id: "virtualization.bond.speed",
        defaultMessage: "Bond Speed",
      }),
      formatter: (bond) => formatSpeed(bond.speed),
    },
    {
      key: "bondCompose",
      formatter: (value) =>
        value.slaves?.map((slave) => slave.interfaceName)?.join(","),
    },
    {
      key: "xmitHashPolicy",
      formatter: ({ xmitHashPolicy }) => xmitHashPolicy,
    },
    {
      key: "vswitch",
      render: (current) => (
        <ResourceName
          value={current?.vSwitch?.name}
          link={{
            to: `/l2-network`,
            microAppName: "virtualization-resource",
            uuid: current?.vSwitch?.uuid,
            leftnav: LeftNavType.Network,
            keepState: false,
          }}
        />
      ),
    },
    {
      key: "name",
      sorter: true,
      searchKey: "bondingName",
      sortKey: "bondingName",
      render: (bond: Bond) => {
        return (
          <div style={flexCenterStyle}>
            <Text style={textMarginRightStyle}>
              <TableDetailLink currentRow={bond}>
                {bond.bondingName}
              </TableDetailLink>
            </Text>
            {bond.hostNetworkBondingServiceRef?.some((item) =>
              item?.serviceTypes?.includes(
                PhysicalNetworkType.ManagementNetwork,
              ),
            ) && (
              <Tag round style={tagBackgroundStyle}>
                {intl.formatMessage({
                  id: "physicalNetworkType.managementNetwork",
                  defaultMessage: "Management Network",
                })}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      key: "type",
      formatter: (bond) => {
        const typeMap = {
          "active-backup": intl.formatMessage({
            id: "master.backup.mode",
            defaultMessage: "Active-Backup (mode1)",
          }),
          "802.3ad": intl.formatMessage({
            id: "link.aggregation.mode",
            defaultMessage: "LACP (mode 4)",
          }),
        };
        return typeMap[
          bond.mode?.includes("active-backup") ? "active-backup" : "802.3ad"
        ];
      },
    },
    {
      key: "speed",
      formatter: (bond) => formatSpeed(bond.speed),
    },
    {
      key: "state",
      formatter: (bond) => {
        const up =
          bond.slaves?.filter((salve) => salve.state === "UP")?.length ?? 0;
        const down =
          bond.slaves?.filter((salve) => salve.state === "DOWN")?.length ?? 0;

        return (
          <div style={inlineFlexCenterStyle}>
            <Constant value={ConstantEnum.UP} />
            <span style={spanMarginStyle}>{up}</span>
            <span style={spanMarginWithColorStyle}>|</span>
            <Constant value={ConstantEnum.DOWN} />
            <span style={spanMarginStyle}>{down}</span>
          </div>
        );
      },
    },
    {
      key: "ipv4",
      formatter: (bond) => {
        const [ipv4] = bond.ipAddresses?.[0]?.split("/") ?? [];
        return ipv4;
      },
    },
  ]);
};
