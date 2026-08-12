import { cidrToSubnet } from "@zstack/virtualization-resource/src/pages/bond/list";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { Bond } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps {
  current: Bond;
}

export default function ConfigInfo({ current, ...props }: IProps) {
  const intl = useIntl();
  const list = useMemo<ListItem[]>(() => {
    return [
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
        value: current.ipAddresses?.[0]?.split("/")[0],
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
        value:
          current?.ipAddresses?.[0] && cidrToSubnet(current.ipAddresses[0]),
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
