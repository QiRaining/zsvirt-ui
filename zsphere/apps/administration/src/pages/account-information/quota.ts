import { useMemo } from "react";
import { useIntl } from "react-intl";
interface QuotaItem {
  value: number;
  name: string;
  unit?: string;
  info?: string;
  auth: {
    type: "block";
    authKey: string;
    resource: string;
  };
}

export type QuotaConfig = Record<string, QuotaItem>;

export function useQuota(): QuotaConfig {
  const intl = useIntl();

  return useMemo(
    () => ({
      "vm.totalNum": {
        value: 20,
        name: intl.formatMessage({
          id: "vm",
          defaultMessage: "Virtual Machine",
        }),
        unit: intl.formatMessage({
          id: "unit.tai",
          defaultMessage: " ",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.vm.totalNum",
          resource: "account.information",
        },
      },
      "baremetal2.num": {
        value: 10,
        unit: intl.formatMessage({
          id: "unit.tai",
          defaultMessage: " ",
        }),
        name: intl.formatMessage({
          id: "baremetal2Instance",
          defaultMessage: "Elastic Baremetal Instance",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.vm.baremetal2.num",
          resource: "account.information",
        },
      },
      "vm.num": {
        value: 20,
        name: intl.formatMessage({
          id: "runningVm",
          defaultMessage: "Running VM",
        }),
        unit: intl.formatMessage({
          id: "unit.tai",
          defaultMessage: " ",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.vm.num",
          resource: "account.information",
        },
      },
      "vm.memorySize": {
        value: 20,
        unit: "byte",
        name: intl.formatMessage({
          id: "memory",
          defaultMessage: "Memory",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.vm.memorySize",
          resource: "account.information",
        },
      },
      "vm.cpuNum": {
        value: 80,
        name: "CPU",
        auth: {
          type: "block" as const,
          authKey: "quota.vm.cpuNum",
          resource: "account.information",
        },
      },
      "affinitygroup.num": {
        value: 20,
        name: intl.formatMessage({
          id: "vmSchedulingRule",
          defaultMessage: "VM Scheduling Policy",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.affinitygroup.num",
          resource: "account.information",
        },
      },
      "gpu.num": {
        value: 20,
        name: intl.formatMessage({
          id: "gpuDevice",
          defaultMessage: "GPU Device",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.gpu.num",
          resource: "account.information",
        },
      },
      "pci.num": {
        value: 20,
        name: intl.formatMessage({
          id: "pciDevice",
          defaultMessage: "PCI Device",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.pci.num",
          resource: "account.information",
        },
      },
      "volume.backup.num": {
        value: 20,
        name: intl.formatMessage({
          id: "backup.data.count",
          defaultMessage: "Backups",
        }),
        info: intl.formatMessage({
          id: "quota.volume.backup.num.tooltip",
          defaultMessage:
            "### Backup Quota\n\nThe backup quota for the user is equal to the sum of the backups for Disk 1 and the other disks.\n",
        }),
        auth: {
          type: "block",
          authKey: "quota.volume.backup.num",
          resource: "account.information",
        },
      },
      "volume.data.num": {
        value: 40,
        name: intl.formatMessage({
          id: "quota.volume",
          defaultMessage: "Disk",
        }),
        info: intl.formatMessage({
          id: "quota.volume.tooltip",
          defaultMessage: `### Disk

The disk quota assigned to the user does not include Disk 1.
          `,
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.volume.data.num",
          resource: "account.information",
        },
      },
      "volume.capacity": {
        value: 10,
        unit: "byte",
        name: intl.formatMessage({
          id: "availableStorageCapacity",
          defaultMessage: "Available Storage Capacity",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.volume.capacity",
          resource: "account.information",
        },
      },
      "image.num": {
        value: 20,
        name: intl.formatMessage({
          id: "image",
          defaultMessage: "Image",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.image.num",
          resource: "account.information",
        },
      },
      "image.size": {
        value: 10,
        unit: "byte",
        name: intl.formatMessage({
          id: "totalImageCapacity",
          defaultMessage: "Total Image Size",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.image.size",
          resource: "account.information",
        },
      },
      "vxlan.num": {
        value: 8,
        name: intl.formatMessage({
          id: "vxlanNetwork",
          defaultMessage: "VXLAN Network",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.vxlan.num",
          resource: "account.information",
        },
      },
      "l3.num": {
        value: 20,
        name: intl.formatMessage({
          id: "l3Network",
          defaultMessage: "Distributed Port Group",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.l3.num",
          resource: "account.information",
        },
      },
      "securityGroup.num": {
        value: 20,
        name: intl.formatMessage({
          id: "securityGroup",
          defaultMessage: "Security Group",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.securityGroup.num",
          resource: "account.information",
        },
      },
      "vip.num": {
        value: 20,
        name: intl.formatMessage({
          id: "vip",
          defaultMessage: "VIP",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.vip.num",
          resource: "account.information",
        },
      },
      "eip.num": {
        value: 20,
        name: intl.formatMessage({
          id: "eip",
          defaultMessage: "EIP",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.eip.num",
          resource: "account.information",
        },
      },
      "portForwarding.num": {
        value: 20,
        name: intl.formatMessage({
          id: "portForwarding",
          defaultMessage: "Port Forwarding",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.portForwarding.num",
          resource: "account.information",
        },
      },
      "loadBalancer.num": {
        value: 20,
        name: intl.formatMessage({
          id: "loadBalancer",
          defaultMessage: "Load Balancer",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.loadBalancer.num",
          resource: "account.information",
        },
      },
      "listener.num": {
        value: 20,
        name: intl.formatMessage({
          id: "listener",
          defaultMessage: "Listener",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.listener.num",
          resource: "account.information",
        },
      },
      "snapshot.volume.num": {
        value: 200,
        name: intl.formatMessage({
          id: "snapshotCount",
          defaultMessage: "Snapshots",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.snapshot.volume.num",
          resource: "account.information",
        },
      },
      "scheduler.num": {
        value: 80,
        name: intl.formatMessage({
          id: "scheduledJob",
          defaultMessage: "Scheduled Job",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.scheduler.num",
          resource: "account.information",
        },
      },
      "scheduler.trigger.num": {
        value: 80,
        name: intl.formatMessage({
          id: "scheduler",
          defaultMessage: "Scheduler",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.scheduler.trigger.num",
          resource: "account.information",
        },
      },
      "zwatch.alarm.num": {
        value: 20,
        name: intl.formatMessage({
          id: "resourceAlarm",
          defaultMessage: "Resource Alarm",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.zwatch.alarm.num",
          resource: "account.information",
        },
      },
      "zwatch.event.num": {
        value: 20,
        name: intl.formatMessage({
          id: "eventAlarm",
          defaultMessage: "Event Alarm",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.zwatch.event.num",
          resource: "account.information",
        },
      },
      "sns.endpoint.num": {
        value: 20,
        name: intl.formatMessage({
          id: "receivingEnd",
          defaultMessage: "Endpoint",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.sns.endpoint.num",
          resource: "account.information",
        },
      },
      "tag2.tag.num": {
        value: 20,
        name: intl.formatMessage({
          id: "tag",
          defaultMessage: "Tag",
        }),
        auth: {
          type: "block" as const,
          authKey: "quota.tag2.tag.num",
          resource: "account.information",
        },
      },
    }),
    [intl],
  );
}
