import { Text, Tooltip, Badge } from "@zstack/design";
import {
  Constant,
  ResourceName,
  ResourceUsageProgress,
  Link,
} from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useColumnConfig } from "@zstack/zsphere-engine/src/vm-nic";
import type { IOption } from "@zstack/zsphere-engine/src/vm-nic/useColumnConfig";
import { LeftNavType } from "@zstack/zsphere-types";
import { NavView } from "@zstack/zsphere-types";
import type {
  L3Network,
  VmNic,
  SecurityGroup as ISecurityGroup,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import classnames from "classnames";
import { isNil, isEmpty as _isEmpty, orderBy as _orderBy } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

enum DriverType {
  virtio = "virtio",
  e1000 = "e1000",
  rtl8139 = "rtl8139",
}

enum NicType {
  VF = "VF",
  VNIC = "VNIC",
  vDPA = "vDPA",
}

const useColumnConfigI = (options: IOption<VmNic> = []) => {
  const intl = useIntl();

  const renderEipName = (nic: VmNic) => {
    const eipList = nic?.eip || [];
    return eipList?.length ? (
      eipList?.map((it, index: number) => (
        <Link
          key={it?.uuid}
          microAppName="virtualization-resource"
          to={`/eip/detail?uuid=${it?.uuid}`}
        >
          {index === 0 ? it?.vipIp : `，${it?.vipIp}`}
        </Link>
      ))
    ) : (
      <span className={styles.none}>
        {intl.formatMessage({ id: "empty", defaultMessage: "Empty" })}
      </span>
    );
  };

  const formatBandwidth = (
    nic: VmNic,
    key: "outboundBandwidth" | "inboundBandwidth",
  ) =>
    nic?.nicBandWidth?.[key] === -1 || isNil(nic?.nicBandWidth?.[key])
      ? intl.formatMessage({ id: "unlimited", defaultMessage: "Unlimited" })
      : formatBytesToSize(nic.nicBandWidth[key], "bps");

  const renderCapacity = (row: VmNic) => {
    const available = (row.l3Network as L3Network)?.ipCapacity
      ?.ipv4AvailableCapacity;
    const total = (row.l3Network as L3Network)?.ipCapacity?.ipv4TotalCapacity;
    return (
      <ResourceUsageProgress
        isFormat={false}
        resourceType="network"
        total={total || 0}
        available={available || 0}
      />
    );
  };

  const ioptions: IOption<VmNic> = [
    {
      key: "vmName",
      primaryKey: "vmInstanceUuid",
      render: ({ vmInstance, vmInstanceUuid, templatedVmInstance }: VmNic) => {
        if (templatedVmInstance) {
          return (
            <ResourceName
              value={templatedVmInstance.name}
              canModify
              link={{
                to: `/vm-template`,
                microAppName: "virtualization-resource",
                uuid: templatedVmInstance.uuid,
                leftnav: LeftNavType.TemplateVm,
                navView: NavView.Template,
              }}
            />
          );
        }
        if (vmInstance) {
          return (
            <ResourceName
              value={vmInstance.name}
              canModify
              link={{
                to: `/vm`,
                microAppName: "virtualization-resource",
                uuid: vmInstance.uuid,
                leftnav: LeftNavType.ClusterHost,
                navView: NavView.Resource,
              }}
            />
          );
        }
        return <ResourceName canModify value={vmInstanceUuid} />;
      },
    },
    {
      key: "portGroup",
      render: (nic: VmNic) => {
        return nic.l3Network?.uuid ? (
          <ResourceName
            value={nic.l3Network.name}
            link={{
              microAppName: "virtualization-resource",
              to: "/l3-network",
              uuid: nic.l3Network.uuid,
              leftnav: LeftNavType.Network,
            }}
          />
        ) : undefined;
      },
    },
    {
      key: "driverType",
      filterOptions: DriverType,
    },
    {
      key: "type",
      filterOptions: NicType,
    },
    {
      key: "nicName",
      formatter: (nic) => nic.internalName,
    },
    {
      key: "ipv4",
      formatter: (nic) =>
        nic.usedIps?.find((ip: any) => ip.ipVersion === 4)?.ip,
    },
    {
      key: "ip.address",
      formatter: (nic) => nic.ip,
    },
    {
      key: "mac",
      render: (value: any) => {
        return <CopyableText>{value?.mac?.toUpperCase()}</CopyableText>;
      },
    },
    {
      key: "ipv6",
      formatter: (nic) =>
        nic.usedIps?.find((ip: any) => ip.ipVersion === 6)?.ip,
    },
    {
      key: "eip",
      render: (nic) => renderEipName(nic),
    },
    {
      key: "securityGroup",
      render: (nic: VmNic) => {
        if (_isEmpty(nic.securityGroup)) {
          return "-";
        }

        const links = _orderBy(nic?.securityGroup ?? [], "priority")?.map(
          (sg: ISecurityGroup, index) => {
            return (
              <Link
                key={sg.uuid}
                microAppName="security-group"
                to={`/security-group/detail?uuid=${sg.uuid}`}
              >
                {index === 0 ? sg.name : `,${sg.name}`}
              </Link>
            );
          },
        );
        return (
          <div className={styles.links}>
            <Tooltip title={<div className={styles.linksToolTip}>{links}</div>}>
              <Text>{links as any}</Text>
            </Tooltip>
          </div>
        );
      },
    },
    {
      key: "inboundBandwidth",
      render: (nic: VmNic) => (
        <span
          className={
            nic?.nicBandWidth?.inboundBandwidth === -1 ||
            isNil(nic?.nicBandWidth?.inboundBandwidth)
              ? styles.none
              : undefined
          }
        >
          {formatBandwidth(nic, "inboundBandwidth")}
        </span>
      ),
      authKey: "inboundBandwidth",
    },
    {
      key: "outboundBandwidth",
      render: (nic: VmNic) => (
        <span
          className={
            nic?.nicBandWidth?.outboundBandwidth === -1 ||
            isNil(nic?.nicBandWidth?.outboundBandwidth)
              ? styles.none
              : undefined
          }
        >
          {formatBandwidth(nic, "outboundBandwidth")}
        </span>
      ),
      authKey: "outboundBandwidth",
    },
    {
      key: "inboundBandwidth.in.router",
      formatter: (nic) => formatBandwidth(nic, "inboundBandwidth"),
    },
    {
      key: "outboundBandwidth.in.router",
      formatter: (nic) => formatBandwidth(nic, "outboundBandwidth"),
    },
    {
      key: "cidr",
      formatter: (nic) =>
        (nic.l3Network as L3Network)?.ipRanges?.[0]?.networkCidr,
    },
    {
      key: "snat",
      dataIndex: "snat",
      formatter: (enabled) =>
        enabled
          ? intl.formatMessage({ id: "open" })
          : intl.formatMessage({ id: "close" }),
    },
    {
      key: "ipv4Cidr",
      formatter: (nic) =>
        (nic.l3Network as L3Network)?.ipRanges?.find((ip) => ip.ipVersion === 4)
          ?.networkCidr,
    },
    {
      key: "ipv6Cidr",
      formatter: (nic) =>
        (nic.l3Network as L3Network)?.ipRanges?.find((ip) => ip.ipVersion === 6)
          ?.networkCidr,
    },
    {
      key: "ipCapacity",
      render: renderCapacity,
    },
    {
      key: "ipv4Capacity",
      render: renderCapacity,
    },
    {
      key: "createDate",
      formatter: (nic) => nic.createDate,
    },
    {
      key: "state",
      filters: [
        {
          text: <Constant value={ConstantEnum.Enabled} />,
          value: "enable",
        },
        {
          text: <Constant value={ConstantEnum.Disabled} />,
          value: "disable",
        },
      ],
      formatter: (value) => {
        const stateMap = {
          enable: ConstantEnum.Enabled,
          disable: ConstantEnum.Disabled,
        };
        return <Constant value={stateMap[(value as any).state as "enable"]} />;
      },
    },
    {
      key: "netmask",
      formatter: (nic) => nic?.usedIps?.[0]?.netmask,
    },
    {
      key: "gateway",
      formatter: (nic) => nic?.usedIps?.[0]?.gateway,
    },
    {
      key: "virtualization.ipv4.address",
      formatter: (nic) =>
        nic.usedIps?.find((ip: any) => ip.ipVersion === 4)?.ip,
    },
    {
      key: "virtualization.ipv6.address",
      formatter: (nic) =>
        nic.usedIps?.find((ip: any) => ip.ipVersion === 6)?.ip,
    },
    {
      key: "virtualization.mac.address",
      formatter: (nic) => nic.mac,
    },
    {
      key: "virtualization.mtu",
      formatter: (nic) => (nic?.l3Network as L3Network)?.mtu,
    },
    {
      key: "virtualization.dns",
      formatter: (nic) => (nic?.l3Network as L3Network)?.dns?.[0],
    },
  ];

  const keys = options.map((option) => option.key);
  const filterOptions = ioptions.filter(
    (ioption) => !keys.includes(ioption.key),
  );
  return useColumnConfig<VmNic>(options.concat(filterOptions));
};

export default useColumnConfigI;

export const useNicColumnConfig = ({ view, current }: any = {}) => {
  const intl = useIntl();

  return useColumnConfigI([
    {
      key: "name",
      render: (nic: VmNic) => {
        // 选择列表 不能查看详情、VF网卡不能查看详情
        const withoutLink =
          ["select"].some((_v) => view?.includes(_v)) || nic.type === "VF";

        const Title = (
          <>
            <Text className={classnames({ [styles.link]: !withoutLink })}>
              {nic.internalName}
            </Text>
            {nic.l3NetworkUuid === current?.defaultL3NetworkUuid && (
              <Badge
                variant="outline"
                className="ml-2 shrink-0"
                count={intl.formatMessage({
                  id: "default",
                  defaultMessage: "Default",
                })}
              />
            )}
          </>
        );

        // 选择列表不能查看详情
        if (withoutLink) {
          return Title;
        }

        return "";
      },
      sortKey: "internalName",
      width: 200,
    },
  ]);
};
