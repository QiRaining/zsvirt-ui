import { formatBytesToSize } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

function useMetricConfig() {
  const intl = useIntl();

  const metricConfig: any = [
    {
      label: intl.formatMessage({
        id: "computeResourceQuota",
        defaultMessage: "Compute Resource Quota",
      }),
      value: "computing",
      auth: {
        authKey: "quotaUsage.computing",
        resource: "dashboard",
        type: "block",
      },
      resources: [
        {
          label: intl.formatMessage({
            id: "vm",
            defaultMessage: "Virtual Machine",
          }),
          value: "vm.totalNum",
          iconType: "monitor",
        },
        {
          label: intl.formatMessage({
            id: "runningVm",
            defaultMessage: "Running VM",
          }),
          value: "vm.num",
          iconType: "monitor",
        },
        {
          label: intl.formatMessage({
            id: "cpu",
            defaultMessage: "CPU",
          }),
          value: "vm.cpuNum",
          iconType: "cpu",
        },
        {
          label: intl.formatMessage({
            id: "memory",
            defaultMessage: "Memory",
          }),
          value: "vm.memorySize",
          iconType: "memory",
          formatter: (v: number) => formatBytesToSize(v),
        },
        {
          label: intl.formatMessage({
            id: "vmSchedulingRule",
            defaultMessage: "VM Scheduling Policy",
          }),
          value: "affinitygroup.num",
          iconType: "deploy",
        },
        {
          label: intl.formatMessage({
            id: "gpuDevice",
            defaultMessage: "GPU Device",
          }),
          value: "gpu.num",
          iconType: "gpu",
          auth: {
            authKey: "quotaUsage.computing.gpu.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "pciDevice",
            defaultMessage: "PCI Device",
          }),
          value: "pci.num",
          iconType: "vgpu-offering",
          auth: {
            authKey: "quotaUsage.computing.pci.num",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "storageResourceQuota",
        defaultMessage: "Storage Resource Quota",
      }),
      value: "storage",
      auth: {
        authKey: "quotaUsage.storage",
        resource: "dashboard",
        type: "block",
      },
      resources: [
        {
          label: intl.formatMessage({
            id: "image",
            defaultMessage: "Image",
          }),
          value: "image.num",
          iconType: "cd",
        },
        {
          label: intl.formatMessage({
            id: "totalImageCapacity",
            defaultMessage: "Total Image Size",
          }),
          value: "image.size",
          iconType: "cd",
          formatter: (v: number) => formatBytesToSize(v),
        },
        {
          label: intl.formatMessage({
            id: "hard.drive",
            defaultMessage: "Disk",
          }),
          value: "volume.data.num",
          iconType: "disk-2",
        },
        {
          label: intl.formatMessage({
            id: "availableStorageCapacity",
            defaultMessage: "Available Storage Capacity",
          }),
          value: "volume.capacity",
          iconType: "disk-2",
          formatter: (v: number) => formatBytesToSize(v),
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "networkResourceQuota",
        defaultMessage: "Network Resource Quota",
      }),
      value: "network",
      auth: {
        authKey: "quotaUsage.network",
        resource: "dashboard",
        type: "block",
      },
      resources: [
        {
          label: intl.formatMessage({
            id: "vxlanNetwork",
            defaultMessage: "VXLAN Network",
          }),
          value: "vxlan.num",
          iconType: "chain",
          auth: {
            authKey: "quotaUsage.network.vxlan.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "l3Network",
            defaultMessage: "Distributed Port Group",
          }),
          value: "l3.num",
          iconType: "d-portgroup",
        },
        {
          label: intl.formatMessage({
            id: "securityGroup",
            defaultMessage: "Security Group",
          }),
          value: "securityGroup.num",
          iconType: "shield",
          auth: {
            authKey: "quotaUsage.network.securityGroup.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "vip",
            defaultMessage: "VIP",
          }),
          value: "vip.num",
          iconType: "IP",
          auth: {
            authKey: "quotaUsage.network.vip.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "eip",
            defaultMessage: "EIP",
          }),
          value: "eip.num",
          iconType: "subset",
          auth: {
            authKey: "quotaUsage.network.eip.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "portForwarding",
            defaultMessage: "Port Forwarding",
          }),
          value: "portForwarding.num",
          iconType: "paper-plane",
          auth: {
            authKey: "quotaUsage.network.portForwarding.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "loadBalancer",
            defaultMessage: "Load Balancer",
          }),
          value: "loadBalancer.num",
          iconType: "stablity",
          auth: {
            authKey: "quotaUsage.network.loadBalancer.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "listener",
            defaultMessage: "Listener",
          }),
          value: "listener.num",
          iconType: "radio",
          auth: {
            authKey: "quotaUsage.network.listener.num",
            resource: "dashboard",
            type: "block",
          },
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "otherResourceQuota",
        defaultMessage: "Other Resource Quota",
      }),
      value: "other",
      auth: {
        authKey: "quotaUsage.other",
        resource: "dashboard",
        type: "block",
      },
      resources: [
        {
          label: intl.formatMessage({
            id: "volume.snapshot.count",
            defaultMessage: "Snapshots",
          }),
          value: "snapshot.volume.num",
          iconType: "camera",
        },
        {
          label: intl.formatMessage({
            id: "backupData",
            defaultMessage: "Backup Data",
          }),
          value: "volume.backup.num",
          iconType: "layers",
          auth: {
            authKey: "quotaUsage.storage.volume.backup.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "availableBackupCapacity",
            defaultMessage: "Available Backup Capacity",
          }),
          value: "volume.backup.size",
          iconType: "layers",
          formatter: (v: number) => formatBytesToSize(v),
          auth: {
            authKey: "quotaUsage.storage.volume.backup.size",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "scheduledJob",
            defaultMessage: "Scheduled Job",
          }),
          value: "scheduler.num",
          iconType: "timed-task",
          auth: {
            authKey: "quotaUsage.other.scheduler.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "scheduler",
            defaultMessage: "Scheduler",
          }),
          value: "scheduler.trigger.num",
          iconType: "timer",
          auth: {
            authKey: "quotaUsage.other.trigger.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "resourceAlarm",
            defaultMessage: "Resource Alarm",
          }),
          value: "zwatch.alarm.num",
          iconType: "alarm",
        },
        {
          label: intl.formatMessage({
            id: "eventAlarm",
            defaultMessage: "Event Alarm",
          }),
          value: "zwatch.event.num",
          iconType: "alarm",
        },
        {
          label: intl.formatMessage({
            id: "receivingEnd",
            defaultMessage: "Endpoint",
          }),
          value: "sns.endpoint.num",
          iconType: "network-port-empty",
          auth: {
            authKey: "quotaUsage.other.sns.endpoint.num",
            resource: "dashboard",
            type: "block",
          },
        },
        {
          label: intl.formatMessage({
            id: "tag",
            defaultMessage: "Tag",
          }),
          value: "tag2.tag.num",
          iconType: "pricetag",
        },
      ],
    },
  ];

  return {
    metricConfig,
  };
}

export default useMetricConfig;
