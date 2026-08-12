import { gql, useQuery } from "@apollo/client";
import { InfoPopover, Text, Tooltip } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import {
  Constant,
  Link,
  Progress,
  ResourceName,
  State,
  TagList,
  ShareType,
  useShareTypeFilters,
  useSearch,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useColumnConfig } from "@zstack/zsphere-engine/src/vm";
import type { IOption } from "@zstack/zsphere-engine/src/vm/useColumnConfig";
import { formatValue, mergeOptions } from "@zstack/zsphere-engine/utils";
import type { IllustrationTypes } from "@zstack/zsphere-illustration";
import { Illustration } from "@zstack/zsphere-illustration";
import {
  CpuArchitecture,
  GuestToolsState,
  ImagePlatform,
  SchedulerJobState,
  VmInstanceSchedulingState,
  VmInstanceState,
} from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type {
  OvfExportEntity as OVF,
  UserGroup,
  VmInstance,
} from "@zstack/zsphere-types/graphql";
import {
  formatBytesToSize,
  formatSecToPeriod,
  formatStorage,
  sortVmNics,
} from "@zstack/zsphere-utils";
import { get, max, omit, pick, sumBy, round } from "lodash-es";
import qs from "qs";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router";

import { getGuestIcon, useGetGuestNameEnum } from "../../image/utils";
import useOpenConsoleAction from "../action/open-console";
import { verifyOpenConsole } from "../action/validators";

import style from "./style.module.less";

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

function getVmFromRecord(record: VmInstance | OVF): VmInstance | null {
  if (record && typeof record === "object" && "vmInstance" in record) {
    return (record as OVF).vmInstance ?? null;
  }
  return record as VmInstance;
}

