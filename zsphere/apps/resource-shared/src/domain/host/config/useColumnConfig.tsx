import { Text, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  Constant,
  Progress,
  ResourceName,
  TagList,
  useSearch,
  WebTerminalConfirmModal,
  Tag,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/host";
import type { IOption } from "@zstack/zsphere-engine/src/host/useColumnConfig";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import {
  CpuArchitecture,
  HostIPMIPowerStatus,
  HostState,
  HostStatus,
  NodeType,
} from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize, formatSecToPeriod } from "@zstack/zsphere-utils";
import { isEmpty, floor, floor as _floor, pick } from "lodash-es";
import qs from "qs";
import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router";

import style from "./style.module.less";

interface IWebTerminalWrapperProps {
  host: HostVO;
}

const renderHostNameWithBadge = ({
  intl,
  current,
  view = "select",
}: {
  intl: IntlShape;
  current: HostVO;
  view?: string;
}) => {
  const { hostNodeInfo } = current;
  const nameContent = view?.includes("select") ? (
    <Text>{current?.name}</Text>
  ) : (
    <ResourceName
      isRouterManaged
      value={current?.name}
      link={{
        to: `/host`,
        microAppName: "virtualization-resource",
        uuid: current?.uuid,
        leftnav: LeftNavType.ClusterHost,
        keepState: false,
      }}
    />
  );

  return (
    <div className={style.nameWrapper}>
      {nameContent}
      {hostNodeInfo?.nodeType === NodeType.ManagementNode && (
        <Tag round level="weak" className={style.tag}>
          {intl.formatMessage({
            id: "mangementNode",
            defaultMessage: "Management Node",
          })}
        </Tag>
      )}
    </div>
  );
};

const WebTerminalWrapper: FC<IWebTerminalWrapperProps> = ({ host }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);
  const checkIfWebTerminalEnabled = () => {
    return host.status === HostStatus.Connected;
  };

  return (
    <>
      <Tooltip
        title={
          checkIfWebTerminalEnabled()
            ? intl.formatMessage({
                id: "enter.web.terminal",
                defaultMessage: "Enter Web Terminal",
              })
            : intl.formatMessage({
                id: "host.open.console.disabled.tooltip",
                defaultMessage:
                  "The host is not connected or system service is abnormal, unable to enter Web terminal.",
              })
        }
      >
        <Icon
          onClick={() => {
            if (checkIfWebTerminalEnabled()) {
              setVisible(true);
            }
          }}
          type="web-shell"
          className={
            checkIfWebTerminalEnabled()
              ? style["webshell-enabled"]
              : style["webshell-disabled"]
          }
        />
      </Tooltip>
      <WebTerminalConfirmModal
        visible={visible}
        setVisible={setVisible}
        host={host}
      />
    </>
  );
};

interface IProps {
  view?: string;
}

