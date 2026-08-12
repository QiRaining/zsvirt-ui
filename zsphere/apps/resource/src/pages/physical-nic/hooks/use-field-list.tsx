import type { FieldList } from "@zstack/virtualization-resource/src/pages/bond/list";
import { cidrToSubnet } from "@zstack/virtualization-resource/src/pages/bond/list";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { LeftNavType } from "@zstack/zsphere-types";
import type {
  PciDeviceVirtStatus,
  PhysicalNic,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import State from "../components/state";
import { formatSpeed, getNicNum } from "../config/useColumnConfig";

export const useFieldList = () => {
  const intl = useIntl();

  return useMemo<FieldList<PhysicalNic>>(
    () => [
      {
        key: "interfaceName",
        label: intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        }),
        render: (nic) => nic?.interfaceName,
      },
      {
        key: "description",
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        render: (nic) => nic?.description,
      },
      {
        key: "state",
        label: intl.formatMessage({
          id: "common.state",
          defaultMessage: "Status",
        }),
        render: (nic) => {
          const nicState = nic?.state as any;
          return (
            nicState && (
              <Constant value={nicState} enumType={ConstantType.NicState} />
            )
          );
        },
      },
      {
        key: "interfaceFactory",
        label: intl.formatMessage({
          id: "manufacturer",
          defaultMessage: "Manufacturer",
        }),
        render: (nic) => nic?.interfaceFactory,
      },
      {
        key: "interfaceModel",
        label: intl.formatMessage({
          id: "nicDriveType",
          defaultMessage: "NIC Model",
        }),
        render: (nic) => nic?.interfaceModel,
      },
      {
        key: "nicSpeed",
        label: intl.formatMessage({
          id: "speed",
          defaultMessage: "Speed",
        }),
        render: (nic) => formatSpeed(nic?.speed),
      },
      {
        key: "ipv4.address",
        label: intl.formatMessage({
          id: "ipv4.address",
          defaultMessage: "IPv4 Address",
        }),
        render: (nic) => nic?.ipAddresses,
      },
      {
        key: "netmask",
        label: intl.formatMessage({
          id: "netmask",
          defaultMessage: "Netmask",
        }),
        render: (nic) => {
          const cidr = nic?.ipAddresses?.[0];
          return cidr && cidrToSubnet(cidr);
        },
      },
      {
        key: "mac",
        label: intl.formatMessage({
          id: "mac.address",
          defaultMessage: "MAC Address",
        }),
        render: (nic) => nic?.mac,
      },
      {
        key: "bond",
        label: intl.formatMessage({
          id: "agg.port",
          defaultMessage: "Bond",
        }),
        render: (nic) => nic?.bond?.bondingName,
      },
      {
        key: "vswitch",
        label: intl.formatMessage({
          id: "virtualization.l2",
          defaultMessage: "Distributed Switch",
        }),
        render: (nic) => (
          <ResourceName
            value={nic?.vSwitch?.name}
            link={{
              to: `/l2-network`,
              microAppName: "virtualization-resource",
              uuid: nic?.vSwitch?.uuid,
              leftnav: LeftNavType.Network,
              keepState: false,
            }}
          />
        ),
      },
      {
        key: "sr.iov.state",
        label: intl.formatMessage({
          id: "sr.iov.state",
          defaultMessage: "SR-IOV Status",
        }),
        render: (nic) => {
          const state = nic?.pciDevice
            ?.virtStatus as unknown as PciDeviceVirtStatus;
          return state && <State state={state} isSriov />;
        },
      },
      {
        key: "used.vf.total.vf",
        label: intl.formatMessage({
          id: "used.vf.total.vf",
          defaultMessage: "Used VF/Total VF",
        }),
        render: (nic) => getNicNum(nic),
      },
    ],
    [intl],
  );
};
