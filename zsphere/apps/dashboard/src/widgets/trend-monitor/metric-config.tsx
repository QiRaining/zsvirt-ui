import { formatBytesToSize } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

export interface IMetricConfig {
  label: string;
  value: string;
  namespace: string;
  disabled?: boolean;
  auth?: {
    authKey: string;
    resource: string;
    type: string;
  };
  children: {
    label: string;
    name: string;
    value: string;
    unit?: string;
    calculateType?: string;
    scale: any;
    disabled?: boolean;
    auth?: {
      authKey: string;
      resource: string;
      type: string;
    };
  }[];
}

const scaleValueMap = {
  time: {
    type: "time",
    tickCount: 4,
    nice: false,
    mask: "YYYY-MM-DD HH:mm:ss",
  },
  percent: {
    min: 0,
    max: 100,
    nice: true,
    formatter: (value: number) => {
      return `${value.toFixed(2)}%`;
    },
  },
  bytesToSizePerSecond: {
    min: 0,
    nice: true,
    formatter: (value: number) => {
      return `${formatBytesToSize(value)}/s`;
    },
  },
  iops: {
    min: 0,
    nice: true,
    formatter: (value: number) => {
      return `${`${value}`.includes(".") ? value.toFixed(2) : value} ops/s`;
    },
  },
};

function useMetricConfig() {
  const intl = useIntl();

  const list: IMetricConfig[] = [
    {
      label: intl.formatMessage({
        id: "hostUsageTrend",
        defaultMessage: "Host Usage Trend",
      }),
      value: "host",
      namespace: "ZStack/Host",
      auth: {
        authKey: "trendMonitor.host",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "hostCpuAllUsedUtilization",
            defaultMessage: "CPU Utilization of All Hosts",
          }),
          name: intl.formatMessage({
            id: "hostCpuAllUsedUtilization",
            defaultMessage: "CPU Utilization of All Hosts",
          }),
          value: "CPUAllUsedUtilization",
          unit: "percentage",
          calculateType: "average",
          scale: {
            time: scaleValueMap.time,
            type: {
              formatter: () => {
                return intl.formatMessage({
                  id: "utilization",
                  defaultMessage: "Utilization",
                });
              },
            },
            value: scaleValueMap.percent,
          },
          auth: {
            authKey: "trendMonitor.host.CPUAllUsedUtilization",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "totalHostMemoryUsedInPercent",
            defaultMessage: "Average Memory Utilization of All Hosts",
          }),
          name: intl.formatMessage({
            id: "totalHostMemoryUsedInPercent",
            defaultMessage: "Average Memory Utilization of All Hosts",
          }),
          value: "MemoryUsedInPercent",
          unit: "percentage",
          calculateType: "average",
          scale: {
            time: scaleValueMap.time,
            value: scaleValueMap.percent,
            type: {
              formatter: () => {
                return intl.formatMessage({
                  id: "utilization",
                  defaultMessage: "Utilization",
                });
              },
            },
          },
          auth: {
            authKey: "trendMonitor.host.MemoryUsedInPercent",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "totalHostNetworkAllOutBytes.hostNetworkAllInBytes.dataOut.dataIn",
            defaultMessage: "Total Host Network IO (Sent/Received)",
          }),
          name: intl.formatMessage({
            id: "totalHostNetworkAllOutBytes.hostNetworkAllInBytes",
            defaultMessage: "Total Host Network IO",
          }),
          value: "NetworkAllOutBytes,NetworkAllInBytes",
          unit: "byteToSize/s",
          calculateType: "sum",
          scale: {
            time: scaleValueMap.time,
            value: scaleValueMap.bytesToSizePerSecond,
            type: {
              formatter: (type: string) => {
                switch (type) {
                  case "NetworkAllOutBytes":
                    return intl.formatMessage({
                      id: "dataOut",
                      defaultMessage: "Out",
                    });

                  case "NetworkAllInBytes":
                    return intl.formatMessage({
                      id: "dataIn",
                      defaultMessage: "In",
                    });

                  default:
                    return type;
                }
              },
            },
          },
          auth: {
            authKey: "trendMonitor.host.NetworkAllOutBytesNetworkAllInBytes",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "totalHostDiskIO.hostDiskAllReadBytes.hostDiskAllWriteBytes",
            defaultMessage: "Total Host Disk IO (Write/Read)",
          }),
          name: intl.formatMessage({
            id: "totalHostDiskIO",
            defaultMessage: "Total Host Disk IO",
          }),
          value: "DiskAllReadBytes,DiskAllWriteBytes",
          unit: "byteToSize/s",
          calculateType: "sum",
          scale: {
            time: scaleValueMap.time,
            value: scaleValueMap.bytesToSizePerSecond,
            type: {
              formatter: (type: string) => {
                switch (type) {
                  case "DiskAllWriteBytes":
                    return intl.formatMessage({
                      id: "dataWrite",
                      defaultMessage: "Write",
                    });

                  case "DiskAllReadBytes":
                    return intl.formatMessage({
                      id: "dataRead",
                      defaultMessage: "Read",
                    });

                  default:
                    return type;
                }
              },
            },
          },
          auth: {
            authKey: "trendMonitor.host.DiskAllReadBytesDiskAllWriteBytes",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "primaryStorageUsageTrend",
        defaultMessage: "Data Storage Usage Trend",
      }),
      value: "primaryStorage",
      namespace: "ZStack/PrimaryStorage",
      auth: {
        authKey: "trendMonitor.primaryStorage",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "primaryStorageUsedCapacityInPercent",
            defaultMessage: "Data Storage Utilization",
          }),
          name: intl.formatMessage({
            id: "primaryStorageUsedCapacityInPercent",
            defaultMessage: "Data Storage Utilization",
          }),
          value: "UsedCapacityInPercent",
          unit: "percentage",
          calculateType: "average",
          scale: {
            time: scaleValueMap.time,
            type: {
              formatter: () => {
                return intl.formatMessage({
                  id: "usedInPercent",
                  defaultMessage: "Utilization",
                });
              },
            },
            value: scaleValueMap.percent,
          },
          auth: {
            authKey: "trendMonitor.primaryStorage.UsedCapacityInPercent",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "backupStorageUsageTrend",
        defaultMessage: "Image Storage Usage Trend",
      }),
      value: "backupStorage",
      namespace: "ZStack/BackupStorage",
      auth: {
        authKey: "trendMonitor.backupStorage",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "backupStorageUsedCapacityInPercent",
            defaultMessage: "Backup Server Capacity Utilization",
          }),
          name: intl.formatMessage({
            id: "backupStorageUsedCapacityInPercent",
            defaultMessage: "Backup Server Capacity Utilization",
          }),
          value: "UsedCapacityInPercent",
          unit: "percentage",
          calculateType: "average",
          scale: {
            time: scaleValueMap.time,
            type: {
              formatter: () => {
                return intl.formatMessage({
                  id: "usedInPercent",
                  defaultMessage: "Utilization",
                });
              },
            },
            value: scaleValueMap.percent,
          },
          auth: {
            authKey: "trendMonitor.backupStorage.UsedCapacityInPercent",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
  ];

  return {
    metricConfig: list,
  };
}

export default useMetricConfig;