export default ({ view }: IProps) => {
  const { zopsSupportable } = usePlatformStore();

  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const filterStatus = searchParams.get("dashboardState") as string;
  const { searchId } = useSearch("host", view);

  const getFilteredStatus = useCallback(() => {
    const searchObj = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    if (searchObj && Object.keys(searchObj).includes("dashboardState")) {
      sessionStorage.removeItem(searchId);
    }
    switch (filterStatus) {
      case "Connected":
        return [HostStatus.Connected];
      case "Disconnected":
        return [HostStatus.Disconnected];
      case "other":
        return [HostStatus.Connecting];
      default:
        return [];
    }
  }, [filterStatus, searchId]);

  const emptyText = (
    <span className="emptyText">
      {intl.formatMessage({ id: "no.data", defaultMessage: "No Data" })}
    </span>
  );

  const renderRuntime = (connectedTime: string) => {
    const millseconds =
      window.timeService.getCurrentTime() - parseInt(connectedTime || "0", 10);
    const seconds = Math.floor(millseconds / 1000);
    return formatSecToPeriod(seconds, intl);
  };

  const baseOptions: IOption<HostVO> = useMemo(
    () => [
      {
        key: "name",
        linkResource: {
          microAppName: "virtualization-resource",
          path: "host",
        },
        render: (current: HostVO) => {
          return renderHostNameWithBadge({
            intl,
            current,
            view,
          });
        },
      },
      {
        key: "__tagUuid__",
        gqlKey: "tag",
        render: ({ tag }) => {
          if (!tag?.length) {
            return null;
          }
          return <TagList tags={tag} />;
        },
        exportToCSVRender: ({ tag }: HostVO) => {
          return tag?.map((item) => item.name ?? "").join(",") ?? "";
        },
        auth: {
          type: "block",
          authKey: "tag",
          resource: "host",
        },
      },
      {
        key: "cluster",
        linkResource: {
          microAppName: "hardware",
          path: "cluster",
        },
        auth: {
          type: "block",
          authKey: "cluster",
          resource: "host",
        },
      },
      {
        key: "hypervisorType",
        filterOptions: {
          KVM: "KVM",
          ESX: "ESX",
        },
      },
      {
        key: "architecture",
        filterOptions: pick(CpuArchitecture, [
          CpuArchitecture.x86_64,
          CpuArchitecture.aarch64,
        ]),
      },
      {
        key: "state",
        filterOptions: HostState,
        minWidth: 120,
        title: (
          <div className="flex items-center gap-1">
            <span>
              {intl.formatMessage({
                id: "enable.state",
                defaultMessage: "State",
              })}
            </span>
            <Tooltip
              placement="top"
              title={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "enable.state.table.tooltip",
                    defaultMessage: `**State**

1. Reflects the enablement, disablement, maintenance operations on a host. The state of a host includes Enabled, Disabled, Maintenance Mode, and Pre-Maintenance Mode.

2. Only when the host is in Enabled state can you create, start, or migrate a virtual machine on the host.

3. Pre-maintenance mode is an intermediate state before a host is entering into the maintenance mode. After all virtual machines are migrated or stopped, the intermediate state is changed into maintenance mode.`,
                  })}
                </ReactMarkdown>
              }
            >
              <span className="flex" style={{ flexShrink: 0 }}>
                <Icon type="info" className="info-icon" display="flex" />
              </span>
            </Tooltip>
          </div>
        ),
      },
      {
        key: "status",
        filterOptions: HostStatus,
        minWidth: 120,
        defaultFilteredValue: getFilteredStatus(),
        title: (
          <div className="flex items-center gap-1">
            <span>
              {intl.formatMessage({
                id: "ready.state",
                defaultMessage: "Status",
              })}
            </span>
            <Tooltip
              placement="top"
              title={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "ready.state.table.tooltip",
                    defaultMessage: `**Status**

1. Reflects the network connectivity of a host and the management node, including Connected, Connecting, and Disconnected.

2. Only when the host is connected to the management node can you create or start a virtual machine on the host.`,
                  })}
                </ReactMarkdown>
              }
            >
              <span className="flex" style={{ flexShrink: 0 }}>
                <Icon type="info" className="info-icon" display="flex" />
              </span>
            </Tooltip>
          </div>
        ),
      },
      {
        key: "ipmiPowerStatus",
        filterEnumType: ConstantType.HostIPMIPowerStatus,
        filterOptions: HostIPMIPowerStatus,
        auth: {
          type: "block",
          authKey: "ipmiPowerStatus",
          resource: "host",
        },
        render: ({ ipmiPowerStatus }) => {
          return (
            <Constant
              value={ipmiPowerStatus ?? HostIPMIPowerStatus.POWER_UNKNOWN}
              enumType={ConstantType.HostIPMIPowerStatus}
            />
          );
        },
        title: (
          <div className="flex items-center gap-1">
            <span>
              {intl.formatMessage({
                id: "power.status",
                defaultMessage: "Power Status",
              })}
            </span>
            <Tooltip
              placement="top"
              title={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "power.status.table.tooltip",
                    defaultMessage: `**Power Status**

1. Reflects the power status of a host.

2. IPMI unmanaged: After you add a host to the platform, the host is in IPMI Unmanaged status by default. In thus status, the power status of the host cannot be obtained.

3. If you modify the IPMI info of the host, it is managed via IPMI, then its power status becomes available, including Powered on, Powered off, Powering on, Powering off, and Unknown.`,
                  })}
                </ReactMarkdown>
              }
            >
              <span style={{ display: "flex" }}>
                <Icon type="info" style={{ color: "#C8CACD" }} />
              </span>
            </Tooltip>
          </div>
        ),
      },
      {
        key: "web.terminal",
        auth: {
          type: "action",
          authKey: "enter.web.terminal",
          resource: "host",
        },
        render: (host) => {
          return <WebTerminalWrapper host={host} />;
        },
      },
      {
        key: "runtime",
        render: ({ connectedTime }: HostVO) =>
          connectedTime ? renderRuntime(connectedTime) : "",
        exportToCSVRender: (row) => renderRuntime(row?.connectedTime) ?? "",
      },
      {
        key: "memorySize",
        render: (current: HostVO) =>
          formatBytesToSize(current.totalMemoryCapacity),
        exportToCSVRender: (current: HostVO) =>
          formatBytesToSize(current?.totalMemoryCapacity) ?? "",
      },
      {
        key: "cpuNum",
        formatter: (value) =>
          !isEmpty(value.cpuNum)
            ? `${value.cpuNum} ${intl.formatMessage({
                id: "core",
                defaultMessage: "Cores",
              })}`
            : undefined,
      },
    ],
    [intl, view, getFilteredStatus],
  );

  const memoOptions = useMemo(() => {
    if (view === "main" || ["select.vm.migration"].includes(view ?? "")) {
      return [
        ...baseOptions,
        {
          key: "average.cpu.usage",
          gqlKey: "globalConifg",
          exportToCSVRender: (row) => {
            if (Number(row?.globalConifg?.totalCpu) <= 0) {
              return "0%";
            }

            return `${_floor(
              Number(
                Number(
                  1 -
                    Number(
                      row?.globalConifg?.availableCpu < 0
                        ? 0
                        : row?.globalConifg?.availableCpu,
                    ) /
                      Number(row?.globalConifg?.totalCpu),
                ) * 100,
              ),
              2,
            )}%`;
          },
          render: (current: HostVO) => {
            const totalCpuHz =
              Number(current?.hostSystemInfo?.cpuGHz ?? 0) *
              Number(current?.hostSystemInfo?.cpuProcessorNum ?? 0);

            return current.hostUsage?.cpuUsed ? (
              <Progress.Bar
                size="middle"
                format={false}
                tooltipList={[
                  {
                    label: intl.formatMessage({
                      id: "hostTotal",
                      defaultMessage: "Physical Total",
                    }),
                    value: `${totalCpuHz.toFixed(2)} GHz`,
                  },
                  {
                    label: intl.formatMessage({
                      id: "physical.used",
                      defaultMessage: "Physical Used",
                    }),
                    value: `${(current.hostUsage?.cpuUsed ?? 0).toFixed(2)} %`,
                  },
                  {
                    label: intl.formatMessage({
                      id: "physical.available",
                      defaultMessage: "Physical Available",
                    }),
                    value: `${(100 - (current.hostUsage?.cpuUsed ?? 0)).toFixed(
                      2,
                    )} %`,
                  },
                ]}
                percent={current.hostUsage?.cpuUsed}
              />
            ) : (
              emptyText
            );
          },
        },
        {
          key: "memory.usage",
          gqlKey: "globalConifg",
          exportToCSVRender: (row) => {
            if (Number(row?.globalConifg?.totalMemory) <= 0) {
              return "0%";
            }

            return `${_floor(
              Number(
                Number(
                  1 -
                    Number(
                      row?.globalConifg?.availableMemory < 0
                        ? 0
                        : row?.globalConifg?.availableMemory,
                    ) /
                      Number(row?.globalConifg?.totalMemory),
                ) * 100,
              ),
              2,
            )}%`;
          },
          render: (current: HostVO) => {
            return current.hostUsage?.memoryUsed ? (
              <Progress.Bar
                size="middle"
                format={false}
                tooltipList={[
                  {
                    label: intl.formatMessage({
                      id: "hostTotal",
                      defaultMessage: "Physical Total",
                    }),
                    value: formatBytesToSize(current.totalMemoryCapacity),
                  },
                  {
                    label: intl.formatMessage({
                      id: "physical.used",
                      defaultMessage: "Physical Used",
                    }),
                    value: formatBytesToSize(
                      ((current.totalMemoryCapacity ?? 0) *
                        (current.hostUsage?.memoryUsed ?? 0)) /
                        100,
                    ),
                  },
                  {
                    label: intl.formatMessage({
                      id: "physical.available",
                      defaultMessage: "Physical Available",
                    }),
                    value: formatBytesToSize(
                      ((current.totalMemoryCapacity ?? 0) *
                        (100 - (current.hostUsage?.memoryUsed ?? 0))) /
                        100,
                    ),
                  },
                ]}
                percent={current.hostUsage?.memoryUsed}
              />
            ) : (
              emptyText
            );
          },
        },
      ] as IOption<HostVO>;
    }

    if (
      [
        "sub.virtualization.zone",
        "sub.virtualization.cluster",
        "sub.virtualization.primary.storage",
      ].includes(view ?? "")
    ) {
      return [
        ...baseOptions,
        {
          key: "average.cpu.usage",
          gqlKey: "globalConifg",
          render: (current: HostVO) => {
            const totalCpuHz =
              Number(current?.hostSystemInfo?.cpuGHz ?? 0) *
              Number(current?.hostSystemInfo?.cpuProcessorNum ?? 0);

            return current.hostUsage?.cpuUsed ? (
              <Progress.Bar
                size="middle"
                format={false}
                tooltipList={[
                  {
                    label: intl.formatMessage({
                      id: "hostTotal",
                      defaultMessage: "Physical Total",
                    }),
                    value: `${totalCpuHz.toFixed(2)} GHz`,
                  },
                  {
                    label: intl.formatMessage({
                      id: "physical.used",
                      defaultMessage: "Physical Used",
                    }),
                    value: `${(current.hostUsage?.cpuUsed ?? 0).toFixed(2)} %`,
                  },
                  {
                    label: intl.formatMessage({
                      id: "physical.available",
                      defaultMessage: "Physical Available",
                    }),
                    value: `${(100 - (current.hostUsage?.cpuUsed ?? 0)).toFixed(
                      2,
                    )} %`,
                  },
                ]}
                percent={current.hostUsage?.cpuUsed}
              />
            ) : (
              emptyText
            );
          },
          exportToCSVRender: (row) => {
            const total = Number(row?.globalConifg?.totalCpu);
            const available = Number(row?.globalConifg?.availableCpu);
            if (Number.isNaN(total) || Number.isNaN(available) || total <= 0) {
              return "0%";
            }
            const idle = Math.max(0, available) / total;
            const used = Math.max(0, 1 - idle) * 100;
            return `${floor(used, 2)}%`;
          },
        },
        {
          key: "memory.usage",
          gqlKey: "globalConifg",
          render: (current: HostVO) => {
            return current.hostUsage?.memoryUsed ? (
              <Progress.Bar
                size="middle"
                format={false}
                tooltipList={[
                  {
                    label: intl.formatMessage({
                      id: "hostTotal",
                      defaultMessage: "Physical Total",
                    }),
                    value: formatBytesToSize(current.totalMemoryCapacity),
                  },
                  {
                    label: intl.formatMessage({
                      id: "physical.used",
                      defaultMessage: "Physical Used",
                    }),
                    value: formatBytesToSize(
                      ((current.totalMemoryCapacity ?? 0) *
                        (current.hostUsage?.memoryUsed ?? 0)) /
                        100,
                    ),
                  },
                  {
                    label: intl.formatMessage({
                      id: "physical.available",
                      defaultMessage: "Physical Available",
                    }),
                    value: formatBytesToSize(
                      ((current.totalMemoryCapacity ?? 0) *
                        (100 - (current.hostUsage?.memoryUsed ?? 0))) /
                        100,
                    ),
                  },
                ]}
                percent={current.hostUsage?.memoryUsed}
              />
            ) : (
              emptyText
            );
          },
          exportToCSVRender: (row) => {
            const used = row?.hostUsage?.memoryUsed ?? 0;
            if (used <= 0) {
              return "0%";
            }
            return `${_floor(used, 2)}%`;
          },
        },
      ] as IOption<HostVO>;
    }

    if (view === "sub.virtualization.not.in.vswitch") {
      return [
        ...baseOptions,
        {
          key: "host.for.bond",
          render: (current: HostVO) => (
            <ResourceName
              value={current.name}
              link={{
                to: `/host`,
                microAppName: "virtualization-resource",
                uuid: current.uuid,
                leftnav: LeftNavType.ClusterHost,
              }}
            />
          ),
        },
        {
          key: "bondingName",
          formatter: (current: HostVO) =>
            current.bondRelatedVSwitch?.[0]?.bondingName ?? "-",
        },
        {
          key: "bond.compose",
          formatter: (current: HostVO) =>
            current.bondRelatedVSwitch?.[0]?.slaves
              ?.map((it) => it.interfaceName)
              ?.join(",") ?? "-",
        },
        {
          key: "bond.mode",
          formatter: (current: HostVO) =>
            current.bondRelatedVSwitch?.[0]?.mode ?? "-",
        },
        {
          key: "virtualization.hashPolicy",
          formatter: (current: HostVO) =>
            current.bondRelatedVSwitch?.[0]?.xmitHashPolicy ?? "-",
        },
      ];
    }

    return [
      ...baseOptions,
      {
        sorter: false,
        gqlKey: "hostZWatchInfo",
        key: "average.cpu.usage",
        formatter: (value) => value?.hostZWatchInfo?.cpuAllIdleUtilization,
      },
      {
        sorter: false,
        gqlKey: "hostZWatchInfo",
        key: "memory.usage",
        formatter: (value) => value?.hostZWatchInfo?.memoryFreeInPercent,
      },
    ] as IOption<HostVO>;
  }, [baseOptions, emptyText, intl, view]);

  const options = useMemo(() => memoOptions as IOption<HostVO>, [memoOptions]);

  const config = useColumnConfig<HostVO>(options);

  if (!zopsSupportable && config?.list) {
    config.list = config?.list?.filter((item) => item?.key !== "web.terminal");
  }

  return config;
};
