import { cidrToSubnet } from "@zstack/virtualization-resource/src/pages/bond/list";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import { isCidr } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { State } from "../../components";
import { getNicNum } from "../../config/useColumnConfig";

export interface IProps {
  current: PhysicalNic;
}

export default function ConfigInfo({ current, ...props }: IProps) {
  const intl = useIntl();
  const list = useMemo<ListItem[]>(() => {
    const ipv4cidr = current?.ipAddresses?.find((item) => isCidr(item, 4));
    return [
      {
        label: intl.formatMessage({
          id: "agg.port",
          defaultMessage: "Bond",
        }),
        value: current?.bond?.bondingName,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.l2",
          defaultMessage: "Distributed Switch",
        }),
        value: (
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
        label: intl.formatMessage({
          id: "ipv4.address",
          defaultMessage: "IPv4 Address",
        }),
        copyable: true,
        value: ipv4cidr?.split("/")[0],
      },
      {
        label: intl.formatMessage({
          id: "mac.address",
          defaultMessage: "MAC Address",
        }),
        copyable: true,
        value: current?.mac,
      },
      {
        label: intl.formatMessage({
          id: "netmask",
          defaultMessage: "Netmask",
        }),
        value: ipv4cidr && cidrToSubnet(ipv4cidr),
      },
      {
        label: intl.formatMessage({
          id: "sr.iov.state",
          defaultMessage: "SR-IOV Status",
        }),
        value: current?.pciDevice?.virtStatus && (
          <State state={current.pciDevice.virtStatus} isSriov />
        ),
      },
      {
        label: intl.formatMessage({
          id: "used.vf.total.vf",
          defaultMessage: "Used VF/Total VF",
        }),
        value: getNicNum(current),
      },
    ];
  }, [current, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
      isList
      {...props}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
}
