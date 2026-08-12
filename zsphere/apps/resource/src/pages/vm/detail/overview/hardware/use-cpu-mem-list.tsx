import { Spin, Tag } from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import type {
  ResourceConfigInPage as IResourceConfigInPage,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

function formatNumber(num: any) {
  // 先将数字四舍五入到小数点后两位
  const rounded = Math.round(num * 100) / 100;

  // 如果是整数，直接返回整数
  if (Math.floor(rounded) === rounded) {
    return rounded.toString();
  }

  // 否则，返回保留两位小数的数字
  return rounded.toFixed(2);
}

export const useCpuMemoryList = (
  vm: IVM,
  _resourceConfig: { [prop: string]: IResourceConfigInPage },
  hostCpuGHzData: { host: { hostSystemInfo: { cpuGHz: any } } },
  resourceConfigLoading?: boolean,
) => {
  const intl = useIntl();

  const renderResourceConfigBoolean = (key: string) => {
    if (resourceConfigLoading) {
      return <Spin size="small" />;
    }
    return _resourceConfig?.[key]?.value === "true"
      ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
      : intl.formatMessage({ id: "close", defaultMessage: "Disabled" });
  };

  const resourceConfig = useMemo(() => {
    // 目前先只考虑集群。
    //
    // if (vm.cpuModeInfo?.dependentResourceType === DependentResourceType.ClusterVO) {
    //   return intl.formatMessage(
    //     {
    //       id: 'resourceConfig.use.cluster.cpuMode',
    //       defaultMessage: '{resourceConfig} (使用集群设置)'
    //     },
    //     {
    //       resourceConfig: vm.cpuModeInfo?.value
    //     }
    //   )
    // }

    const cpuModelForArchMap: any = {
      none: intl.formatMessage({
        id: "none",
        defaultMessage: "None",
      }),
      "host-model": intl.formatMessage({
        id: "vm.cpuMode.hostModel",
        defaultMessage: "Compatible",
      }),
      "host-passthrough": intl.formatMessage({
        id: "vm.cpuMode.hostPassthrough",
        defaultMessage: "Passthrough",
      }),
    };

    return (
      cpuModelForArchMap?.[vm.cpuModeInfo?.value ?? ""] ?? vm.cpuModeInfo?.value
    );
  }, [intl, vm.cpuModeInfo?.value]);

  const resourcePriorityMap = new Map();
  resourcePriorityMap.set(
    "Normal",
    intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
  );
  resourcePriorityMap.set(
    "High",
    intl.formatMessage({ id: "high", defaultMessage: "High" }),
  );

  const list = useMemo(() => {
    const cpuQuotaContent = _resourceConfig?.["vm.cpu.quota"]?.value ? (
      <div className="flex items-center gap-2">
        <span>
          {`${formatNumber(
            parseFloat(
              String(Number(_resourceConfig["vm.cpu.quota"].value) / 10000),
            ),
          )}%`}
        </span>
        <span className={style.split}>|</span>
        <span>
          {`${
            (
              parseFloat(
                String(Number(_resourceConfig["vm.cpu.quota"].value) / 1000000),
              ) * (hostCpuGHzData?.host?.hostSystemInfo?.cpuGHz ?? 0)
            ).toFixed(2) ?? 0
          }GHz`}
        </span>
      </div>
    ) : (
      intl.formatMessage({ id: "unlimited", defaultMessage: "Unlimited" })
    );

    return [
      {
        label: (
          <>
            <Illustration type="cpu" size={16} />
            CPU
          </>
        ),
        value: vm.cpuNum,
        children: [
          {
            label: intl.formatMessage({
              id: "core.num",
              defaultMessage: "Cores",
            }),
            value: vm.cpuNum,
          },
          {
            label: intl.formatMessage({
              id: "core.num.in.slot",
              defaultMessage: "Cores per Socket",
            }),
            value: vm.systemTag?.cpuCores
              ? parseInt(vm.systemTag.cpuCores, 10)
              : vm.cpuNum,
          },
          {
            label: intl.formatMessage({
              id: "cpuMode",
              defaultMessage: "CPU Mode",
            }),
            value: resourceConfig,
          },
          {
            label: intl.formatMessage({
              id: "cpu.resourcePriority",
              defaultMessage: "CPU Resource Priority",
            }),
            value:
              ["High", "CpuHigh"].indexOf(vm.systemTag?.vmPriority ?? "") > -1
                ? intl.formatMessage({ id: "high", defaultMessage: "High" })
                : intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
          },
          {
            label: intl.formatMessage({
              id: "virtualization.create.instance.cpu.clock.speed.limit",
              defaultMessage: "CPU Clock Speed Limit",
            }),
            value: cpuQuotaContent,
          },
          {
            label: intl.formatMessage({
              id: "bind.physical.cpu",
              defaultMessage: "Bind Physical CPU",
            }),
            value: vm?.systemTag?.vmCpuPinningList?.map((cv, index) => {
              return (
                <Tag
                  key={`${cv?.vCPU}-${cv?.pCPU}-${index}`}
                  color="#F0F2F5"
                  style={{ margin: "0 4px 4px 0" }}
                >
                  {cv?.vCPU}:{cv?.pCPU}
                </Tag>
              );
            }),
          },
          {
            label: intl.formatMessage({
              id: "cpu.hotPlugEnabled",
              defaultMessage: "CPU Hot Plug",
            }),
            value: renderResourceConfigBoolean("numa"),
          },
          {
            label: intl.formatMessage({
              id: "hide.cpu.virtual.tag",
              defaultMessage: "CPU Hypervisor Tag",
            }),
            value: renderResourceConfigBoolean("vm.cpu.hypervisor.feature"),
          },
        ],
      },
      {
        label: (
          <>
            <Illustration type="memory" size={16} />
            {intl.formatMessage({ id: "memory", defaultMessage: "Memory" })}
          </>
        ),
        value: formatBytesToSize(vm.memorySize),
        children: [
          {
            label: intl.formatMessage({
              id: "metric.name.host.MemoryCapacityTotal",
              defaultMessage: "Memory Capacity",
            }),
            value: formatBytesToSize(vm.memorySize),
          },
          {
            label: intl.formatMessage({
              id: "memory.resourcePriority",
              defaultMessage: "Memory Resource Priority",
            }),
            value:
              ["High", "MemoryHigh"].indexOf(vm.systemTag?.vmPriority ?? "") >
              -1
                ? intl.formatMessage({ id: "high", defaultMessage: "High" })
                : intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
          },

          {
            label: intl.formatMessage({
              id: "memory.hotPlugEnabled",
              defaultMessage: "Memory Hot Plug",
            }),
            //coco 不要奇怪，内存/cpu热插拔，这俩地方合并了，
            value: renderResourceConfigBoolean("numa"),
          },
        ],
      },
    ];
  }, [
    vm,
    resourceConfig,
    _resourceConfig,
    resourceConfigLoading,
    hostCpuGHzData,
    intl,
  ]);
  return list;
};
