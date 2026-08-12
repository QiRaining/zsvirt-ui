import { useQuery } from "@apollo/client";
import { Text, Tooltip } from "@zstack/design";
import { queryVmDns } from "@zstack/virtualization-resource/src/gql/vm-dns.gql";
import { queryVmNicList } from "@zstack/virtualization-resource/src/gql/vm-nic.gql";
import { sortVmNics } from "@zstack/virtualization-resource/src/pages/vm/utils";
import { Constant, ItemList, ResourceName } from "@zstack/zsphere-components";
import { ConstantEnum } from "@zstack/zsphere-constant";
import { Illustration } from "@zstack/zsphere-illustration";
import { Op } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type {
  ResourceConfigInPage as IResourceConfigInPage,
  VmInstance as IVM,
  VmNic as IVmNic,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize, ipv6Netmask2prefix } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

export const useVmNicList: any = (
  vm: IVM,
  _resourceConfig: { [prop: string]: IResourceConfigInPage },
) => {
  const intl = useIntl();
  const { data: nicData, refetch: refetchNic } = useQuery(queryVmNicList, {
    variables: {
      conditions: [{ key: "vmInstance.uuid", op: Op.eq, value: vm.uuid }],
    },
    fetchPolicy: "no-cache",
  });

  const { data: dnsData, refetch: refetchDns } = useQuery(queryVmDns, {
    variables: {
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vm.uuid }],
    },
  });

  const list = useMemo(() => {
    if (!nicData?.vmNicList?.list?.length) {
      return [];
    }

    const stateMap = {
      enable: ConstantEnum.Enabled,
      disable: ConstantEnum.Disabled,
    };

    const devicedList = sortVmNics(
      nicData?.vmNicList?.list ?? [],
      vm.defaultL3NetworkUuid,
    );

    const dnsMap = {} as Record<string, string[]>;
    const queryDnsList = dnsData?.queryVmDns?.list ?? [];
    if (vm.platform !== "Windows") {
      const nicUuid = devicedList?.[0]?.uuid;
      if (nicUuid) {
        dnsMap[nicUuid] = queryDnsList
          .filter((item: any) => !item.vmNicUuid)
          .map((item: any) => item.dns);
      }
    } else {
      queryDnsList.forEach((item: any) => {
        if (!item.vmNicUuid) {
          return;
        }
        if (!dnsMap[item.vmNicUuid]) {
          dnsMap[item.vmNicUuid] = [];
        }
        dnsMap[item.vmNicUuid].push(item.dns);
      });
    }

    return devicedList?.map((nic: IVmNic, index: number) => {
      const manualDns = dnsMap[nic.uuid] ?? [];
      const [manualDns6, manualDns4] = _.partition(manualDns, (item) =>
        item.includes(":"),
      );
      const l3Dns = _.get(nic, ["l3Network", "dns"]) || [];
      const [l3Dns6, l3Dns4] = _.partition(l3Dns, (item) => item.includes(":"));
      const maxDnsCount = vm.platform === "Windows" ? 2 : 3;
      const dnsList = manualDns.length
        ? manualDns
        : l3Dns.slice(0, maxDnsCount);
      const dnsList4 = manualDns4.length
        ? manualDns4
        : l3Dns4.slice(0, maxDnsCount);
      const dnsList6 = manualDns6.length
        ? manualDns6
        : l3Dns6.slice(0, maxDnsCount);
      const ipv4 = nic.usedIps?.find((it) => it.ipVersion === 4);
      const ipv6 = nic.usedIps?.find((it) => it.ipVersion === 6);

      const sgLinks = _.orderBy(_.compact(nic?.securityGroup), "priority")?.map(
        (sg, i) => {
          return (
            <ResourceName
              key={sg.uuid}
              value={i === 0 ? sg.name : `,${sg.name}`}
              link={{
                uuid: sg.uuid,
                zoneUuid: vm.zoneUuid,
                to: "/security-group",
                leftnav: LeftNavType.ClusterHost,
                microAppName: "virtualization-resource",
              }}
            />
          );
        },
      );

      return {
        label: (
          <>
            <Illustration type="netcard" size={16} />
            {intl.formatMessage({ id: "nic", defaultMessage: "NIC" })}{" "}
            {index + 1}
          </>
        ),
        value: (
          <div className="flex items-center gap-2">
            <ResourceName
              value={nic.l3Network?.name}
              link={{
                leftnav: LeftNavType.Network,
                uuid: nic.l3Network?.uuid,
                to: "/l3-network",
                microAppName: "virtualization-resource",
              }}
            />
            <span className={style.split}>|</span>
            <Constant value={stateMap[nic.state as "enable"]} />
          </div>
        ),
        children: [
          {
            label: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
            value: <Text>{nic.internalName}</Text>,
          },
          {
            label: intl.formatMessage({
              id: "port.group",
              defaultMessage: "Port Group",
            }),
            value: (
              <ResourceName
                value={nic.l3Network?.name}
                link={{
                  leftnav: LeftNavType.Network,
                  uuid: nic.l3Network?.uuid,
                  to: "/l3-network",
                  microAppName: "virtualization-resource",
                }}
              />
            ),
          },
          {
            label: intl.formatMessage({
              id: "nicDriveType",
              defaultMessage: "NIC Model",
            }),
            value: nic.driverType,
          },
          {
            label: intl.formatMessage({ id: "mac", defaultMessage: "MAC Address" }),
            value: <ResourceName value={nic.mac} />,
          },
          {
            label: intl.formatMessage({
              id: "set.resource.config.title.vm.nicMultiQueueNum",
              defaultMessage: "NIC Queue Number",
            }),
            value: nic?.resourceConfig?.nicMultiQueueNum,
          },
          {
            label: intl.formatMessage({
              id: "ipv4.address",
              defaultMessage: "IPv4 Address",
            }),
            value: <ResourceName value={ipv4?.ip} copyable />,
          },
          {
            label: intl.formatMessage({
              id: "netmask",
              defaultMessage: "Netmask",
            }),
            show: !nic.l3Network?.enableIPAM,
            value: ipv4?.netmask,
          },
          {
            label: intl.formatMessage({
              id: "ipv4.gateway",
              defaultMessage: "IPv4 Gateway",
            }),
            show: !nic.l3Network?.enableIPAM,
            value: ipv4?.gateway,
          },
          {
            label: `IPv4 ${intl.formatMessage({
              id: "vm.create.field.dns.allocation.type",
              defaultMessage: "Assign DNS",
            })}`,
            show: vm.platform === "Windows",
            value: manualDns4.length
              ? intl.formatMessage({
                  id: "vm.create.field.dns.allocation.type.manual",
                  defaultMessage: "Manual Allocation",
                })
              : intl.formatMessage({
                  id: "vm.create.field.dns.allocation.type.auto",
                  defaultMessage: "Auto Allocated",
                }),
          },
          {
            label: `IPv4 ${intl.formatMessage({ id: "dns", defaultMessage: "DNS" })}${
              dnsList4.length > 1 ? ` (${dnsList4.length})` : ""
            }`,
            show: vm.platform === "Windows",
            value: dnsList4.length ? (
              <ItemList ellipsis toggle needWrap copyable value={dnsList4} />
            ) : null,
          },
          {
            label: intl.formatMessage({
              id: "ipv6.address",
              defaultMessage: "IPv6 Address",
            }),
            value: <ResourceName value={ipv6?.ip} copyable />,
          },
          {
            label: intl.formatMessage({
              id: "prefix.length",
              defaultMessage: "Prefix Length",
            }),
            show: !nic.l3Network?.enableIPAM,
            value: ipv6Netmask2prefix(ipv6?.netmask),
          },
          {
            label: intl.formatMessage({
              id: "ipv6.gateway",
              defaultMessage: "IPv6 Gateway",
            }),
            show: !nic.l3Network?.enableIPAM,
            value: ipv6?.gateway,
          },
          {
            label: `IPv6 ${intl.formatMessage({
              id: "vm.create.field.dns.allocation.type",
              defaultMessage: "Assign DNS",
            })}`,
            show: vm.platform === "Windows",
            value: manualDns6.length
              ? intl.formatMessage({
                  id: "vm.create.field.dns.allocation.type.manual",
                  defaultMessage: "Manual Allocation",
                })
              : intl.formatMessage({
                  id: "vm.create.field.dns.allocation.type.auto",
                  defaultMessage: "Auto Allocated",
                }),
          },
          {
            label: `IPv6 ${intl.formatMessage({ id: "dns", defaultMessage: "DNS" })}${
              dnsList6.length > 1 ? ` (${dnsList6.length})` : ""
            }`,
            show: vm.platform === "Windows",
            value: dnsList6.length ? (
              <ItemList ellipsis toggle needWrap copyable value={dnsList6} />
            ) : null,
          },
          {
            label: intl.formatMessage({
              id: "vm.create.field.dns.allocation.type",
              defaultMessage: "Assign DNS",
            }),
            show: vm.platform === "Linux" && index === 0,
            value: manualDns?.length
              ? intl.formatMessage({
                  id: "vm.create.field.dns.allocation.type.manual",
                  defaultMessage: "Manual Allocation",
                })
              : intl.formatMessage({
                  id: "vm.create.field.dns.allocation.type.auto",
                  defaultMessage: "Auto Allocated",
                }),
          },
          {
            label: `${intl.formatMessage({ id: "dns", defaultMessage: "DNS" })}${
              dnsList.length > 1 ? ` (${dnsList.length})` : ""
            }`,
            show: vm.platform === "Linux" && index === 0,
            value: dnsList.length ? (
              <ItemList ellipsis toggle needWrap copyable value={dnsList} />
            ) : null,
          },
          {
            label: intl.formatMessage({
              id: "security.group",
              defaultMessage: "Security Group",
            }),
            value:
              _.compact(nic?.securityGroup).length > 0 ? (
                <div className={style.links}>
                  <Tooltip
                    title={<div className={style.linksToolTip}>{sgLinks}</div>}
                  >
                    <Text>{sgLinks}</Text>
                  </Tooltip>
                </div>
              ) : (
                <div className={style.text}>
                  {intl.formatMessage({
                    id: "none",
                  })}
                </div>
              ),
          },

          {
            label: intl.formatMessage({
              id: "vmnic.qos",
              defaultMessage: "Network QoS",
            }),
            value: (
              <>
                <div>
                  {intl.formatMessage({
                    id: "send.bandwidth",
                    defaultMessage: "Transmit Bandwidth",
                  })}
                  :{" "}
                  {!_.isNil(nic.nicBandWidth?.outboundBandwidth) &&
                  nic.nicBandWidth?.outboundBandwidth !== -1
                    ? formatBytesToSize(
                        Number(nic.nicBandWidth.outboundBandwidth),
                        "bps",
                      )
                    : intl.formatMessage({
                        id: "volumeBandwidthNolimit",
                        defaultMessage: "Unlimited",
                      })}
                </div>
                <div>
                  {intl.formatMessage({
                    id: "receive.bandwidth",
                    defaultMessage: "Receive Bandwidth",
                  })}
                  :{" "}
                  {!_.isNil(nic.nicBandWidth?.inboundBandwidth) &&
                  nic.nicBandWidth?.inboundBandwidth !== -1
                    ? formatBytesToSize(
                        Number(nic.nicBandWidth.inboundBandwidth),
                        "bps",
                      )
                    : intl.formatMessage({
                        id: "volumeBandwidthNolimit",
                        defaultMessage: "Unlimited",
                      })}
                </div>
              </>
            ),
          },
        ],
      };
    });
  }, [nicData, intl]);

  const refetch = useCallback(() => {
    refetchNic();
    refetchDns();
  }, [refetchDns, refetchNic]);

  return [list, refetch];
};
