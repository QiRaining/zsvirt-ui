import { useIntl } from "react-intl";

export interface UseMetricType {
  label?: string;
  tableName: string;
  resourceKey: string;
  value: string;
  metricName?: string;
  zoneKey?: string;
  zoneUuid?: string;
  disabled?: boolean;
  auth?: {
    authKey: string;
    resource: string;
    type: "block";
  };
  children?: {
    label: string;
    value: string;
    auth?: {
      authKey: string;
      resource: string;
      type: "block";
    };
  }[];
}

function useMetricConfig() {
  const intl = useIntl();

  const metricConfig: UseMetricType[] = [
    {
      label: intl.formatMessage({
        id: "cpu",
        defaultMessage: "CPU",
      }),
      tableName: "host",
      resourceKey: "cpu",
      value: "cpu",
      metricName: "CPUAllUsedUtilization",
      zoneKey: "zone.uuid",
      children: [
        {
          label: intl.formatMessage({
            id: "allocationRate",
            defaultMessage: "Allocation Ratio",
          }),
          value: "allocation",
        },
        {
          label: intl.formatMessage({
            id: "actualUsedRate",
            defaultMessage: "  Utilization",
          }),
          value: "actualUsedRate",
          auth: {
            authKey: "usageStatistics.cpu.actualUsedRate",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "memory",
        defaultMessage: "Memory",
      }),
      tableName: "host",
      resourceKey: "memory",
      value: "memory",
      metricName: "MemoryUsedInPercent",
      zoneKey: "zoneUuid",
      children: [
        {
          label: intl.formatMessage({
            id: "allocationRate",
            defaultMessage: "Allocation Ratio",
          }),
          value: "allocation",
        },
        {
          label: intl.formatMessage({
            id: "actualUsedRate",
            defaultMessage: "  Utilization",
          }),
          value: "actualUsedRate",
          auth: {
            authKey: "usageStatistics.memory.actualUsedRate",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "primaryStorage",
        defaultMessage: "Data Storage",
      }),
      tableName: "primaryStorage",
      resourceKey: "primaryStorage",
      value: "primaryStorage",
      metricName: "UsedPhysicalCapacityInPercent",
      zoneKey: "zoneUuid",
      auth: {
        authKey: "usageStatistics.primaryStorage",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "actualUsedRate",
            defaultMessage: "  Utilization",
          }),
          value: "actualUsedRate",
          auth: {
            authKey: "usageStatistics.primaryStorage.actualUsedRate",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "allocationRate",
            defaultMessage: "Allocation Ratio",
          }),
          value: "allocation",
          auth: {
            authKey: "usageStatistics.primaryStorage.allocation",
            resource: "dashboard",
            type: "block",
          },
        },
        // {
        //   label: intl.formatMessage({ id: 'overProvisioning', defaultMessage: '超分率' }),
        //   value: 'overProvisioning'
        // }
      ],
    },
    {
      label: intl.formatMessage({
        id: "backupStorage",
        defaultMessage: "Image Storage",
      }),
      tableName: "backupStorage",
      resourceKey: "backupStorage",
      value: "backupStorage",
      metricName: "UsedCapacityInPercent",
      zoneKey: "zone.uuid",
      auth: {
        authKey: "usageStatistics.backupStorage",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "usedRate",
            defaultMessage: " Utilization",
          }),
          value: "usedRate",
          auth: {
            authKey: "usageStatistics.backupStorage.usedRate",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "imageCapacity",
        defaultMessage: "Image Size",
      }),
      tableName: "imageSize",
      resourceKey: "imageSize",
      value: "imageSize",
      auth: {
        authKey: "usageStatistics.imageSize",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "usedRate",
            defaultMessage: " Utilization",
          }),
          value: "usedRate",
          auth: {
            authKey: "usageStatistics.imageSize.usedRate",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "storageCapacity",
        defaultMessage: "Storage Capacity",
      }),
      tableName: "storageSize",
      resourceKey: "storageSize",
      value: "storageSize",
      auth: {
        authKey: "usageStatistics.storageSize",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({
            id: "usedRate",
            defaultMessage: " Utilization",
          }),
          value: "usedRate",
          auth: {
            authKey: "usageStatistics.storageSize.usedRate",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "publicNetwork",
        defaultMessage: "Public Network",
      }),
      tableName: "l3Network",
      resourceKey: "publicNetwork",
      value: "publicNetwork",
      metricName: "UsedIPInPercent",
      zoneKey: "zone.uuid",
      auth: {
        authKey: "usageStatistics.publicNetwork",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({ id: "ipv4", defaultMessage: "IPv4" }),
          value: "ipv4",
          auth: {
            authKey: "usageStatistics.publicNetwork.ipv4",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({ id: "ipv6", defaultMessage: "IPv6" }),
          value: "ipv6",
          auth: {
            authKey: "usageStatistics.publicNetwork.ipv6",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "flatNetwork",
        defaultMessage: "Flat Network",
      }),
      tableName: "l3Network",
      resourceKey: "flatNetwork",
      value: "flatNetwork",
      metricName: "UsedIPInPercent",
      zoneKey: "zone.uuid",
      auth: {
        authKey: "usageStatistics.flatNetwork",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({ id: "ipv4", defaultMessage: "IPv4" }),
          value: "ipv4",
          auth: {
            authKey: "usageStatistics.flatNetwork.ipv4",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({ id: "ipv6", defaultMessage: "IPv6" }),
          value: "ipv6",
          auth: {
            authKey: "usageStatistics.flatNetwork.ipv6",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "vpcNetwork",
        defaultMessage: "VPC Network",
      }),
      tableName: "l3Network",
      resourceKey: "vpcNetwork",
      value: "vpcNetwork",
      metricName: "UsedIPInPercent",
      zoneKey: "zone.uuid",
      auth: {
        authKey: "usageStatistics.vpcNetwork",
        resource: "dashboard",
        type: "block",
      },
      children: [
        {
          label: intl.formatMessage({ id: "ipv4", defaultMessage: "IPv4" }),
          value: "ipv4",
          auth: {
            authKey: "usageStatistics.vpcNetwork.ipv4",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({ id: "ipv6", defaultMessage: "IPv6" }),
          value: "ipv6",
          auth: {
            authKey: "usageStatistics.vpcNetwork.ipv6",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
  ];

  return {
    metricConfig,
  };
}

export default useMetricConfig;
