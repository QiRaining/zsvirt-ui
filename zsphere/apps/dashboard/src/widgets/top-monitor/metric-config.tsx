import type { IconTypes } from "@zstack/icon";
import { useIntl } from "react-intl";

export interface IMetricConfig {
  label: string;
  name: string;
  extraLabel?: string;
  value: string;
  namespace: string;
  microAppName: string;
  prefixPath: string;
  iconType: IconTypes;
  auth?: {
    authKey: string;
    resource: string;
    type: string;
  };
  children: {
    label: string;
    value: string;
    unit?: string;
    colorInverse?: boolean;
    disabled?: boolean;
    auth?: {
      authKey: string;
      resource: string;
      type: string;
    };
    children: {
      label: string;
      value: number;
      disabled?: boolean;
      auth?: {
        authKey: string;
        resource: string;
        type: string;
      };
    }[];
  }[];
}

function useMetricConfig() {
  const intl = useIntl();
  const metricConfig: IMetricConfig[] = [
    {
      label: intl.formatMessage({
        id: "vmInternalMonitoring",
        defaultMessage: "VM (Internal Monitor)",
      }),
      extraLabel: intl.formatMessage({
        id: "internalMonitor",
        defaultMessage: "Advanced Monitoring",
      }),
      name: intl.formatMessage({
        id: "vm",
        defaultMessage: "Virtual Machine",
      }),
      value: "vm-in",
      namespace: "ZStack/VM",
      microAppName: "virtualization-resource",
      prefixPath: "/vm/detail?uuid=",
      iconType: "monitor",
      auth: {
        authKey: "topMonitor.vmIn",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "cpuLoadUtilization",
            defaultMessage: " CPU Utilization",
          }),
          value: "OperatingSystemCPUAverageUsedUtilization",
          unit: "percentage",
          auth: {
            authKey: "topMonitor.vmIn.OperatingSystemCPUAverageUsedUtilization",
            resource: "dashboard",
            type: "block",
          },
          children: [
            {
              label: "3",
              value: 3,
              auth: {
                authKey:
                  "topMonitor.vmIn.OperatingSystemCPUAverageUsedUtilization.3",
                resource: "dashboard",
                type: "block",
              },
            },
            {
              label: "10",
              value: 10,
              auth: {
                authKey:
                  "topMonitor.vmIn.OperatingSystemCPUAverageUsedUtilization.10",
                resource: "dashboard",
                type: "block",
              },
            },
          ],
        },
        {
          label: intl.formatMessage({
            id: "memoryUsedInPercent",
            defaultMessage: " Memory Utilization",
          }),
          value: "OperatingSystemMemoryUsedPercent",
          auth: {
            authKey: "topMonitor.vmIn.OperatingSystemMemoryUsedPercent",
            resource: "dashboard",
            type: "block",
          },
          unit: "percentage",
          children: [
            {
              label: "3",
              value: 3,
              auth: {
                authKey: "topMonitor.vmIn.OperatingSystemMemoryUsedPercent.3",
                resource: "dashboard",
                type: "block",
              },
            },
            {
              label: "10",
              value: 10,
              auth: {
                authKey: "topMonitor.vmIn.OperatingSystemMemoryUsedPercent.10",
                resource: "dashboard",
                type: "block",
              },
            },
          ],
        },
        {
          label: intl.formatMessage({
            id: "diskCapacityUsedInPercent",
            defaultMessage: "Disk Storage Utilization",
          }),
          value: "DiskAllUsedCapacityInPercent",
          unit: "percentage",
          auth: {
            authKey: "topMonitor.vmIn.DiskAllUsedCapacityInPercent",
            resource: "dashboard",
            type: "block",
          },
          children: [
            {
              label: "3",
              value: 3,
              auth: {
                authKey: "topMonitor.vmIn.DiskAllUsedCapacityInPercent.3",
                resource: "dashboard",
                type: "block",
              },
            },
            {
              label: "10",
              value: 10,
              auth: {
                authKey: "topMonitor.vmIn.DiskAllUsedCapacityInPercent.10",
                resource: "dashboard",
                type: "block",
              },
            },
          ],
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "host",
        defaultMessage: "Host",
      }),
      name: intl.formatMessage({
        id: "host",
        defaultMessage: "Host",
      }),
      value: "host",
      namespace: "ZStack/Host",
      microAppName: "virtualization-resource",
      prefixPath: "/host/detail?uuid=",
      iconType: "hard-drive",
      auth: {
        authKey: "topMonitor.host",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "cpuLoadUtilization",
            defaultMessage: " CPU Utilization",
          }),
          value: "CPUAverageUsedUtilization",
          unit: "percentage",
          auth: {
            authKey: "topMonitor.host.CPUAverageUsedUtilization",
            resource: "dashboard",
            type: "block",
          },
          children: [
            {
              label: "3",
              value: 3,
              auth: {
                authKey: "topMonitor.host.CPUAverageUsedUtilization.3",
                resource: "dashboard",
                type: "block",
              },
            },
            {
              label: "10",
              value: 10,
              auth: {
                authKey: "topMonitor.host.CPUAverageUsedUtilization.10",
                resource: "dashboard",
                type: "block",
              },
            },
          ],
        },
        {
          label: intl.formatMessage({
            id: "memoryUsedInPercent",
            defaultMessage: " Memory Utilization",
          }),
          value: "MemoryUsedInPercent",
          unit: "percentage",
          auth: {
            authKey: "topMonitor.host.MemoryUsedInPercent",
            resource: "dashboard",
            type: "block",
          },
          children: [
            {
              label: "3",
              value: 3,
              auth: {
                authKey: "topMonitor.host.MemoryUsedInPercent.3",
                resource: "dashboard",
                type: "block",
              },
            },
            {
              label: "10",
              value: 10,
              auth: {
                authKey: "topMonitor.host.MemoryUsedInPercent.10",
                resource: "dashboard",
                type: "block",
              },
            },
          ],
        },
        {
          label: intl.formatMessage({
            id: "diskReadIops",
            defaultMessage: "Disk Read IOPS",
          }),
          value: "DiskAllReadOps",
          auth: {
            authKey: "topMonitor.host.DiskAllReadOps",
            resource: "dashboard",
            type: "block",
          },
          children: [
            {
              label: "3",
              value: 3,
              auth: {
                authKey: "topMonitor.host.DiskAllReadOps.3",
                resource: "dashboard",
                type: "block",
              },
            },
            {
              label: "10",
              value: 10,
              auth: {
                authKey: "topMonitor.host.DiskAllReadOps.10",
                resource: "dashboard",
                type: "block",
              },
            },
          ],
        },
        {
          label: intl.formatMessage({
            id: "diskWriteIops",
            defaultMessage: "Disk Write IOPS",
          }),
          value: "DiskAllWriteOps",
          auth: {
            authKey: "topMonitor.host.DiskAllWriteOps",
            resource: "dashboard",
            type: "block",
          },
          children: [
            {
              label: "3",
              value: 3,
              auth: {
                authKey: "topMonitor.host.DiskAllWriteOps.3",
                resource: "dashboard",
                type: "block",
              },
            },
            {
              label: "10",
              value: 10,
              auth: {
                authKey: "topMonitor.host.DiskAllWriteOps.10",
                resource: "dashboard",
                type: "block",
              },
            },
          ],
        },
        // 网卡出入速度
        // {
        //   label: intl.formatMessage({
        //     id: 'NetworkOutBytes',
        //     defaultMessage: '网卡出速度'
        //   }),
        //   value: 'NetworkOutBytes',
        //   unit: 'byteToSize'
        // },
        // {
        //   label: intl.formatMessage({
        //     id: 'NetworkInBytes',
        //     defaultMessage: '网卡入速度'
        //   }),
        //   value: 'NetworkInBytes',
        //   unit: 'byteToSize'
        // }
      ],
    },
  ];
  return {
    metricConfig,
  };
}

export default useMetricConfig;
