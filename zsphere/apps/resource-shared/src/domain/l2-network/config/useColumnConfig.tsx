import { Text } from "@zstack/design";
import {
  Tag,
  ResourceName,
  Link,
  ShareType,
  useShareTypeFilters,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig as _useColumnConfig } from "@zstack/zsphere-engine/src/l2-network";
import { LeftNavType } from "@zstack/zsphere-types";
import { l2NetworkType } from "@zstack/zsphere-types";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export enum INetworkAccelerationMode {
  Normal = "Normal",
  SrIov = "SrIov",
  SmartNic = "SmartNic",
}

export const renderNetworkAccelerationMode = (
  l2network: IL2Network,
  intl: any,
) => {
  const { enableSRIOV, vSwitchType } = l2network;
  if (vSwitchType === "OvsDpdk") {
    return intl.formatMessage({
      id: "l2network.networkAccelerationMode.smartNic",
      defaultMessage: "Smart NIC",
    });
  }
  if (vSwitchType === "LinuxBridge") {
    if (enableSRIOV) {
      return intl.formatMessage({
        id: "l2network.networkAccelerationMode.srIov",
        defaultMessage: "SR-IOV",
      });
    }
    return intl.formatMessage({
      id: "l2network.networkAccelerationMode.normal",
      defaultMessage: "Standard",
    });
  }
};

export default (...args: any) => {
  const intl = useIntl();
  const filterOptions = Object.keys(l2NetworkType).reduce((p: any, k) => {
    if (["main", "select"].includes(args?.view as "main")) {
      if (k !== l2NetworkType[l2NetworkType.VxlanNetworkPool]) {
        p[k] = k;
      }
    } else {
      p[k] = k;
    }

    return p;
  }, {});

  const shareTypeFilters = useShareTypeFilters(args?.view);

  return _useColumnConfig([
    {
      key: "name",
      render: (current: IL2Network) => (
        <div className={style.nameCell}>
          {args?.view?.includes("select") ? (
            <Text>{current?.name}</Text>
          ) : (
            <ResourceName
              value={current?.name}
              isRouterManaged
              link={{
                to: `/l2-network`,
                microAppName: "virtualization-resource",
                uuid: current?.uuid,
                leftnav: LeftNavType.Network,
              }}
            />
          )}
          {current.isDefault && (
            <Tag round level="weak" className={style.defaultTag}>
              {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
            </Tag>
          )}
        </div>
      ),
    },
    {
      key: "type",
      filterOptions,
    },
    {
      key: "networkAccelerationMode",
      auth: {
        type: "block",
        authKey: "networkAccelerationMode",
        resource: "l2.network",
      },
      render: (row: IL2Network) => renderNetworkAccelerationMode(row, intl),
      filters: [
        {
          text: intl.formatMessage({
            id: "l2network.networkAccelerationMode.normal",
            defaultMessage: "Standard",
          }),
          value: INetworkAccelerationMode.Normal,
        },
        {
          text: intl.formatMessage({
            id: "l2network.networkAccelerationMode.srIov",
            defaultMessage: "SR-IOV",
          }),
          value: INetworkAccelerationMode.SrIov,
        },
        {
          text: intl.formatMessage({
            id: "l2network.networkAccelerationMode.smartNic",
            defaultMessage: "Smart NIC",
          }),
          value: INetworkAccelerationMode.SmartNic,
        },
      ],
    },
    {
      key: "physicalInterface",
      title: intl.formatMessage({
        id: "virtualization.up.bond.with.nickname",
        defaultMessage: "Uplink (Bond)",
      }),
    },
    {
      key: "virtualization.vni",
      formatter: (l2: IL2Network) => l2.vlan || l2.vni || "",
      sortKey: "virtualNetworkId",
    },
    {
      key: "shareType",
      render: (row: IL2Network) => {
        return <ShareType type={row.shareType!} />;
      },
      filters: shareTypeFilters,
      filterEnumType: ConstantType.ShareType,
      auth: {
        type: "block",
        authKey: "share.type",
        resource: "common",
      },
    },
    {
      key: "owner",
      auth: { type: "block", authKey: "owner", resource: "l2.network" },
      render: (value: any) => {
        return (
          <Link.Owner uuid={value?.owner?.uuid} type={value?.owner?.type}>
            {value?.owner?.name}
          </Link.Owner>
        );
      },
    },
  ]);
};
