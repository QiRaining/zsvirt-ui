import { gql } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { TableDetailLink, Tag } from "@zstack/zsphere-components";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/physical-nic";
import { useAction } from "@zstack/zsphere-hooks";
import { LeftNavType } from "@zstack/zsphere-types";
import {
  HostStatus,
  NicState,
  PhysicalNetworkType,
  ELLDPMode,
} from "@zstack/zsphere-types";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import { useToggle } from "ahooks";
import cls from "classnames";
import { includes, debounce } from "lodash-es";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import { Status, State } from "../components";
import type { PciDeviceVirtStatus } from "../constant";
import { PicNicStatus } from "../constant";
import { useLldpModeMap } from "../hooks/use-lldp-mode-map";

import style from "./style.module.less";

const locateHostNetworkInterface = gql`
  mutation locateHostNetworkInterface(
    $input: LocateHostNetworkInterfaceInput!
  ) {
    locateHostNetworkInterface(input: $input) {
      actionId
    }
  }
`;

interface INicLightSwitch {
  interfaceName?: string;
  hostUuid?: string;
  speed?: number;
  state?: NicState;
  hostStatus?: HostStatus;
  type?: "icon" | "text";
  classNames?: string;
}

export const NicLightSwitch: FC<INicLightSwitch> = ({
  interfaceName,
  hostUuid,
  speed,
  state,
  hostStatus,
  type,
  classNames,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const lightDisabled =
    state !== NicState.UP || hostStatus !== HostStatus.Connected;
  const [lightOn, { toggle: toggleLight }] = useToggle(false);
  const hanleLightSwitch = () => {
    if (lightDisabled || !interfaceName || !hostUuid) {
      return;
    }
    doAction({
      mutation: locateHostNetworkInterface,
      payload: {
        hostUuid,
        networkInterfaceName: interfaceName,
      },
      name: intl.formatMessage({ id: "lightOn", defaultMessage: "Light Up" }),
      total: 1,
      onFinish: () => {
        toggleLight(true);
        const delay = speed === 1000 ? 15000 : 5000;
        setTimeout(() => {
          toggleLight(false);
        }, delay);
      },
    });
  };
  return (
    <div
      className={cls(
        style.lightSwitch,
        classNames,
        { [style.lightOn]: lightOn },
        { [style.disabled]: lightDisabled },
      )}
      onClick={debounce(hanleLightSwitch, 300)}
    >
      {type === "text" ? (
        <span>
          {intl.formatMessage({ id: "lightOn", defaultMessage: "Light Up" })}
        </span>
      ) : (
        <Icon type={lightOn ? "bulb-fill" : "bulb"} size={16} />
      )}
    </div>
  );
};

const getReadyState = (item: PhysicalNic) => {
  const carrierActive = item?.carrierActive;
  if (carrierActive) {
    return <Status status={PicNicStatus.Connected} />;
  }
  return <Status status={PicNicStatus.Notconnected} />;
};

// 速率格式化
export function formatSpeed(value?: string | number) {
  if (value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return `${Number(value) / 1000} Gbps`;
  }
  return `${value / 1000} Gbps`;
}

export const getNicNum = (item: PhysicalNic) => {
  const { vfAvailableNum = {} } = item?.pciDevice || {};
  const vfUsedNum =
    Number(vfAvailableNum.vfTotalNum) - Number(vfAvailableNum.vfAvailableNum);
  // 如果是已虚拟化的则展示VF可用量/VF总数
  if (
    item.pciDevice?.virtStatus === "SRIOV_VIRTUALIZED" ||
    item.pciDevice?.virtStatus === "VFIO_MDEV_VIRTUALIZED"
  ) {
    return `${vfUsedNum}/${item.pciDevice?.vfAvailableNum?.vfTotalNum}`;
  }
  // 如果是可虚拟化或不可虚拟化则展示-
  const virtStatusList = [
    "SRIOV_VIRTUALIZABLE",
    "VFIO_MDEV_VIRTUALIZABLE",
    "UNVIRTUALIZABLE",
  ];
  if (includes(virtStatusList, item.pciDevice?.virtStatus)) {
    return "-";
  }
};

export default ({ defaultSortByName, view, showDetail = true }: any) => {
  const intl = useIntl();

  const { modeMap } = useLldpModeMap();

  return useColumnConfig<PhysicalNic>([
    {
      key: "host",
      linkResource: {
        microAppName: "hardware",
        path: "host",
      },
    },
    {
      key: "ipv4.address",
      formatter: (item) => {
        const [ipv4] = item.ipAddresses?.[0]?.split("/") ?? [];
        return ipv4;
      },
    },
    {
      key: "bond",
      formatter: (item) => item.bond?.bondingName,
    },
    {
      key: "interfaceName",
      formatter: (hostNetworkInterface) =>
        hostNetworkInterface?.interfaceName?.replace(/_[0-9]*$/, ""),
      render: (hostNetworkInterface: PhysicalNic) => {
        const isActive = view.indexOf("select") === -1 && showDetail;
        const value = hostNetworkInterface?.interfaceName?.replace(
          /_[0-9]*$/,
          "",
        );
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text style={{ marginRight: "8px" }}>
              {isActive ? (
                <TableDetailLink currentRow={hostNetworkInterface}>
                  {value}
                </TableDetailLink>
              ) : (
                value
              )}
            </Text>
            {hostNetworkInterface.hostNetworkInterfaceServiceRef?.find((it) =>
              it.serviceTypes?.includes(PhysicalNetworkType.ManagementNetwork),
            ) && (
              <Tag round style={{ margin: 0, backgroundColor: "transparent" }}>
                {intl.formatMessage({
                  id: "physicalNetworkType.managementNetwork",
                  defaultMessage: "Management Network",
                })}
              </Tag>
            )}
            {hostNetworkInterface?.offloadStatus && (
              <Tag round style={{ margin: 0, backgroundColor: "transparent" }}>
                {intl.formatMessage({
                  id: "smart.nic",
                  defaultMessage: "Smart NIC",
                })}
              </Tag>
            )}
          </div>
        );
      },
      sorter: true,
      defaultSortOrder: defaultSortByName ? "ascend" : undefined,
    },
    {
      key: "carrierActive",
      formatter: (item) => getReadyState(item),
    },
    {
      key: "state",
      render: (record: PhysicalNic) => {
        const nicState = record?.state as any;
        // const hostConnected = record.host?.status === HostStatus.Connected
        return <Constant value={nicState} enumType={ConstantType.NicState} />;
      },
      filters: [
        {
          text: (
            <Constant
              value={ConstantEnum.UP}
              enumType={ConstantType.NicState}
            />
          ),
          // 布尔值的过滤，java bool到mysql会自动转换成tinyInt  --- 0 or 1
          value: 1,
        },
        {
          text: (
            <Constant
              value={ConstantEnum.DOWN}
              enumType={ConstantType.NicState}
            />
          ),
          value: 0,
        },
      ],
      searchKey: "carrierActive",
    },
    {
      key: "sr.iov.state",
      formatter: ({ pciDevice }) => {
        if (!pciDevice?.virtStatus) {
          return null;
        }
        return (
          <State
            state={pciDevice?.virtStatus as unknown as PciDeviceVirtStatus}
            isSriov
          />
        );
      },
    },
    {
      key: "used.vf.total.vf",
      formatter: (item) => getNicNum(item),
    },
    {
      key: "nicSpeed",
      formatter: (hostNetworkInterface) =>
        formatSpeed(hostNetworkInterface?.speed),
      sorter: true,
      sortKey: "speed",
    },
    {
      key: "lightSwtich",
      render: (record: PhysicalNic) => (
        <NicLightSwitch
          interfaceName={record?.interfaceName}
          hostUuid={record.host?.uuid}
          speed={record?.speed}
          state={record?.state}
          hostStatus={record?.host?.status}
        />
      ),
    },
    {
      key: "lLDPMode",
      formatter: (item) =>
        modeMap.get(item?.lLDPMode?.mode || ELLDPMode.rx_only),
    },
    {
      key: "vswitch",
      render: (current: PhysicalNic) => (
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
  ]);
};
