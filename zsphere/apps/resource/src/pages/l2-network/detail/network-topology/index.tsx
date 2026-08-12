import { useQuery } from "@apollo/client";
import { resourceRelations as resourceRelationsGql } from "@zstack/virtualization-resource/src/gql/resource-relations.gql";
import PhysicalNicDetail from "@zstack/virtualization-resource/src/pages/physical-nic/detail";
import { useDetailStore } from "@zstack/virtualization-resource/src/pages/physical-nic/hooks";
import {
  Constant,
  Link,
  useAuth,
  WebTerminalConfirmModal,
} from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { HostStatus, LeftNavType } from "@zstack/zsphere-types";
import type {
  L2Network as IL2Network,
  ResourceRelationsResp,
} from "@zstack/zsphere-types/graphql";
import { Space } from "antd";
import cls from "classnames";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import NetworkTopoGraph from "./graph";
import type { INetworkTopoProps } from "./graph/type";

import style from "./style.module.less";

interface IProps {
  current: IL2Network;
}

interface IHost {
  uuid: string;
  name: string;
  managementIp: string;
  hostSystemInfo: {
    systemSerialNumber: string;
  };
}

const NetworkTopo: FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { zopsSupportable } = usePlatformStore();
  const [terminalVisible, setHostTerminalVisible] = useState(false);
  const [activeHost, setActiveHost] = useState<IHost>();
  const { setVisible, setDetail } = useDetailStore();
  const [fullscreen, setFullscreen] = useState(false);
  const { hasAuth } = useAuth();

  const hasWebsshAuth = hasAuth({
    type: "block" as const,
    resource: "host",
    authKey: "web.ssh.link",
  });

  const {
    data: { resourceRelations } = {},
    loading,
    refetch,
  } = useQuery<{ resourceRelations: ResourceRelationsResp }>(
    resourceRelationsGql,
    {
      variables: {
        l2NetworkUuid: current.uuid,
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const dataSource = useMemo(() => {
    if (resourceRelations) {
      return resourceRelations.nodes as INetworkTopoProps["dataSource"];
    }
    return [];
  }, [resourceRelations]);

  const countProps = useMemo(() => {
    if (resourceRelations) {
      const {
        hostCount = 0,
        clusterCount = 0,
        l2Count = 0,
        l3Count = 0,
        vmCount = 0,
      } = resourceRelations;
      const defaultVmVisible = hostCount + vmCount < 1000;
      return {
        defaultVmVisible,
        hostCount,
        clusterCount,
        l2Count,
        l3Count,
        vmCount,
      };
    }
    return {};
  }, [resourceRelations]);

  const onRefresh = () => {
    refetch();
  };

  const handleHostTerminalClick = (detail: any) => {
    try {
      const { uuid, name, managementIp, systemSerialNumber } = detail;
      setActiveHost({
        uuid,
        name,
        managementIp,
        hostSystemInfo: {
          systemSerialNumber,
        },
      });
      setHostTerminalVisible(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleNicClick = (detail: any) => {
    setVisible(true);
    setDetail(detail);
  };

  const resourceTypeMap = useMemo(
    () =>
      new Map<string, string>([
        ["host", intl.formatMessage({ id: "host", defaultMessage: "Host" })],
        [
          "cluster.KVM",
          intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" }),
        ],
        [
          "cluster.baremetal",
          intl.formatMessage({
            id: "baremetal.cluster",
            defaultMessage: "Bare Metal Cluster",
          }),
        ],
        [
          "l2",
          intl.formatMessage({ id: "l2", defaultMessage: "Distributed Switch" }),
        ],
        [
          "l3",
          intl.formatMessage({ id: "l3", defaultMessage: "Distributed Port Group" }),
        ],
        ["vm", intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })],
      ]),
    [intl],
  );

  type Node = Parameters<
    Exclude<INetworkTopoProps["customTooltipContent"], undefined>
  >[0];
  const getResourceType = (node: Node) => {
    if (node.resourceType === "cluster") {
      return resourceTypeMap.get(`cluster.${node.detail?.hypervisorType}`);
    }
    return resourceTypeMap.get(node.resourceType);
  };

  const customTooltipContent: INetworkTopoProps["customTooltipContent"] = (
    node,
  ) => {
    const { resourceType, detail } = node;
    const renderDetail = () => {
      switch (resourceType) {
        case "host": {
          return (
            <>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "host.ip",
                    defaultMessage: "Host IP",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  {detail.managementIp}
                </div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "enable.state",
                    defaultMessage: "State",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  <Constant
                    value={detail.state}
                    enumType={ConstantType.HostState}
                  />
                </div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "ready.state",
                    defaultMessage: "Status",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  <Constant
                    value={detail.status}
                    enumType={ConstantType.HostStatus}
                  />
                </div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "host.physical.interface",
                    defaultMessage: "Host NIC",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  {detail.hostNicList?.map((nic: any) => (
                    <div className={style["tooltip-item"]} key={nic.uuid}>
                      <Space size={8} key={nic.interfaceName}>
                        <span>{nic.interfaceName}</span>
                        {nic.carrierActive ? (
                          <Constant
                            value={ConstantEnum.UP}
                            enumType={ConstantType.NicState}
                          />
                        ) : (
                          <Constant
                            value={ConstantEnum.DOWN}
                            enumType={ConstantType.NicState}
                          />
                        )}
                        <a
                          className={style["tooltip-link"]}
                          onClick={() => {
                            handleNicClick(nic);
                          }}
                        >
                          {intl.formatMessage({
                            id: "detail",
                            defaultMessage: "Details",
                          })}
                        </a>
                      </Space>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        }
        case "cluster": {
          return (
            <div className={style["tooltip-item"]}>
              <div className={style["tooltip-item-left"]}>
                {detail?.hypervisorType === "baremetal"
                  ? intl.formatMessage({
                      id: "baremetalChassis.count",
                      defaultMessage: "Bare Metal Chassis",
                    })
                  : intl.formatMessage({
                      id: "host.num",
                      defaultMessage: "Hosts",
                    })}
                {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
              </div>
              <div className={style["tooltip-item-right"]}>
                {detail?.hypervisorType === "baremetal"
                  ? detail.baremetalChassisCount
                  : detail.hostCount}
              </div>
            </div>
          );
        }
        case "l2": {
          const bond = detail.hostBondList?.[0];
          const bondName = bond?.bondingName || detail.physicalInterface;
          const bondMode = bond?.mode || detail.bondingMode;
          const policy = bond?.xmitHashPolicy || detail.xmitHashPolicy;
          return (
            <>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "up.bond",
                    defaultMessage: "Uplink",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  <Space direction="vertical" size={4}>
                    <div>
                      {bondName ||
                        intl.formatMessage({
                          id: "none",
                          defaultMessage: "None",
                        })}
                    </div>
                    {bondMode ? (
                      <Space size={8} split="|">
                        {bondMode.includes("active-backup") ? "mode1" : "mode4"}
                        {policy}
                      </Space>
                    ) : null}
                  </Space>
                </div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "port.group.num",
                    defaultMessage: "Number of Port Groups",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  {detail.portGroupCount}
                </div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "cluster.num",
                    defaultMessage: "Clusters",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  {detail.clusterCount}
                </div>
              </div>
            </>
          );
        }
        case "l3": {
          const isNoVlan = detail.vlanId === 0;
          return (
            <>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "vm.num",
                    defaultMessage: "VMs",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  {detail.vmCount}
                </div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>VLAN ID:</div>
                <div
                  className={cls(style["tooltip-item-right"], {
                    [style["tooltip-item-right-weak"]]: isNoVlan,
                  })}
                >
                  {isNoVlan
                    ? intl.formatMessage({ id: "none", defaultMessage: "None" })
                    : detail.vlanId}
                </div>
              </div>
            </>
          );
        }
        case "vm": {
          return detail.vmNicList?.map((nic: any, index: number) => (
            <div key={nic.mac}>
              <div className={style["tooltip-item"]}>
                {intl.formatMessage({ id: "netcard", defaultMessage: "NIC" })}
                {index + 1}
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "nic.name",
                    defaultMessage: "NIC Name",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  {nic.internalName}
                </div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "mac.address",
                    defaultMessage: "MAC Address",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>{nic.mac}</div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "ipv4.address",
                    defaultMessage: "IPv4 Address",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  {nic.usedIps?.find((item: any) => item.ipVersion === 4)?.ip ||
                    "-"}
                </div>
              </div>
              <div className={style["tooltip-item"]}>
                <div className={style["tooltip-item-left"]}>
                  {intl.formatMessage({
                    id: "ipv6.address",
                    defaultMessage: "IPv6 Address",
                  })}
                  {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
                </div>
                <div className={style["tooltip-item-right"]}>
                  {nic.usedIps?.find((item: any) => item.ipVersion === 6)?.ip ||
                    "-"}
                </div>
              </div>
            </div>
          ));
        }
        default:
          return null;
      }
    };

    const renderLink = () => {
      let to = `/${resourceType}`;
      let leftnav: LeftNavType = LeftNavType.Network;
      if (resourceType === "l2") {
        to = "/l2-network";
      } else if (resourceType === "l3") {
        to = "/l3-network";
      } else if (
        resourceType === "cluster" &&
        node.detail?.hypervisorType === "baremetal"
      ) {
        to = "/baremetal-cluster";
        leftnav = LeftNavType.BareMetal;
      } else {
        leftnav = LeftNavType.ClusterHost;
      }
      return (
        <Link.Detail
          uuid={detail.uuid}
          to={to}
          microAppName="virtualization-resource"
          leftnav={leftnav}
          className={style["tooltip-link"]}
        >
          {intl.formatMessage({
            id: "view.detail",
            defaultMessage: "View Details",
          })}
        </Link.Detail>
      );
    };

    const renderTerminal = () => {
      if (resourceType === "host" && hasWebsshAuth) {
        const isConnected = detail.status === HostStatus.Connected;
        if (zopsSupportable && isConnected) {
          return (
            <a
              className={style["tooltip-link"]}
              onClick={() => {
                handleHostTerminalClick(detail);
              }}
            >
              {intl.formatMessage({
                id: "enter.web.terminal",
                defaultMessage: "Enter Web Terminal",
              })}
            </a>
          );
        }
      }
      return null;
    };

    return (
      <div className={style.tooltip}>
        <div className={style["tooltip-title"]}>{detail.name}</div>
        <div className={style["tooltip-item"]}>
          <div className={style["tooltip-item-left"]}>
            {intl.formatMessage({
              id: "resource.type",
              defaultMessage: "Resource Type",
            })}
            {intl.formatMessage({ id: "colon", defaultMessage: ":" })}
          </div>
          <div className={style["tooltip-item-right"]}>
            {getResourceType(node)}
          </div>
        </div>
        {renderDetail()}
        <div>
          <Space>
            {renderLink()}
            {renderTerminal()}
          </Space>
        </div>
      </div>
    );
  };

  const renderHostModal = useMemo(() => {
    if (resourceRelations?.hostCount) {
      const modalContainer = fullscreen
        ? "#zstack-network-topo-container"
        : undefined;
      return (
        <>
          <WebTerminalConfirmModal
            visible={terminalVisible}
            setVisible={setHostTerminalVisible}
            host={activeHost}
            getContainer={modalContainer}
          />
          <PhysicalNicDetail canEdit={false} getContainer={modalContainer} />
        </>
      );
    }
    return null;
  }, [activeHost, resourceRelations?.hostCount, terminalVisible, fullscreen]);

  return (
    <>
      <NetworkTopoGraph
        dataSource={dataSource}
        loading={loading}
        onRefresh={onRefresh}
        customTooltipContent={customTooltipContent}
        onToggleFullscreen={setFullscreen}
        {...countProps}
      />
      {renderHostModal}
    </>
  );
};

export default NetworkTopo;