export default (args: any) => {
  //TreeName
  const searchObj = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const navView = (searchObj?.navView as string) || "notGroup";
  const shareTypeFilters = useShareTypeFilters();
  const openConsole = useOpenConsoleAction();
  const intl = useIntl();

  const { getServerTime } = useTime();
  const guestNameEnum = useGetGuestNameEnum();

  // 判断是否为导出列表场景
  const isExportList =
    args?.view?.includes("export") || args?.view === "ovf-export";

  const emptyText = (
    <span className="emptyText">
      {intl.formatMessage({ id: "no.data", defaultMessage: "No Data" })}
    </span>
  );

  const { data: deletionPolicyData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "vm",
      name: "deletionPolicy",
    },
  });

  const { data: expungeIntervalData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "vm",
      name: "expungeInterval",
    },
  });

  const { data: expungePeriodData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "vm",
      name: "expungePeriod",
    },
  });

  const deletionPolicy = useMemo(() => {
    const _deletionPolicy = deletionPolicyData?.globalConfig;
    const expungeInterval = expungeIntervalData?.globalConfig;
    const expungePeriod = expungePeriodData?.globalConfig;
    const time = formatSecToPeriod(
      Number(
        max([Number(expungeInterval?.value), Number(expungePeriod?.value)]),
      ),
      intl,
    );

    return {
      policy: get(_deletionPolicy, "value"),
      time,
    };
  }, [deletionPolicyData, expungeIntervalData, expungePeriodData, intl]);

  const [searchParams] = useSearchParams();
  const filteredState =
    ["sub.virtualization.zone"].includes(args?.view) &&
    (searchParams.get("dashboardState") as string);
  const { searchId } = useSearch("vm", args?.view);
  const getFilteredState = useCallback(() => {
    // 处理首页卡片跳转到主机列表的过滤条件
    if (searchObj && Object.keys(searchObj).includes("dashboardState")) {
      sessionStorage.removeItem(searchId);
    }
    switch (filteredState) {
      case "Running":
        return [VmInstanceState.Running];
      case "Stopped":
        return [VmInstanceState.Stopped];
      case "other":
        return [
          VmInstanceState.Paused,
          VmInstanceState.Unknown,
          VmInstanceState.Crashed,
          VmInstanceState.Unknown,
          VmInstanceState.Starting,
          VmInstanceState.Stopping,
          VmInstanceState.Rebooting,
          VmInstanceState.Destroying,
          VmInstanceState.Migrating,
          VmInstanceState.Pausing,
          VmInstanceState.Resuming,
          VmInstanceState.VolumeMigrating,
        ];
      default:
        return [];
    }
  }, [filteredState, searchId, searchObj]);

  const nameNotShowLink = useMemo(() => {
    return ["select", "recyle"].some((item) => args?.view.includes(item));
  }, [args?.view]);

  const options = React.useMemo<IOption<VmInstance>>(
    () =>
      mergeOptions(
        [
          {
            key: "name",
            linkResource: {
              microAppName: "virtualization-resource",
              path: "vm",
            },
            render: (current: VmInstance) =>
              nameNotShowLink ? (
                <Text>{current?.name}</Text>
              ) : (
                <ResourceName
                  isRouterManaged
                  value={current?.name}
                  link={{
                    to: `/vm`,
                    microAppName: "virtualization-resource",
                    uuid: current?.uuid,
                    leftnav: LeftNavType.ClusterHost,
                    navView,
                    keepState: false,
                  }}
                />
              ),
          },

          {
            key: "console",
            auth: {
              authKey: "virtualization.console",
              resource: "vm",
              type: "action",
            },
            render: (vm: VmInstance) => {
              return verifyOpenConsole(vm) ? (
                <Tooltip
                  title={intl.formatMessage({
                    id: "open.console",
                    defaultMessage: `Launch Console`,
                  })}
                >
                  <Icon
                    onClick={(e) => {
                      openConsole(vm);
                      e.stopPropagation();
                    }}
                    className={style["console-enabled"]}
                    type="console"
                  />
                </Tooltip>
              ) : (
                <Icon type="console" className={style["console-disabled"]} />
              );
            },
            exportToCSVRender: () => "",
          },
          {
            key: "group",
            auth: {
              type: "block",
              resource: "vm",
              authKey: "vm.directory.tree",
            },
            gqlKey: ["group", "groupName", "uuid"],
            exportToCSVRender: ({ group }: VmInstance) => {
              return group?.uuid === "-2"
                ? intl.formatMessage({
                    id: "no.group",
                    defaultMessage: "Default",
                  })
                : group?.groupName || "";
            },
            render: ({ group, zoneUuid }: VmInstance) => {
              const value =
                group?.uuid === "-2"
                  ? intl.formatMessage({
                      id: "no.group",
                      defaultMessage: "Default",
                    })
                  : group?.groupName;
              return args.source?.__typename === "VMGroupDirectory" ? (
                <Text>{value}</Text>
              ) : (
                <ResourceName
                  value={value}
                  isRouterManaged
                  link={{
                    to: `/directory`,
                    microAppName: "virtualization-resource",
                    uuid: group?.uuid === "-2" ? `-2${zoneUuid}` : group?.uuid,
                    leftnav: LeftNavType.ClusterHost,
                    navView: NavView.Group,
                  }}
                />
              );
            },
          },
          {
            key: "host",
            linkResource: {
              microAppName: "virtualization-resource",
              path: "host",
            },
            render: ({ host }: VmInstance) => (
              <ResourceName
                value={host?.name}
                isRouterManaged
                link={{
                  leftnav: LeftNavType.ClusterHost,
                  to: `/host`,
                  microAppName: "virtualization-resource",
                  uuid: host?.uuid,
                }}
              />
            ),
            auth: {
              type: "block",
              authKey: "host",
              resource: "vm",
            },
            exportToCSVRender(value: VmInstance) {
              return value?.host?.name ?? "";
            },
          },
          {
            key: "cluster",
            linkResource: {
              microAppName: "virtualization-resource",
              path: "cluster",
            },
            render: ({ cluster }: VmInstance) => (
              <ResourceName
                value={cluster?.name}
                isRouterManaged
                link={{
                  leftnav: LeftNavType.ClusterHost,
                  to: `/cluster`,
                  microAppName: "virtualization-resource",
                  uuid: cluster?.uuid,
                }}
              />
            ),
            exportToCSVRender(value: VmInstance) {
              return value?.cluster?.name ?? "";
            },
          },
          {
            key: "primaryStorage",
            auth: {
              type: "block",
              authKey: "primary.storage",
              resource: "vm",
            },
            linkResource: {
              microAppName: "virtualization-resource",
              path: "primary-storage",
            },
            render: ({ primaryStorage }: VmInstance) => (
              <ResourceName
                value={primaryStorage?.name}
                isRouterManaged
                link={{
                  leftnav: LeftNavType.DataStorage,
                  to: `/primary-storage`,
                  microAppName: "virtualization-resource",
                  uuid: primaryStorage?.uuid,
                }}
              />
            ),
            exportToCSVRender(value: VmInstance) {
              return value?.primaryStorage?.name ?? "";
            },
          },
          {
            key: "lastHost",
            linkResource: {
              microAppName: "virtualization-resource",
              path: "host",
            },
            render: ({ lastHost }: VmInstance) => (
              <ResourceName
                value={lastHost?.name}
                isRouterManaged
                link={{
                  to: `/host`,
                  leftnav: LeftNavType.ClusterHost,
                  microAppName: "virtualization-resource",
                  uuid: lastHost?.uuid,
                }}
              />
            ),
            exportToCSVRender({ lastHost }: VmInstance) {
              return lastHost?.name ?? "";
            },
          },
          {
            key: "tag",
            title: intl.formatMessage({
              id: "tag",
              defaultMessage: "Tag",
            }),
            auth: {
              type: "block",
              resource: "vm",
              authKey: "tag",
            },
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const tag = vm?.tag;
              if (!tag?.length) {
                return null;
              }
              return <TagList tags={tag} />;
            },
            exportToCSVRender: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const tagList = vm?.tag;
              return tagList?.map((item) => item.name ?? "").join(",") ?? "";
            },
          },
          {
            key: "owner",
            render: (current: VmInstance & OVF) => {
              const owner = current.owner || current?.vmInstance?.owner;
              return owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e" ? (
                owner?.name
              ) : (
                <ResourceName
                  value={owner?.name}
                  isRouterManaged
                  link={{
                    leftnav: LeftNavType.ClusterHost,
                    to: `/account-information/user`,
                    microAppName: "virtualization-administration",
                    uuid: owner?.uuid,
                  }}
                />
              );
            },
            auth: {
              type: "block",
              authKey: "owner",
              resource: "vm",
            },
            exportToCSVRender(value?: VmInstance | OVF) {
              if (!value) {
                return "";
              }
              if ("owner" in value && value.owner) {
                return value.owner.name;
              }
              if (
                "vmInstance" in value &&
                value.vmInstance &&
                value.vmInstance.owner
              ) {
                return value.vmInstance.owner.name;
              }
              return "";
            },
          },
          {
            key: "guestOsType",
            filters: guestNameEnum?.map((it) => {
              return {
                text: (
                  <span
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <Illustration
                      type={it?.icon as IllustrationTypes}
                      size={16}
                    />
                    <span className={style["os-icon"]}>{it?.value}</span>
                  </span>
                ),
                value: it.value,
              };
            }),
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const guestOsType = vm?.guestOsType;
              const icon = getGuestIcon(guestOsType, guestNameEnum)?.icon;
              if (icon) {
                return (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Illustration type={icon as IllustrationTypes} size={16} />
                    <div style={{ minWidth: 0, marginLeft: 4 }}>
                      <Text>{guestOsType}</Text>
                    </div>
                  </div>
                );
              }
              return <Text>{guestOsType}</Text>;
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
            key: "cpuAverageUsedUtilization",
            minWidth: 120,
            title: (
              <div className="flex items-center gap-1">
                <span>
                  {intl.formatMessage({
                    id: "cpu.usage",
                    defaultMessage: "CPU Utilization",
                  })}
                </span>
                <InfoPopover
                  content={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.list.header.cpuAverageUsedUtilization.tooltip",
                        defaultMessage: `CPU Utilization\\nUninstalled VMTools on virtual machine, data source from basic monitoring.`,
                      })}
                    </ReactMarkdown>
                  }
                />
              </div>
            ),
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              return vm?.vmUsage?.cpuUsed ? (
                <Progress.Bar
                  size="middle"
                  tooltipList={[
                    {
                      label: intl.formatMessage({
                        id: "totalQuantity",
                        defaultMessage: "Total",
                      }),
                      value: `${vm?.cpuNum} ${intl.formatMessage({
                        id: "core",
                        defaultMessage: "Cores",
                      })}`,
                    },
                    {
                      label: intl.formatMessage({
                        id: "used",
                        defaultMessage: "Used",
                      }),
                      value: `${round(vm.vmUsage?.cpuUsed, 2)?.toString()} %`,
                    },
                    {
                      label: intl.formatMessage({
                        id: "available",
                        defaultMessage: "Available ",
                      }),
                      value: `${
                        round(
                          100 - (vm.vmUsage?.cpuUsed ?? 0),
                          2,
                        )?.toString() ?? ""
                      } %`,
                    },
                  ]}
                  percent={vm.vmUsage?.cpuUsed}
                  className={style.progressBar}
                  format={(percent) => (
                    <>{round(Number(percent), 2)?.toString() ?? ""}%</>
                  )}
                />
              ) : (
                emptyText
              );
            },
            exportToCSVRender: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              if (!vm?.vmUsage?.cpuUsed) {
                return "";
              }
              return `${round(Number(vm.vmUsage.cpuUsed), 2)?.toString()}%`;
            },
          },
          {
            key: "memoryUsedInPercent",
            minWidth: 120,
            title: (
              <div className="flex items-center gap-1">
                <span>
                  {intl.formatMessage({
                    id: "memory.usage",
                    defaultMessage: " Memory Utilization",
                  })}
                </span>
                <InfoPopover
                  content={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.list.header.memoryUsedInPercent.tooltip",
                        defaultMessage: `Memory Usage Rate\\nWhen the virtual machine has not been installed with VMTools, the data source comes from the foundation monitoring.`,
                      })}
                    </ReactMarkdown>
                  }
                />
              </div>
            ),
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              return vm?.vmUsage?.memoryUsed ? (
                <Progress.Bar
                  size="middle"
                  format={false}
                  tooltipList={[
                    {
                      label: intl.formatMessage({
                        id: "totalQuantity",
                        defaultMessage: "Total",
                      }),
                      value: formatBytesToSize(vm.memorySize),
                    },
                    {
                      label: intl.formatMessage({
                        id: "used",
                        defaultMessage: "Used",
                      }),
                      value: formatBytesToSize(
                        (vm.memorySize! * (vm.vmUsage?.memoryUsed ?? 0)) / 100,
                      ),
                    },
                    {
                      label: intl.formatMessage({
                        id: "available",
                        defaultMessage: "Available ",
                      }),
                      value: formatBytesToSize(
                        (vm.memorySize! *
                          (100 - (vm.vmUsage?.memoryUsed ?? 0))) /
                          100,
                      ),
                    },
                  ]}
                  percent={vm.vmUsage?.memoryUsed}
                />
              ) : (
                emptyText
              );
            },
            exportToCSVRender: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              if (!vm?.vmUsage?.memoryUsed) {
                return "";
              }
              return `${round(Number(vm.vmUsage.memoryUsed), 2)?.toString()}%`;
            },
          },
          {
            key: "vm.storage.usage",
            minWidth: 120,
            title: (
              <div className="flex items-center gap-1">
                <span>
                  {intl.formatMessage({
                    id: "primaryStorage.usage",
                    defaultMessage: "Storage Utilization",
                  })}
                </span>
                <InfoPopover
                  content={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "vm.list.header.storage.usage.tooltip",
                        defaultMessage: `### Storage Utilization Rate
1. When a virtual machine is mounted with a thick-provisioned hard disk, it will automatically occupy all available capacity by default.
2. The storage usage includes both the original hard disk capacity and snapshot capacity, which may exceed the total storage quantity.`,
                      })}
                    </ReactMarkdown>
                  }
                />
              </div>
            ),
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const totalVolumeSize = sumBy(vm?.allVolumes, "size");
              // 有 ZWatch 数据时（安装了 VMTools），使用 ZWatch 的存储使用量，与虚拟机详情页保持一致
              const hasZWatchData =
                vm?.vmUsage?.storageUsed != null && vm.vmUsage.storageUsed > 0;
              const usedNum = hasZWatchData
                ? vm!.vmUsage!.storageUsed!
                : sumBy(vm?.allVolumes, "actualSize") || 0;

              return totalVolumeSize ? (
                <Progress.Bar
                  format={false}
                  size="middle"
                  tooltipList={[
                    {
                      label: intl.formatMessage({
                        id: "totalQuantity",
                        defaultMessage: "Total",
                      }),
                      value: formatBytesToSize(totalVolumeSize),
                    },
                    {
                      label: intl.formatMessage({
                        id: "used",
                        defaultMessage: "Used",
                      }),
                      value: formatBytesToSize(usedNum),
                    },
                    {
                      label: intl.formatMessage({
                        id: "available",
                        defaultMessage: "Available ",
                      }),
                      value: formatBytesToSize(totalVolumeSize! - usedNum),
                    },
                  ]}
                  percent={((usedNum / totalVolumeSize) * 100).toFixed(2)}
                />
              ) : (
                emptyText
              );
            },
            exportToCSVRender: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const totalVolumeSize = sumBy(vm?.allVolumes, "size");
              const hasZWatchData =
                vm?.vmUsage?.storageUsed != null && vm.vmUsage.storageUsed > 0;
              const usedNum = hasZWatchData
                ? vm!.vmUsage!.storageUsed!
                : sumBy(vm?.allVolumes, "actualSize") || 0;

              if (!totalVolumeSize) {
                return "";
              }

              const percent = ((usedNum / totalVolumeSize) * 100).toFixed(2);
              return `${percent}%`;
            },
          },
          {
            key: "totalVolumeSize",
            title: intl.formatMessage({
              id: "storage",
              defaultMessage: "Storage",
            }),
            gqlKey: "allVolumes",
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const totalVolumeSize = sumBy(vm?.allVolumes, "size");
              return formatBytesToSize(totalVolumeSize);
            },
          },
          {
            key: "state",
            filterEnumType: ConstantType.VmInstanceState,
            filterOptions: pick(VmInstanceState, [
              VmInstanceState.Running,
              VmInstanceState.Stopped,
              VmInstanceState.Paused,
              VmInstanceState.Unknown,
              VmInstanceState.Crashed,
              ...(args?.view === "sub.virtualization.backup.policy"
                ? [VmInstanceState.Destroyed]
                : []),
              VmInstanceState.Starting,
              VmInstanceState.Stopping,
              VmInstanceState.Rebooting,
              VmInstanceState.Destroying,
              VmInstanceState.Migrating,
              VmInstanceState.Pausing,
              VmInstanceState.Resuming,
              VmInstanceState.VolumeMigrating,
            ]),
            ...(["recycle", "sub.virtualization.zone.recyle"].indexOf(
              args?.view,
            ) > -1
              ? { filters: undefined }
              : null),
            title: intl.formatMessage({
              id: "common.state",
              defaultMessage: "Status",
            }),
            defaultFilteredValue: getFilteredState(),
            render: (current) => {
              return current.state === VmInstanceState.VolumeRecovering ? (
                <span style={{ whiteSpace: "nowrap" }}>
                  <Constant
                    enumType={ConstantType.VmInstanceState}
                    value={current.state}
                  />
                  <Tooltip
                    title={intl.formatMessage({
                      id: "volumerecovering.vm.state.tooltip",
                      defaultMessage:
                        "This virtual machine is started and migrating the backup data now. During the migration, only the launch console operation is supported.",
                    })}
                  >
                    <Icon
                      style={{
                        marginLeft: 4,
                        cursor: "pointer",
                        verticalAlign: "middle",
                      }}
                      type="info"
                      color="disabled"
                    />
                  </Tooltip>
                </span>
              ) : (
                <Constant
                  enumType={ConstantType.VmInstanceState}
                  value={current.state}
                />
              );
            },
            // todo：下个版本需要在cloud增加 constantGroupMap 全局属性
            exportToCSVRender: ({ state }) => {
              const originProps = { name: state, contentType: "text" };
              // @ts-expect-error
              const { name } =
                window?.g_constant?.constantGroupMap?.get(
                  `${ConstantType.VmInstanceState}-${state}`,
                ) || originProps;
              return name || "";
            },
          },
          {
            key: "lastBackupJobResult",
            render: (current) => {
              if (!current.lastBackupJobResult) {
                return (
                  <State
                    type="queue"
                    name={intl.formatMessage({
                      id: "backup.pending",
                      defaultMessage: "To be backed up",
                    })}
                  />
                );
              }
              const { resultDump, success } = current.lastBackupJobResult;
              if (resultDump === "Running") {
                return (
                  <State
                    type="progress"
                    name={intl.formatMessage({
                      id: "backup.running",
                      defaultMessage: "Backing up",
                    })}
                  />
                );
              }
              if (success) {
                return (
                  <State
                    type="success"
                    name={intl.formatMessage({
                      id: "success",
                      defaultMessage: "Succeeded",
                    })}
                  />
                );
              }
              return (
                <State
                  type="error"
                  name={intl.formatMessage({
                    id: "fail",
                    defaultMessage: "Failed",
                  })}
                />
              );
            },
          },
          {
            key: "localBackupCapacity",
            formatter: (current) =>
              formatStorage(current.localBackupCapacity ?? 0, 2),
          },
          {
            key: "localBackupCount",
            formatter: (current) => current.localBackupCount ?? 0,
          },
          {
            key: "backupPriority",
            searchKey: "__backupPriority__",
            filters: [
              {
                text: intl.formatMessage({
                  id: "normal",
                  defaultMessage: "Normal",
                }),
                value: "normal",
              },
              {
                text: intl.formatMessage({ id: "high", defaultMessage: "High" }),
                value: "high",
              },
            ],
            render: (current: VmInstance) => {
              const priority =
                current.backupJob?.schedulerJobGroupJobRefs?.find(
                  (ref) =>
                    !!args?.source?.uuid &&
                    ref.schedulerJobGroupUuid === args.source.uuid,
                )?.priority ?? 0;
              return priority < 0
                ? intl.formatMessage({ id: "high", defaultMessage: "High" })
                : intl.formatMessage({ id: "normal", defaultMessage: "Normal" });
            },
          },
          {
            key: "shareType",
            render: (current: VmInstance) => {
              return <ShareType type={current.shareType!} />;
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
            key: "user.group",
            render: (current) => {
              return (
                <div style={{ display: "flex" }}>
                  {current.userGroup?.length
                    ? current?.userGroup?.reduce(
                        (
                          acc: React.ReactNode[],
                          userGroup: UserGroup,
                          index: number,
                        ) => {
                          const userGroupComponent = (
                            <ResourceName
                              key={userGroup.uuid}
                              value={userGroup.name}
                              isRouterManaged
                              link={{
                                uuid: userGroup.uuid,
                                to: `/account-information/user-group`,
                                microAppName: "virtualization-administration",
                              }}
                            />
                          );

                          if (index === 0) {
                            return [userGroupComponent];
                          }

                          return [...acc, ", ", userGroupComponent];
                        },
                        [],
                      )
                    : intl.formatMessage({
                        id: "none",
                        defaultMessage: "None",
                      })}
                </div>
              );
            },
          },
          {
            key: "backupJobState",
            searchKey: "__backupJobState__",
            render: (current) => (
              <Constant
                enumType={ConstantType.BackupJobState}
                value={current.backupJob?.state}
              />
            ),
            filterEnumType: ConstantType.BackupJobState,
            filterOptions: SchedulerJobState,
          },
          {
            key: "zone",
            render: (current) => (
              <ResourceName
                value={current.zone?.name}
                isRouterManaged
                link={{
                  leftnav: LeftNavType.ClusterHost,
                  to: `/zone`,
                  microAppName: "virtualization-resource",
                  uuid: current.zone?.uuid,
                }}
              />
            ),
          },
          {
            key: "format",
            render: (current: OVF & VmInstance) => {
              return <Text>{current.format || "OVA"}</Text>;
            },
          },
          {
            key: "cpuNum",
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const cpuNum = vm?.cpuNum;
              return (
                <div className="flex items-center gap-1">
                  {cpuNum}
                  {intl.formatMessage({ id: "core", defaultMessage: "Cores" })}
                </div>
              );
            },
            exportToCSVRender: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const cpuNum = vm?.cpuNum;
              return `${cpuNum}${intl.formatMessage({
                id: "core",
                defaultMessage: "Cores",
              })}`;
            },
          },
          {
            key: "schedulingState",
            title: () => {
              return (
                <>
                  {intl.formatMessage({
                    id: "schedulingState",
                    defaultMessage: "Scheduling Status",
                  })}
                  <InfoPopover
                    content={
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "vm.field.schedulingState.tooltip",
                          defaultMessage: "",
                        })}
                      </ReactMarkdown>
                    }
                  />
                </>
              );
            },
            filterEnumType: ConstantType.VmSchedulingState,
            filterOptions: VmInstanceSchedulingState,
            render: ({ schedulingState }) => {
              return (
                <Constant
                  value={schedulingState}
                  enumType={ConstantType.VmSchedulingState}
                />
              );
            },
            exportToCSVRender: ({ schedulingState }) => {
              const originProps = {
                name: schedulingState,
                contentType: "text",
              };
              const { name } =
                window.g_constant?.constantGroupMap?.get(
                  `${ConstantType.VmSchedulingState}-${schedulingState}`,
                ) || originProps;
              return name || "";
            },
          },
          {
            key: "ovfVmName",
            render: (current: OVF) => {
              const uuid = current?.vmInstance?.uuid;

              return (
                <ResourceName
                  isRouterManaged
                  value={current?.vmInstance?.name}
                  link={{
                    to: `/vm`,
                    microAppName: "virtualization-resource",
                    uuid,
                  }}
                />
              );
            },
          },
          {
            title: intl.formatMessage({
              id: "export.backupStorage",
              defaultMessage: "Image Storage",
            }),
            key: "export.backupStorage",
            width: 100,
            render: (current: OVF) => {
              const uuid = current?.backupStorage?.uuid;
              return (
                <ResourceName
                  isRouterManaged
                  value={current?.backupStorage?.name}
                  link={{
                    to: `/backup-storage`,
                    microAppName: "virtualization-resource",
                    uuid,
                    leftnav: LeftNavType.TemplateVm,
                  }}
                />
              );
            },
          },
          {
            key: "memorySize",
            formatter: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              return formatStorage(vm?.memorySize || 0, 2);
            },
            exportToCSVRender: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              return formatStorage(vm?.memorySize || 0, 2);
            },
          },
          {
            key: "ovfSize",
            formatter: (current: any) => {
              return formatStorage(current.size || 0, 2);
            },
          },
          {
            key: "ha",
            gqlKey: "vmHa",
            render: (current: VmInstance) => {
              return current?.vmHa?.haLevel === "NeverStop"
                ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
                : intl.formatMessage({ id: "close", defaultMessage: "Disabled" });
            },
            searchKey: "__HaLevel__",
            filters: [
              {
                text: intl.formatMessage({
                  id: "open",
                  defaultMessage: "Enabled",
                }),
                value: "NeverStop",
              },
              {
                text: intl.formatMessage({
                  id: "close",
                  defaultMessage: "Disabled",
                }),
                value: "None",
              },
            ],
            auth: {
              type: "block",
              authKey: "ha",
              resource: "vm",
            },
          },
          {
            key: "platform",
            filterOptions: omit(
              ImagePlatform,
              ImagePlatform.Paravirtualization,
              ImagePlatform.WindowsVirtio,
            ),
          },
          {
            key: "defaultIpv4",
            gqlKey: ["defaultL3NetworkUuid", "vmNics", "state"],
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const { defaultL3NetworkUuid, vmNics, state } = vm ?? {};
              if (state === "Destroyed") {
                return null;
              }
              const defaultipv4 = sortVmNics(vmNics ?? [], defaultL3NetworkUuid)
                ?.find((nic) => nic.l3NetworkUuid === defaultL3NetworkUuid)
                ?.usedIps?.find((ip) => ip.ipVersion === 4)?.ip;
              return defaultipv4 ? (
                <CopyableText key={defaultipv4}>{defaultipv4}</CopyableText>
              ) : null;
            },
            exportToCSVRender: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const { defaultL3NetworkUuid, vmNics, state } = vm ?? {};
              if (state === "Destroyed") {
                return intl.formatMessage({
                  id: "empty",
                  defaultMessage: "Empty",
                });
              }
              const defaultipv4 = sortVmNics(vmNics ?? [], defaultL3NetworkUuid)
                ?.find((nic) => nic.l3NetworkUuid === defaultL3NetworkUuid)
                ?.usedIps?.find((ip) => ip.ipVersion === 4)?.ip;
              return (
                defaultipv4 ||
                intl.formatMessage({ id: "empty", defaultMessage: "Empty" })
              );
            },
          },
          {
            key: "defaultIpv6",
            auth: {
              type: "block",
              authKey: "defaultIpv6",
              resource: "vm",
            },
            gqlKey: ["defaultL3NetworkUuid", "vmNics", "state"],
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const { defaultL3NetworkUuid, vmNics, state } = vm ?? {};
              if (state === "Destroyed") {
                return intl.formatMessage({
                  id: "empty",
                  defaultMessage: "Empty",
                });
              }
              const defaultipv6 = sortVmNics(vmNics ?? [], defaultL3NetworkUuid)
                ?.find((nic) => nic.l3NetworkUuid === defaultL3NetworkUuid)
                ?.usedIps?.find((ip) => ip.ipVersion === 6)?.ip;
              return defaultipv6 ? (
                <CopyableText key={defaultipv6}>{defaultipv6}</CopyableText>
              ) : (
                intl.formatMessage({ id: "empty", defaultMessage: "Empty" })
              );
            },
          },
          {
            key: "hostIp",
            gqlKey: "host",
            render: (record: VmInstance | OVF) => {
              const vm = getVmFromRecord(record);
              const hostIp = vm?.host?.managementIp;
              return hostIp ? (
                <CopyableText>{hostIp}</CopyableText>
              ) : (
                <Text className={style.empty}>
                  {intl.formatMessage({
                    id: "empty",
                    defaultMessage: "Empty",
                  })}
                </Text>
              );
            },
            auth: {
              type: "block",
              authKey: "hostIp",
              resource: "vm",
            },
          },
          {
            key: "vmGuesttool",
            render: ({
              toolsState,
              guestToolsState: toolsInfo,
            }: VmInstance) => {
              const content = (
                <>
                  <Constant
                    value={(toolsState as any) ?? GuestToolsState.Uninstall}
                    enumType={ConstantType.GuestToolsState}
                  />
                  {toolsState === GuestToolsState.Installed &&
                    toolsInfo?.version && (
                      <span style={{ marginLeft: "4px" }}>
                        {intl.formatMessage(
                          {
                            id: "vm.field.vmGuesttool.tip",
                            defaultMessage: "(Version: {version})",
                          },
                          { version: toolsInfo?.version },
                        )}
                      </span>
                    )}
                </>
              );
              return (
                <div className={style.guestToolWrapper}>
                  <Text>{content}</Text>
                </div>
              );
            },
            exportToCSVRender: ({ toolsState }: VmInstance) => {
              if (toolsState === GuestToolsState.Uninstall) {
                return intl.formatMessage({
                  id: "uninstall",
                  defaultMessage: "Not installed",
                });
              }
              if (toolsState === GuestToolsState.Installed) {
                return intl.formatMessage({
                  id: "installed",
                  defaultMessage: "Installed",
                });
              }
              return intl.formatMessage({
                id: "unsupport",
                defaultMessage: "Not supported",
              });
            },
            searchKey: "__VmGuestTools__",
            gqlKey: ["toolsState"],
            filterOptions: pick(GuestToolsState, [
              GuestToolsState.Installed,
              GuestToolsState.Uninstall,
            ]),
            filterEnumType: ConstantType.GuestToolsState,
          },

          // 保留时间
          // 目前的策略是直接针对全局
          {
            key: "retention.Period",
            title: (
              <div style={{ display: "flex", alignItems: "center" }}>
                {intl.formatMessage({
                  id: "retention.period",
                  defaultMessage: "Retention Period",
                })}
                <Tooltip
                  placement="top"
                  title={intl.formatMessage({
                    id: "vm.field.retention.period.tooltip",
                    defaultMessage: `The system checks for expired resources at the specified interval and automatically cleans them up. You can specify the time interval through Recycle Bin Expired Resources Cleanup Interval in the System Parameter. `,
                  })}
                >
                  <Icon
                    type="info"
                    style={{ marginLeft: 5, color: "#C8CACD" }}
                  />
                </Tooltip>
              </div>
            ),
            render: () => {
              if (deletionPolicy?.policy === "Delay") {
                return deletionPolicy?.time;
              }
              if (deletionPolicy?.policy === "Never") {
                return intl.formatMessage({
                  id: "never.delete",
                  defaultMessage: "Never Delete",
                });
              }
            },
          },
          {
            key: "createDate",
            exportToCSVRender: (value) => {
              const val = formatValue("createDate", value, options);
              return val || val === 0
                ? getServerTime(val).format("YYYY-MM-DD HH:mm:ss")
                : "";
            },
          },
          ...(isExportList
            ? ([
                {
                  key: "name",
                  render: (current: OVF) => {
                    const val = current?.name;
                    return val ? <Text>{val}</Text> : null;
                  },
                },
                {
                  key: "createDate",
                  title: intl.formatMessage({
                    id: "exportDate",
                    defaultMessage: "Export Time",
                  }),
                  render: (current: OVF) => {
                    const val = current.createDate;
                    return val
                      ? getServerTime(val).format("YYYY-MM-DD HH:mm:ss")
                      : null;
                  },
                },
                {
                  key: "zone",
                  render: (current: OVF) => (
                    <ResourceName
                      value={current.vmInstance?.zone?.name}
                      isRouterManaged
                      link={{
                        leftnav: LeftNavType.ClusterHost,
                        to: `/zone`,
                        microAppName: "virtualization-resource",
                        uuid: current.vmInstance?.zone?.uuid,
                      }}
                    />
                  ),
                },
                {
                  key: "vm",
                  render: (current: OVF) => {
                    if (
                      current.vmInstance?.state === VmInstanceState.Destroyed
                    ) {
                      return <Text>{current.vmInstance.name}</Text>;
                    }
                    return (
                      <ResourceName
                        value={current.vmInstance?.name}
                        canModify
                        isRouterManaged
                        link={{
                          leftnav: LeftNavType.ClusterHost,
                          to: "/vm",
                          microAppName: "virtualization-resource",
                          uuid: current.vmInstance?.uuid,
                        }}
                      />
                    );
                  },
                },
              ] as IOption<VmInstance>)
            : []),
        ],
        args?.options || [],
      ),
    [
      deletionPolicy,
      emptyText,
      getFilteredState,
      getServerTime,
      guestNameEnum,
      intl,
      isExportList,
      nameNotShowLink,
      navView,
      openConsole,
      shareTypeFilters,
      args?.options,
      args?.view,
      args?.source,
    ],
  );

  return useColumnConfig(options);
};
