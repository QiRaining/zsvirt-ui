import { formatSpeed } from "@zstack/virtualization-resource/src/pages/physical-nic/config/useColumnConfig";
import { Tag } from "@zstack/zsphere-components";
import { ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/uplink-group";
import { LeftNavType } from "@zstack/zsphere-types";
import type { UplinkGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();

  return useColumnConfig<UplinkGroup>([
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
      formatter: ({ physicalNic, bond }) => {
        const speed = physicalNic?.speed || bond?.speed;

        return formatSpeed(speed);
      },
    },
    {
      key: "network.port",
      render: ({ physicalNic, bond }) => {
        const names = physicalNic?.interfaceName
          ? [physicalNic?.interfaceName]
          : (bond?.slaves?.map((it: any) => it.interfaceName) ?? []);
        return names.map((name: string, index: number) => (
          <Tag key={name + index}>{name}</Tag>
        ));
      },
    },
  ]);
};
