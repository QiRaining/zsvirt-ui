import { Icon } from "@zstack/icon";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { ComparisonOperator, EmergencyLevel } from "@zstack/zsphere-types";
import {
  formatBytesToSize,
  formatStorageToObj,
  getLocaleFromStorage,
  parseNumber,
} from "@zstack/zsphere-utils";
import { Tooltip } from "antd";
import { floor as _floor, keys as _keys } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { ReactMarkdown } from "../a-cloud-old-components";
import { systemAlarmUuidList } from "./system-alarm-uuid-list";

function secToTime(s: number) {
  let time = {
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  };
  if (s > 0) {
    const day = Math.floor(s / 3600 / 24);
    const hour = Math.floor((s % 86400) / 3600);
    const minute = Math.floor(s / 60) % 60;
    const second = s % 60;
    time = {
      day,
      hour,
      minute,
      second,
    };
  }
  return time;
}

function useMetricNameConfig() {
  const intl = useIntl();
  // 该文件有可能最终在主应用下运行(顶部alarm提示),所有加个判断
  const currentUser = usePlatformStore((state) => state.currentUser);

  const eventAlarmConfig: any = {
    vm: {
      name: intl.formatMessage({ id: "vm.instance", defaultMessage: "Virtual Machine" }),
      auth: {
        type: "view" as const,
        resource: "virtualization.vm",
        authKey: "list",
      },
      VmCrash: {
        displayName: intl.formatMessage({
          id: "metric.name.vm.crashed",
          defaultMessage: "VM Crashed",
        }),
        labelNames: [],
        tags: [],
        name: "VmCrash",
        namespace: "ZStack/VM",
      },
      VMHAStarted: {
        displayName: intl.formatMessage({
          id: "metric.name.vm.started",
          defaultMessage: "VM HA Started On Host",
        }),
        labelNames: ["DestinationHostUuid"],
        tags: [],
        name: "VMHAStarted",
        namespace: "ZStack/VM",
      },
      VMStateChangedOnHost: {
        displayName: intl.formatMessage({
          id: "metric.name.vm.state.changed.on.host",
          defaultMessage: "VM State Changed On Host",
        }),
        labelNames: ["OldState", "NewState"],
        tags: [],
        name: "VMStateChangedOnHost",
        namespace: "ZStack/VM",
      },
      VMStateInShutdown: {
        displayName: intl.formatMessage({
          id: "metric.name.vm.state.in.shutdown",
          defaultMessage: "VM in Shutdown State for a Long Time",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "VMStateInShutdown",
        namespace: "ZStack/VM",
      },
      VmAbnormalLifeCycleDetected: {
        displayName: intl.formatMessage({
          id: "metric.name.vm.abnormal.lifeCycle.detected",
          defaultMessage: "VM Host Abnormally Changed",
        }),
        labelNames: [],
        tags: [],
        name: "VmAbnormalLifeCycleDetected",
        namespace: "ZStack/VM",
      },
      VMInternalIpDuplicate: {
        displayName: intl.formatMessage({
          id: "metric.name.vm.internal.ip.duplicate",
          defaultMessage: "IP Configured in VM has been Occupied by Platform Resources (VMTools Required)",
        }),
        labelNames: [],
        tags: [],
        name: "VMInternalIpDuplicate",
        namespace: "ZStack/VM",
      },
      VMInternalIpChanged: {
        displayName: intl.formatMessage({
          id: "metric.name.vm.internal.ip.changed",
          defaultMessage: "VM NIC IP Changed (VMTools Required)",
        }),
        labelNames: [],
        tags: [],
        name: "VMInternalIpChanged",
        namespace: "ZStack/VM",
      },
      VMInternalIpRangeConflict: {
        displayName: intl.formatMessage({
          id: "metric.name.primary.stroage.VMInternalIpRangeConflict",
          defaultMessage: "NIC IP Configured in VM Not in Port Group IP Range (VMTools Required)",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "VMInternalIpRangeConflict",
        namespace: "ZStack/VM",
      },
    },
    vrouter: {
      name: intl.formatMessage({
        id: "virtual.router.instance",
        defaultMessage: "VPC vRouter",
      }),
      auth: {
        type: "block" as const,
        resource: "vpc.vrouter",
        authKey: "vpc.vrouter.alarm",
      },
      VRouterDisconnected: {
        displayName: intl.formatMessage({
          id: "metric.name.vrouter.disconnected",
          defaultMessage: "VPC vRouter Disconnected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "VRouterDisconnected",
        namespace: "ZStack/VRouter",
      },
      VRouterConnected: {
        displayName: intl.formatMessage({
          id: "metric.name.vrouter.connected",
          defaultMessage: "VPC vRouter Connected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "VRouterConnected",
        namespace: "ZStack/VRouter",
      },
      MasterVpcRouterChanged: {
        displayName: intl.formatMessage({
          id: "metric.name.master.vrouter.changed",
          defaultMessage: "VPC vRouter Failover",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "MasterVpcRouterChanged",
        namespace: "ZStack/VRouter",
      },
      VRouterAbnormalFilesExists: {
        displayName: intl.formatMessage({
          id: "metric.name.vrouter.disk",
          defaultMessage: "VPC vRouter Disk Space is Occupied by Abnormal Files",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "VRouterAbnormalFilesExists",
        namespace: "ZStack/VRouter",
      },
      VRouterPaused: {
        displayName: intl.formatMessage({
          id: "metric.name.rRouter.paused",
          defaultMessage: "VPC vRouter State Changed to Paused",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "MasterVpcRouterChanged",
        namespace: "ZStack/VRouter",
      },
    },
    slbVmInstance: {
      name: intl.formatMessage({
        id: "loadBalancer",
        defaultMessage: "Load Balancer",
      }),
      auth: {
        type: "block" as const,
        resource: "load.balancer",
        authKey: "load.balancer.alarm",
      },
      SlbVmInstanceDisconnected: {
        displayName: intl.formatMessage({
          id: "metric.name.slb.disconnected",
          defaultMessage: "LB Instance Disconnected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "SlbVmInstanceDisconnected",
        namespace: "ZStack/SlbVmInstance",
      },
      SlbVmInstanceConnected: {
        displayName: intl.formatMessage({
          id: "metric.name.slb.connected",
          defaultMessage: "LB Instance Connected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "SlbVmInstanceConnected",
        namespace: "ZStack/SlbVmInstance",
      },
      SlbVmInstanceAbnormalFilesExists: {
        displayName: intl.formatMessage({
          id: "metric.name.slb.filesExists",
          defaultMessage: "LB Instance Disk Space is Occupied by Abnormal Files",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "SlbVmInstanceAbnormalFilesExists",
        namespace: "ZStack/SlbVmInstance",
      },
    },
    backupStorage: {
      name: intl.formatMessage({
        id: "backup.storage",
        defaultMessage: "Image Storage",
      }),
      auth: {
        type: "view" as const,
        resource: "virtualization.backup.storage",
        authKey: "list",
      },
      BackupStorageDisconnected: {
        displayName: intl.formatMessage({
          id: "metric.name.backup.storage.disconnected",
          defaultMessage: "Image Storage Disconnected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "BackupStorageDisconnected",
        namespace: "ZStack/BackupStorage",
      },
      BackupStorageConnected: {
        displayName: intl.formatMessage({
          id: "metric.name.backup.stroage.connected",
          defaultMessage: "Image Storage Connected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "BackupStorageConnected",
        namespace: "ZStack/BackupStorage",
      },
    },
    managementNode: {
      name: intl.formatMessage({
        id: "management.node",
        defaultMessage: "Management Node",
      }),
      auth: {
        type: "block" as const,
        resource: "common",
        authKey: "management.node.alarm",
      },
      ManagementNodeLeft: {
        displayName: intl.formatMessage({
          id: "metric.name.management.node.left",
          defaultMessage: "Management Node Disconnected",
        }),
        labelNames: [],
        tags: [],
        name: "ManagementNodeLeft",
        namespace: "ZStack/MN",
      },
      ManagementNodeJoin: {
        displayName: intl.formatMessage({
          id: "metric.name.management.node.join",
          defaultMessage: "Management Node Connected",
        }),
        labelNames: [],
        tags: [],
        name: "ManagementNodeJoin",
        namespace: "ZStack/MN",
      },
    },
    host: {
      name: intl.formatMessage({ id: "host", defaultMessage: "Host" }),
      auth: {
        type: "view" as const,
        resource: "virtualization.host",
        authKey: "list",
      },
      HostPhysicalRaidStateAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.raid.state.abnormal",
          defaultMessage: "Host RAID Card Abnormal",
        }),
        name: "HostPhysicalRaidStateAbnormal",
        namespace: "ZStack/Host",
      },
      HostPhysicalGpuRemoveTriggered: {
        displayName: intl.formatMessage({
          id: "metric.name.host.physical.gpu.disconnected",
          defaultMessage: "Physical GPU Removed or Disconnected",
        }),
        name: "HostPhysicalGpuRemoveTriggered",
        namespace: "ZStack/Host",
      },
      HostPhysicalGpuStatusAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.gpu.status.abnormal",
          defaultMessage: "Host Physical GPU Status Abnormal",
        }),
        name: "HostPhysicalGpuStatusAbnormal",
        namespace: "ZStack/Host",
      },
      HostPhysicalVGpuStatusAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.vgpu.status.abnormal",
          defaultMessage: "Host vGPU Status Abnormal",
        }),
        name: "HostPhysicalVGpuStatusAbnormal",
        namespace: "ZStack/Host",
      },
      HostPhysicalPowerSupplyStatusAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.power.supply.status.abnormal",
          defaultMessage: "Host Power Slot Status Abnormal",
        }),
        name: "HostPhysicalPowerSupplyStatusAbnormal",
        namespace: "ZStack/Host",
      },
      HostPhysicalMemoryStatusAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.memory.status.abnormal",
          defaultMessage: "Host Memory Status Abnormal",
        }),
        name: "HostPhysicalMemoryStatusAbnormal",
        namespace: "ZStack/Host",
      },
      HostPhysicalMemoryEccErrorTriggered: {
        displayName: intl.formatMessage({
          id: "metric.name.host.memory.ecc.alarm",
          defaultMessage: "Host Memory ECC Warning",
        }),
        name: "HostPhysicalMemoryEccErrorTriggered",
        namespace: "ZStack/Host",
      },
      HostPhysicalDiskRemoveTriggered: {
        displayName: intl.formatMessage({
          id: "metric.name.host.hard.drive.removed",
          defaultMessage: "Host Disk Removed",
        }),
        name: "HostPhysicalDiskRemoveTriggered",
        namespace: "ZStack/Host",
      },
      HostPhysicalDiskInsertTriggered: {
        displayName: intl.formatMessage({
          id: "metric.name.host.hard.drive.inserted",
          defaultMessage: "Host Disk Inserted",
        }),
        name: "HostPhysicalDiskInsertTriggered",
        namespace: "ZStack/Host",
      },
      HostPhysicalDiskStatusAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.hard.drive.status.abnormal",
          defaultMessage: "Host Disk Status Abnormal",
        }),
        name: "HostPhysicalDiskStatusAbnormal",
        namespace: "ZStack/Host",
      },
      HostPhysicalCpuStatusAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.cpu.status.abnormal",
          defaultMessage: "Host CPU Status Abnormal",
        }),
        name: "HostPhysicalCpuStatusAbnormal",
        namespace: "ZStack/Host",
      },
      HostPhysicalFanStatusAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.fan.status.abnormal",
          defaultMessage: "Host Fan Status Abnormal",
        }),
        tags: ["noLabels"],
        name: "HostPhysicalFanStatusAbnormal",
        namespace: "ZStack/Host",
      },
      HostUnknownVMDetected: {
        displayName: intl.formatMessage({
          id: "metric.name.host.unknown.vm.detected",
          defaultMessage: "Unknown VM Detected On Host",
        }),
        labelNames: ["UnknownVMIdentity"],
        tags: ["noLabels"],
        name: "HostUnknownVMDetected",
        namespace: "ZStack/Host",
      },
      HostDisconnected: {
        displayName: intl.formatMessage({
          id: "metric.name.host.disconnected",
          defaultMessage: "Host Disconnected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "HostDisconnected",
        namespace: "ZStack/Host",
      },
      HostConnected: {
        displayName: intl.formatMessage({
          id: "metric.name.host.connected",
          defaultMessage: "Host Connected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "HostConnected",
        namespace: "ZStack/Host",
      },
      HostStatusChanged: {
        displayName: intl.formatMessage({
          id: "metric.name.host.staus.changed",
          defaultMessage: "Host Staus Changed",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "HostStatusChanged",
        namespace: "ZStack/Host",
      },
      HostHardwareChanged: {
        displayName: intl.formatMessage({
          id: "metric.name.host.hardware.changed",
          defaultMessage: "Host Hardware Changed",
        }),
        labelNames: ["Error"],
        tags: [],
        name: "HostHardwareChanged",
        namespace: "ZStack/Host",
      },
      HostPhysicalNicStatusUp: {
        displayName: intl.formatMessage({
          id: "metric.name.host.net.link.status.up",
          defaultMessage: "Host NIC Connected",
        }),
        labelNames: [],
        tags: [],
        name: "HostPhysicalNicStatusUp",
        namespace: "ZStack/Host",
      },
      HostPhysicalNicStatusDown: {
        displayName: intl.formatMessage({
          id: "metric.name.host.net.link.status.down",
          defaultMessage: "Host NIC Disconnected",
        }),
        labelNames: [],
        tags: [],
        name: "HostPhysicalNicStatusDown",
        namespace: "ZStack/Host",
      },
      FaultMountPointOnHost: {
        displayName: intl.formatMessage({
          id: "metric.name.primary.stroage.fault.mount.point.on.host",
          defaultMessage: "Host Mount Path Faulted",
        }),
        labelNames: [],
        tags: ["noLabels"],
        name: "FaultMountPointOnHost",
        namespace: "ZStack/Host",
      },
      HostHbaPortStateAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.hba.port.state.abnormal",
          defaultMessage: "HBA Port Status Abnormal",
        }),
        labelNames: [],
        tags: ["noLabels"],
        name: "HostHbaPortStateAbnormal",
        namespace: "ZStack/Host",
      },
      HostSharedBlockStateAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.primary.stroage.hostSharedBlockStateAbnormal",
          defaultMessage: "Host LUN Multipath Health Status Abnormal",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "HostSharedBlockStateAbnormal",
        namespace: "ZStack/Host",
      },
      HostProcessPhysicalMemoryUsageAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.host.process.physical.memory.usage.abnormal",
          defaultMessage: "Host Process Physical Memory Usage Abnormal",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "HostProcessPhysicalMemoryUsageAbnormal",
        namespace: "ZStack/Host",
      },
    },
    primaryStorage: {
      name: intl.formatMessage({
        id: "primary.storage",
        defaultMessage: "Data Storage",
      }),
      auth: {
        type: "view" as const,
        resource: "virtualization.data.storage",
        authKey: "list",
      },
      PrimaryStorageHostDisconnected: {
        displayName: intl.formatMessage({
          id: "metric.name.primary.stroage.host.hisconnected",
          defaultMessage: "Failed to Detect Connection Between Data Storage and Host",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "PrimaryStorageHostDisconnected",
        namespace: "ZStack/PrimaryStorage",
      },
      PrimaryStorageDisconnected: {
        displayName: intl.formatMessage({
          id: "metric.name.primary.stroage.disconnected",
          defaultMessage: "Data Storage Disconnected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "PrimaryStorageDisconnected",
        namespace: "ZStack/PrimaryStorage",
      },
      PrimaryStorageConnected: {
        displayName: intl.formatMessage({
          id: "metric.name.primary.stroage.connected",
          defaultMessage: "Data Storage Connected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "PrimaryStorageConnected",
        namespace: "ZStack/PrimaryStorage",
      },
      SharedBlockStateAbnormal: {
        displayName: intl.formatMessage({
          id: "metric.name.primary.stroage.sharedBlockStateAbnormal",
          defaultMessage: "Data Storage LUN Multipath Health Status Abnormal",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "SharedBlockStateAbnormal",
        namespace: "ZStack/PrimaryStorage",
      },
    },
    scheduler: {
      name: intl.formatMessage({
        id: "scheduler.backup.policy",
        defaultMessage: "Backup Plan",
      }),
      auth: {
        type: "view" as const,
        resource: "virtualization.backup.policy",
        authKey: "list",
      },
      JobGroupFailure: {
        displayName: intl.formatMessage({
          id: "metric.name.scheduler.job.failure",
          defaultMessage: "Backup Job Failed",
        }),
        labelNames: [],
        tags: [],
        name: "JobGroupFailure",
        namespace: "ZStack/Scheduler",
      },
    },
    disasterRecoveryStorage: {
      name: intl.formatMessage({
        id: "disaster.recovery.storage",
        defaultMessage: "Backup Storage",
      }),
      auth: {
        type: "block" as const,
        resource: "disaster.recovery.storage",
        authKey: "disaster.recovery.storage.alarm",
      },
      BackupStorageDisconnected: {
        displayName: intl.formatMessage({
          id: "metric.name.disaster.recovery.storage.disconnected",
          defaultMessage: "Backup Storage Disconnected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "BackupStorageDisconnected",
        namespace: "ZStack/DisasterRecoveryStorage",
      },
      BackupStorageConnected: {
        displayName: intl.formatMessage({
          id: "metric.name.disaster.recovery.stroage.connected",
          defaultMessage: "Backup Storage Connected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "BackupStorageConnected",
        namespace: "ZStack/DisasterRecoveryStorage",
      },
    },
    sns: {
      name: intl.formatMessage({
        id: "sns.endpoint",
        defaultMessage: "Endpoint",
      }),
      auth: {
        type: "block" as const,
        resource: "endpoint.sms.address",
        authKey: "endpoint.sms.address.alarm",
      },
      SendSmsFailed: {
        displayName: intl.formatMessage({
          id: "event.name.send.sms.failed",
          defaultMessage: "SMS Message Sending Failed",
        }),
        labelNames: [],
        tags: [],
        name: "SendSmsFailed",
        namespace: "ZStack/SNS",
      },
    },
    ha: {
      name: intl.formatMessage({
        id: "high.availability.strategy",
        defaultMessage: "HA Policy",
      }),
      auth: {
        type: "block" as const,
        resource: "vm",
        authKey: "vm.ha.alarm",
      },
      MigrateVMFailedWithHostMaintain: {
        displayName: intl.formatMessage({
          id: "event.name.host.enter.maintain.trigger.vm.migrate.failed",
          defaultMessage: "VM Migration Failed as Host in Maintenance Mode",
        }),
        labelNames: [],
        tags: [],
        name: "MigrateVMFailedWithHostMaintain",
        namespace: "ZStack/HA",
      },
    },
    cdpTask: {
      name: intl.formatMessage({ id: "cdpTask", defaultMessage: "CDP Task" }),
      auth: {
        type: "block" as const,
        resource: "cdp.task",
        authKey: "cdp.task.alarm",
      },
      CdpTaskFailed: {
        displayName: intl.formatMessage({
          id: "event.name.cdp.task.failed",
          defaultMessage: "CDP Task Failed",
        }),
        labelNames: [],
        tags: [],
        name: "CdpTaskFailed",
        namespace: "ZStack/CdpTask",
      },
      CdpTaskStatusAbnormallyChanged: {
        namespace: "ZStack/CdpTask",
        name: "CdpTaskStatusAbnormallyChanged",
        labelNames: ["Error"],
        tags: ["noLabels"],
        displayName: intl.formatMessage({
          id: "event.name.cdp.task.StatusAbnormallyChanged",
          defaultMessage: "CDP Task Status Abnormally Changed",
        }),
      },
    },
    securityMachine: {
      name: intl.formatMessage({
        id: "securityMachine",
        defaultMessage: "HSM",
      }),
      auth: {
        type: "block" as const,
        resource: "securityMachine",
        authKey: "securityMachine.state.alarm",
      },
      SecurityMachineStateChange: {
        displayName: intl.formatMessage({
          id: "event.name.securityMachine.state.exception",
          defaultMessage: "HSM Exception Notification",
        }),
        labelNames: [],
        tags: [],
        name: "SecurityMachineStateChange",
        namespace: "ZStack/SecurityMachine",
      },
    },
    secretResourcePool: {
      name: intl.formatMessage({
        id: "third.secretServer",
        defaultMessage: "3rd-Party Cryptographic Service",
      }),
      auth: {
        type: "block" as const,
        resource: "secretResourcePool",
        authKey: "secretResourcePool.status.alarm",
      },
      SecretResourcePoolStatusChange: {
        displayName: intl.formatMessage({
          id: "event.name.secretResourcePool.status.exception",
          defaultMessage: "3rd-Party Cryptographic Service Error",
        }),
        labelNames: [],
        tags: [],
        name: "SecretResourcePoolStatusChange",
        namespace: "ZStack/SecretResourcePool",
      },
    },
    cluster: {
      name: intl.formatMessage({
        id: "cluster",
        defaultMessage: "Cluster",
      }),
      auth: {
        type: "block" as const,
        resource: "cluster",
        authKey: "cluster.alarm",
      },
      ClusterQemuVersionMismatch: {
        displayName: intl.formatMessage({
          id: "event.name.clusterQemuVersionMismatch.status.exception",
          defaultMessage: "QEMU Version of Hosts in Cluster Needs to be Updated",
        }),
        labelNames: [],
        tags: [],
        name: "ClusterQemuVersionMismatch",
        namespace: "ZStack/Cluster",
      },
    },
  };

  const namespaceMap: any = {
    "ZStack/VM": "vm",
    "ZStack/License": "license",
    "ZStack/BaremetalVM": "baremetalVm",
    "ZStack/VRouter": "vrouter",
    "ZStack/SlbVmInstance": "slbVmInstance",
    "ZStack/Image": "image",
    "ZStack/BackupStorage": "backupStorage",
    "ZStack/System": "managementServerDir",
    "ZStack/Host": "host",
    "ZStack/KVMHost": "host",
    "ZStack/XDragonHost": "host",
    "ZStack/BareMetal2Gateway": "baremetal2GateWay",
    "ZStack/L3Network": "l3network",
    "ZStack/Volume": "volume",
    "ZStack/VIP": "vip",
    "ZStack/PrimaryStorage": "primaryStorage",
    "ZStack/LoadBalancer": "loadBalancerListener",
    "ZStack/DbFencerIpReachable": "managementNode",
    "ZStack/TimeNeededToSyncDB": "managementNode",
    "ZStack/MN": "managementNode",
    "ZStack/Scheduler": "scheduler",
    "ZStack/DisasterRecoveryStorage": "disasterRecoveryStorage",
    "ZStack/VCenter": "vCenter",
    "ZStack/SNS": "sns",
    "ZStack/HA": "ha",
    "ZStack/Baremetal2VM": "baremetal2Vm",
    "ZStack/CdpTask": "cdpTask",
    "ZStack/SecurityMachine": "securityMachine",
    "ZStack/SecretResourcePool": "secretResourcePool",
    "ZStack/Cluster": "cluster",
  };

  const operatorMap = {
    [ComparisonOperator.GreaterThan]: ">",
    [ComparisonOperator.GreaterThanOrEqualTo]: "≥",
    [ComparisonOperator.LessThan]: "<",
    [ComparisonOperator.LessThanOrEqualTo]: "≤",
  };

  const emergencyLevelMap = {
    [EmergencyLevel.Normal]: (
      <span style={{ display: "flex", alignItems: "center" }}>
        <Icon
          style={{ marginRight: 8 }}
          type="alert-triangle-fill"
          color="info"
          colorNumber={500}
        />
        {intl.formatMessage({
          id: "emergencyLevel.normal",
          defaultMessage: "Info",
        })}
      </span>
    ),
    [EmergencyLevel.Important]: (
      <span style={{ display: "flex", alignItems: "center" }}>
        <Icon
          style={{ marginRight: 8 }}
          type="alert-triangle-fill"
          color="alert"
        />
        {intl.formatMessage({
          id: "emergencyLevel.import",
          defaultMessage: "Major",
        })}
      </span>
    ),
    [EmergencyLevel.Emergent]: (
      <span style={{ display: "flex", alignItems: "center" }}>
        <Icon
          style={{ marginRight: 8 }}
          type="alert-triangle-fill"
          color="danger"
        />
        {intl.formatMessage({
          id: "emergencyLevel.emergent",
          defaultMessage: "Emergent",
        })}
      </span>
    ),
  };

  const systemALarmNameMap: any = {
    "License Expired Alarm": intl.formatMessage({
      id: "zwatchAlarm.licenseEnabledDays",
      defaultMessage: "License Expiration",
    }),
    "ZStack Data Directory Capacity Alarm": intl.formatMessage({
      id: "zwatchAlarm.systemAlarm",
      defaultMessage: "System Data Directory Disk Capacity",
    }),
    "ZStack Primary Storage Available Capacity Alarm": intl.formatMessage({
      id: "zwatchAlarm.primaryStorageAvailableCapacity",
      defaultMessage: "Data Storage Allocatable Capacity",
    }),
    "ZStack Primary Storage Physical Available Capacity Alarm":
      intl.formatMessage({
        id: "zwatchAlarm.primaryStoragePhysicalAvailableCapacity",
        defaultMessage: "Data Storage Available Physical Capacity",
      }),
    "ZStack Backup Storage Available Capacity Alarm": intl.formatMessage({
      id: "zwatchAlarm.backupStorageAvailableCapacity",
      defaultMessage: "Image Storage Available Capacity",
    }),
    VRouterDisconnected: intl.formatMessage({
      id: "zwatchAlarm.vRouterDisconnected",
      defaultMessage: "vRouter Disconnected",
    }),
    BackupStorageDisconnected: intl.formatMessage({
      id: "zwatchAlarm.backupStorageDisconnected",
      defaultMessage: "Backup Storage Disconnected",
    }),
    ManagementNodeLeft: intl.formatMessage({
      id: "zwatchAlarm.managementNodeLeft",
      defaultMessage: "Managment Node Disconnected",
    }),
    PrimaryStorageDisconnected: intl.formatMessage({
      id: "zwatchAlarm.primaryStorageDisconnected",
      defaultMessage: "Data Storage Disconnected",
    }),
    "ZStack Host Root FileSystem Used Capacity Alarm": intl.formatMessage({
      id: "zwatchAlarm.hostRootFileSystemUsedCapacityAlarm",
      defaultMessage: "Host Root Volume Utilization",
    }),
    "Volume Xfs Fragmentation Alarm": intl.formatMessage({
      id: "zwatchAlarm.VolumeXfsFragCount",
      defaultMessage: "Volume (100 GB and Above) Fragmentation Degree (Total Number of Extents)",
    }),
    "Host Xfs Fragmentation Alarm": intl.formatMessage({
      id: "zwatchAlarm.DiskXfsFragInPercent",
      defaultMessage: "Host {name} XFS Fragmentation Degree Percent",
    }),
    "Database fencer IP not reachable event Alarm": intl.formatMessage({
      id: "zwatchAlarm.DbFencerIpReachable",
      defaultMessage: "Monitor IP Unreachable",
    }),
    "Database synchronization event Alarm": intl.formatMessage({
      id: "zwatchAlarm.TimeNeededToSyncDB",
      defaultMessage: "Dual Management Node Database Needs Synchronization",
    }),
    "ZStack Cdp Task Used Capacity Alarm": intl.formatMessage({
      id: "zwatchAlarm.CdpTaskUsedCapacityInPercent",
      defaultMessage: "Capacity Used by CDP Task",
    }),
    "ZStack Cdp Task Status Abnormally Changed": intl.formatMessage({
      id: "zwatchAlarm.CdpTaskStatusAbnormallyChanged",
      defaultMessage: "CDP Task Status Abnormally Changed",
    }),
    "ZStack Cdp Task Latency Alarm": intl.formatMessage({
      id: "zwatchAlarm.CdpTaskLatency",
      defaultMessage: "CDP Task RPO Latency",
    }),
    "Host Cpu Average Used Utilization Alarm": intl.formatMessage({
      id: "zwatchAlarm.host.CPUAverageUsedUtilization",
      defaultMessage: "Average CPU Utilization of Hosts",
    }),
    "Host Memory Used Capacity alarm": intl.formatMessage({
      id: "zwatchAlarm.host.MemoryUsedCapacityPerHostInPercent",
      defaultMessage: "Host Memory Utilization",
    }),
    "VM Cpu Average Used Utilization Alarm": intl.formatMessage({
      id: "zwatchAlarm.vm.CPUAverageUsedUtilization",
      defaultMessage: "VM Average CPU Utilization",
    }),
    "VM Memory Used Capacity alarm": intl.formatMessage({
      id: "zwatchAlarm.vm.MemoryUsedCapacityPerHostInPercent",
      defaultMessage: "VM Memory Utilization",
    }),
    "VM HaStart event alarm": intl.formatMessage({
      id: "zwatchAlarm.VMHAStarted",
      defaultMessage: "VM HA Started On Host",
    }),
    "VM State InShutdown event alarm": intl.formatMessage({
      id: "zwatchAlarm.VMStateInShutdown",
      defaultMessage: "Host In Shutdown State For A Long Time",
    }),
    "Host unknown vm detected event alarm": intl.formatMessage({
      id: "zwatchAlarm.HostUnknownVMDetected",
      defaultMessage: "Unknown VM Detected On Host",
    }),
    "Migrate VM failed with host maintain event alarm": intl.formatMessage({
      id: "zwatchAlarm.MigrateVMFailedWithHostMaintain",
      defaultMessage: "VM Migration Failed upon Host Entering Maintenance Mode	 ",
    }),
    "Primary storage host disconnect event alarm": intl.formatMessage({
      id: "zwatchAlarm.PrimaryStorageHostDisconnected",
      defaultMessage: "Host Disconnected with Data Storage",
    }),
    "Fault mount point on host event alarm": intl.formatMessage({
      id: "zwatchAlarm.FaultMountPointOnHost",
      defaultMessage: "Host Mount Path Faulted",
    }),
    "Host cpu temperature alarm": intl.formatMessage({
      id: "zwatchAlarm.CpuTemperature",
      defaultMessage: "CPU Temperature",
    }),
    "Host SSD life left alarm": intl.formatMessage({
      id: "zwatchAlarm.SSDLifeLeft",
      defaultMessage: "SSD Remaining Life Expectancy",
    }),
    "Host SSD temperature alarm": intl.formatMessage({
      id: "zwatchAlarm.SSDTemperature",
      defaultMessage: "SSD Temperature",
    }),
    "Host Memory Used Capacity Per Host alarm": intl.formatMessage({
      id: "zwatchAlarm.host.MemoryUsedCapacityPerHostInPercent",
      defaultMessage: "Host Memory Utilization",
    }),
  };

  const oneClickAutoGenerateAlarmNameMap: any = {
    "Active-VRouter-VRouterCPUAverageUsedUtilization": intl.formatMessage({
      id: "zwatchAlarm.vrouterCPUAverageUsedUtilization",
      defaultMessage: "VPC vRouter CPU Utilization Average",
    }),
    "Active-VRouter-VRouterMemoryUsedPercent": intl.formatMessage({
      id: "zwatchAlarm.vrouterMemoryUsedPercent",
      defaultMessage: "VPC vRouter Memory Percent Used",
    }),
    "Active-VRouter-VRouterDiskAllUsedCapacityInPercent": intl.formatMessage({
      id: "zwatchAlarm.vrouterDiskAllUsedCapacityInPercent",
      defaultMessage: "VPC vRouter Disk Capacity Percent Used Sum",
    }),
    "Active-VM-CPUAverageUsedUtilization": intl.formatMessage({
      id: "zwatchAlarm.vmCPUAverageUsedUtilization",
      defaultMessage: "VM Average CPU Utilization",
    }),
    "Active-VM-OperatingSystemMemoryUsedPercent": intl.formatMessage({
      id: "zwatchAlarm.vmOperatingSystemMemoryUsedPercent",
      defaultMessage: "VM Memory Percent Used (VMTools Required)",
    }),
    "Active-VM-MemoryUsedInPercent": intl.formatMessage({
      id: "zwatchAlarm.vmMemoryUsedInPercent",
      defaultMessage: "VM Memory Percent Used",
    }),
    "Active-VM-DiskAllUsedCapacityInPercent": intl.formatMessage({
      id: "zwatchAlarm.vmDiskAllUsedCapacityInPercent",
      defaultMessage: "VM Disk Capacity Percent Used Sum (VMTools Required)",
    }),
    "Active-VM-OperatingSystemCPUAverageUsedUtilization": intl.formatMessage({
      id: "zwatchAlarm.vmOperatingSystemCPUAverageUsedUtilization",
      defaultMessage: "VM CPU Utilization Average (VMTools Required)",
    }),
    "Active-Host-DiskAllUsedCapacityInPercent": intl.formatMessage({
      id: "zwatchAlarm.hostDiskAllUsedCapacityInPercent",
      defaultMessage: "Host Disk Capacity Percent Used Sum",
    }),
    "Active-Host-CPUAverageUsedUtilization": intl.formatMessage({
      id: "zwatchAlarm.hostCPUAverageUsedUtilization",
      defaultMessage: "Host CPU Utilization Average",
    }),
    "Active-Host-MemoryUsedInPercent": intl.formatMessage({
      id: "zwatchAlarm.hostMemoryUsedInPercent",
      defaultMessage: "Host Memory Percent Used",
    }),
  };

  const pointConfigNameMap: any = {
    cpuNum: intl.formatMessage({
      id: "zwatchAlarm.pointConfig.cpuNum",
      defaultMessage: "CPU",
    }),
    diskDevice: intl.formatMessage({
      id: "zwatchAlarm.pointConfig.diskDevice",
      defaultMessage: "Disk",
    }),
    networkDevice: intl.formatMessage({
      id: "zwatchAlarm.pointConfig.networkDevice",
      defaultMessage: "NIC",
    }),
    dirPath: intl.formatMessage({
      id: "zwatchAlarm.pointConfig.dirPath",
      defaultMessage: "Path",
    }),
    mountPoint: intl.formatMessage({
      id: "zwatchAlarm.pointConfig.mountPoint",
      defaultMessage: "Mount Point",
    }),
    interfaceName: intl.formatMessage({
      id: "zwatchAlarm.pointConfig.interfaceName",
      defaultMessage: "NIC",
    }),
  };

  const thirdPartyAlarmNameMap: any = {
    CephMessageAlarm: intl.formatMessage({
      id: "zwatchAlarm.CephMessageAlarm",
      defaultMessage: "Alarm for Distributed Storage",
    }),
    CephMessageSource: intl.formatMessage({
      id: "zwatchAlarm.CephMessageSource",
      defaultMessage: "Message Source for Distributed Storage",
    }),
  };

  /**
   * 简单解释一下容易疑惑的 @resourceAlarmConfig 配置字段
   * @labelNames 在此配置中，并没有被使用
   * @tags 在此配置中，并没有被使用
   * @unit 报警触发规则，阈值（ @threshold ）输入框的单位
   * @displayName 报警条目的翻译，当与 @selectDisplayName 一块出现，优先使用 selectDisplayName
   * @selectDisplayName 也是对报警条目的翻译，当与 @displayName 一块出现，优先使用 selectDisplayName
   * @hideProp 值通常为 period， 主要用于隐藏报警触发规则（持续）表单后面的选择器(Form.Item 的 name 为 @period )
   */
  const resourceAlarmConfig: any = {
    license: {
      name: intl.formatMessage({
        id: "monitor.template.license",
        defaultMessage: "Licenses",
      }),
      auth: {
        type: "block" as const,
        resource: "common",
        authKey: "license.alarm",
      },
      LicenseEnabledDays: {
        namespace: "ZStack/License",
        name: "LicenseEnabledDays",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.license.LicenseEnabledDays",
            defaultMessage: "Default License Expiration Time",
          }),
      },
    },
    vm: {
      name: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
      auth: {
        type: "view" as const,
        resource: "virtualization.vm",
        authKey: "list",
      },
      DiskAllFreeCapacityInBytes: {
        namespace: "ZStack/VM",
        name: "DiskAllFreeCapacityInBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.DiskAllFreeCapacityInBytes.in.select",
                defaultMessage: "Disk Remaining Capacity Sum (VMTools Required)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskAllFreeCapacityInBytes",
              defaultMessage: "VM {name} Disk Remaining Capacity Sum (Agent Required)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllFreeCapacityInPercent: {
        namespace: "ZStack/VM",
        name: "DiskAllFreeCapacityInPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.DiskAllFreeCapacityInPercent.in.select",
                defaultMessage: "Disk Capacity Remaining Percent Sum (VMTools Required)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskAllFreeCapacityInPercent",
              defaultMessage: "VM {name} Disk Capacity Remaining Percent Sum (Agent Required)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },

      DiskAllUsedCapacityInBytes: {
        namespace: "ZStack/VM",
        name: "DiskAllUsedCapacityInBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.DiskAllUsedCapacityInBytes.in.select",
                defaultMessage: "Disk Capacity Used Sum (VMTools Required)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskAllUsedCapacityInBytes",
              defaultMessage: "VM {name} Disk Capacity Used Sum (Agent Required)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllUsedCapacityInPercent: {
        namespace: "ZStack/VM",
        name: "DiskAllUsedCapacityInPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.DiskAllUsedCapacityInPercent.in.select",
                defaultMessage: "Disk Capacity Percent Used Sum (VMTools Required)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskAllUsedCapacityInPercent",
              defaultMessage:
                "VM {name} Disk Capacity Percent Used Sum (Agent Required)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemCPUAverageUsedUtilization: {
        namespace: "ZStack/VM",
        name: "OperatingSystemCPUAverageUsedUtilization",
        labelNames: ["VMUuid"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.OperatingSystemCPUAverageUsedUtilizations.in.select",
                defaultMessage: "CPU Utilization Average (Advanced Monitoring)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.OperatingSystemCPUAverageUsedUtilizations",
              defaultMessage: "VM {name} Average CPU Utilization (Advanced Monitoring)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskUsedCapacityInBytes: {
        namespace: "ZStack/VM",
        name: "DiskUsedCapacityInBytes",
        labelNames: ["VMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.DiskUsedCapacityInBytes.in.select",
                defaultMessage: "Disk Capacity Used (VMTools Required)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskUsedCapacityInBytes",
              defaultMessage: "VM {name} Disk Capacity Used (Agent Required)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskUsedCapacityInPercent: {
        namespace: "ZStack/VM",
        name: "DiskUsedCapacityInPercent",
        labelNames: ["VMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.DiskUsedCapacityInPercent.in.select",
                defaultMessage: "Disk Capacity Percent Used (VMTools Required)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskUsedCapacityInPercent",
              defaultMessage: "VM {name} Disk Capacity Percent Used (Agent Required)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskFreeCapacityInPercent: {
        namespace: "ZStack/VM",
        name: "DiskFreeCapacityInPercent",
        labelNames: ["VMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.DiskFreeCapacityInPercent.in.select",
                defaultMessage: "Disk Capacity Remaining Percent (VMTools Required)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskFreeCapacityInPercent",
              defaultMessage: "VM {name} Disk Capacity Remaining Percent (Agent Required)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskFreeCapacityInBytes: {
        namespace: "ZStack/VM",
        name: "DiskFreeCapacityInBytes",
        labelNames: ["VMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.DiskFreeCapacityInBytes.in.select",
                defaultMessage: "Disk Remaining Capacity (VMTools Required)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskFreeCapacityInBytes",
              defaultMessage: "VM {name} Disk Remaining Capacity (Agent Required)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemCPUUsedUtilization: {
        namespace: "ZStack/VM",
        name: "OperatingSystemCPUUsedUtilization",
        labelNames: ["VMUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.OperatingSystemCPUUsedUtilization.in.select",
                defaultMessage: "CPU Utilization (Advanced Monitoring)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.OperatingSystemCPUUsedUtilization",
              defaultMessage: "VM {name} CPU Utilization (Advanced Monitoring)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      CPUUsedUtilization: {
        namespace: "ZStack/VM",
        name: "CPUUsedUtilization",
        labelNames: ["VMUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.CPUUsedUtilization.in.select",
                defaultMessage: " CPU Utilization",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.CPUUsedUtilization",
              defaultMessage: "VM {name} CPU Utilization",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      CPUIdleUtilization: {
        namespace: "ZStack/VM",
        name: "CPUIdleUtilization",
        labelNames: ["VMUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.CPUIdleUtilization.in.select",
                defaultMessage: "CPU Idle Rate",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.CPUIdleUtilization",
              defaultMessage: "VM {name} CPU Idle Rate",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      CPUAllUsedUtilization: {
        namespace: "ZStack/VM",
        name: "CPUAllUsedUtilization",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.CPUAllUsedUtilization.in.select",
            defaultMessage: "CPU Utilization Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.CPUAllUsedUtilization",
              defaultMessage: "VM {name} CPU Utilization Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      CPUAverageUsedUtilization: {
        namespace: "ZStack/VM",
        name: "CPUAverageUsedUtilization",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.CPUAverageUsedUtilization.in.select",
            defaultMessage: "Average CPU Utilization",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.CPUAverageUsedUtilization",
              defaultMessage: "VM {name} Average CPU Utilization",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      CPUAllIdleUtilization: {
        namespace: "ZStack/VM",
        name: "CPUAllIdleUtilization",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.CPUAllIdleUtilization.in.select",
            defaultMessage: "CPU Idle Rate Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.CPUAllIdleUtilization",
              defaultMessage: "VM {name} CPU Idle Rate Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskReadOps: {
        namespace: "ZStack/VM",
        name: "DiskReadOps",
        labelNames: ["VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.DiskReadOps.in.select",
            defaultMessage: "Disk Read IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskReadOps",
              defaultMessage: "VM {name} Disk Read IOPS",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllReadOps: {
        namespace: "ZStack/VM",
        name: "DiskAllReadOps",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.DiskAllReadOps.in.select",
            defaultMessage: "Disk Read IOPS Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskAllReadOps",
              defaultMessage: "Host {name} Disk Read IOPS Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskWriteOps: {
        namespace: "ZStack/VM",
        name: "DiskWriteOps",
        labelNames: ["VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.DiskWriteOps.in.select",
            defaultMessage: "Disk Write IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskWriteOps",
              defaultMessage: "VM {name} Disk Write IOPS",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllWriteOps: {
        namespace: "ZStack/VM",
        name: "DiskAllWriteOps",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.DiskAllWriteOps.in.select",
            defaultMessage: "Disk Write IOPS Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskAllWriteOps",
              defaultMessage: "VM {name} Disk Write IOPS Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskReadBytes: {
        namespace: "ZStack/VM",
        name: "DiskReadBytes",
        labelNames: ["VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.DiskReadBytes.in.select",
            defaultMessage: "Disk Read Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskReadBytes",
              defaultMessage: "VM {name} Disk Read Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllReadBytes: {
        namespace: "ZStack/VM",
        name: "DiskAllReadBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.DiskAllReadBytes.in.select",
            defaultMessage: "Disk Read Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskAllReadBytes",
              defaultMessage: "VM {name} Disk Read Speed Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskWriteBytes: {
        namespace: "ZStack/VM",
        name: "DiskWriteBytes",
        labelNames: ["VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.DiskWriteBytes.in.select",
            defaultMessage: "Disk Write Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskWriteBytes",
              defaultMessage: "VM {name} Disk Write Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllWriteBytes: {
        namespace: "ZStack/VM",
        name: "DiskAllWriteBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.DiskAllWriteBytes.in.select",
            defaultMessage: "Disk Write Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.DiskAllWriteBytes",
              defaultMessage: "VM {name} Disk Write Speed Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkInBytes: {
        namespace: "ZStack/VM",
        name: "NetworkInBytes",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkInBytes.in.select",
            defaultMessage: "NIC In Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkInBytes",
              defaultMessage: "VM {name} NIC In Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllInBytes: {
        namespace: "ZStack/VM",
        name: "NetworkAllInBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkAllInBytes.in.select",
            defaultMessage: "NIC In Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkAllInBytes",
              defaultMessage: "VM {name} NIC In Speed Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkInPackets: {
        namespace: "ZStack/VM",
        name: "NetworkInPackets",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkInPackets.in.select",
            defaultMessage: "NIC In Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkInPackets",
              defaultMessage: "VM {name} NIC In Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllInPackets: {
        namespace: "ZStack/VM",
        name: "NetworkAllInPackets",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkAllInPackets.in.select",
            defaultMessage: "NIC In Packets Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkAllInPackets",
              defaultMessage: "VM {name} NIC In Packets Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkInErrors: {
        namespace: "ZStack/VM",
        name: "NetworkInErrors",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkInErrors.in.select",
            defaultMessage: "NIC In Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkInErrors",
              defaultMessage: "VM {name} NIC In Errors",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllInErrors: {
        namespace: "ZStack/VM",
        name: "NetworkAllInErrors",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkAllInErrors.in.select",
            defaultMessage: "NIC In Errors Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkAllInErrors",
              defaultMessage: "VM NIC In Errors Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkOutBytes: {
        namespace: "ZStack/VM",
        name: "NetworkOutBytes",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkOutBytes.in.select",
            defaultMessage: "NIC Out Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkOutBytes",
              defaultMessage: "VM {name} NIC Out Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllOutBytes: {
        namespace: "ZStack/VM",
        name: "NetworkAllOutBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkAllOutBytes.in.select",
            defaultMessage: "NIC Out Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkAllOutBytes",
              defaultMessage: "VM {name} NIC Out Speed Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkOutPackets: {
        namespace: "ZStack/VM",
        name: "NetworkOutPackets",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkOutPackets.in.select",
            defaultMessage: "NIC Out Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkOutPackets",
              defaultMessage: "VM {name} NIC Out Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllOutPackets: {
        namespace: "ZStack/VM",
        name: "NetworkAllOutPackets",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkAllOutPackets.in.select",
            defaultMessage: "NIC Out Packets Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkAllOutPackets",
              defaultMessage: "VM {name} NIC Out Packets Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkOutErrors: {
        namespace: "ZStack/VM",
        name: "NetworkOutErrors",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkOutErrors.in.select",
            defaultMessage: "NIC Out Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkOutErrors",
              defaultMessage: "VM {name} NIC Out Errors",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllOutErrors: {
        namespace: "ZStack/VM",
        name: "NetworkAllOutErrors",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.NetworkAllOutErrors.in.select",
            defaultMessage: "NIC Out Errors Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.NetworkAllOutErrors",
              defaultMessage: "VM {name} NIC Out Errors Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      MemoryFreeBytes: {
        namespace: "ZStack/VM",
        name: "MemoryFreeBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.MemoryFreeBytes.in.select",
            defaultMessage: "Idle Memory",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.MemoryFreeBytes",
              defaultMessage: "VM {name} Idle Memory",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      MemoryFreeInPercent: {
        namespace: "ZStack/VM",
        name: "MemoryFreeInPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.MemoryFreeInPercent.in.select",
            defaultMessage: "Memory Idle Percent",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.MemoryFreeInPercent",
              defaultMessage: "VM {name} Memory Idle Percent",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      MemoryUsedBytes: {
        namespace: "ZStack/VM",
        name: "MemoryUsedBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        auth: {
          type: "block" as const,
          resource: "alarm",
          authKey: "vm.alarm.MemoryUsedBytes",
        },
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.MemoryUsedBytes.in.select",
            defaultMessage: "Used Memory",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.MemoryUsedBytes",
              defaultMessage: "VM {name} Used Memory",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryUsedPercent: {
        namespace: "ZStack/VM",
        name: "OperatingSystemMemoryUsedPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.OperatingSystemMemoryUsedPercent.in.select",
                defaultMessage: "Memory Percent Used (Advanced Monitoring)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "internalMonitoringAgent",
                      defaultMessage: `**This alarm metric needs VM advacned monitoring data. Make sure that you have installed the VMTools for the monitored virtual machine in advance.**

1. If the VM default network has enabled the DHCP service, the monitoring data is pushed to the host via the DHCP service by default.
2. If the VM default network does not have the DHCP service enabled or the DHCP service fails, the monitoring data is pushed by the QEMU Guest Agent (QGA) in the VMTools. As soon as the DHCP service is recovered, the data is switched to be pushed by the DHCP service.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.OperatingSystemMemoryUsedPercent",
              defaultMessage: "VM {name} Used Memory Percentage (Advanced Monitoring)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      MemoryUsedInPercent: {
        namespace: "ZStack/VM",
        name: "MemoryUsedInPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vm.MemoryUsedInPercent.in.select",
                defaultMessage: "Used Memory Percentage",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vm.MemoryUsedInPercent",
              defaultMessage: "VM {name} Used Memory Percentage",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      TotalVMCount: {
        namespace: "ZStack/VM",
        name: "TotalVMCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.TotalVMCount",
            defaultMessage: "VMs",
          }),
      },
      RunningVMCount: {
        namespace: "ZStack/VM",
        name: "RunningVMCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.RunningVMCount",
            defaultMessage: "Running VMs",
          }),
      },
      RunningVMInPercent: {
        namespace: "ZStack/VM",
        name: "RunningVMInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.RunningVMInPercent",
            defaultMessage: "Running VM Percent",
          }),
      },
      StoppedVMCount: {
        namespace: "ZStack/VM",
        name: "StoppedVMCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.StoppedVMCount",
            defaultMessage: "Stopped VMs",
          }),
      },
      StoppedVMInPercent: {
        namespace: "ZStack/VM",
        name: "StoppedVMInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.StoppedVMInPercent",
            defaultMessage: "VM Stopped Percent",
          }),
      },
      OtherStateVMCount: {
        namespace: "ZStack/VM",
        name: "OtherStateVMCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.OtherStateVMCount",
            defaultMessage: "Number of VMs in Other Status",
          }),
      },
      OtherStateVMInPercent: {
        namespace: "ZStack/VM",
        name: "OtherStateVMInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.vm.OtherStateVMInPercent",
            defaultMessage: "Percent of VMs in Other Status",
          }),
      },
      GpuUtilization: {
        namespace: "ZStack/VM",
        name: "GpuUtilization",
        labelNames: ["VMUuid", "SerialNumber"],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.GpuUtilization",
            defaultMessage: "GPU Utilization",
          }),
      },
      GpuMemoryUtilization: {
        namespace: "ZStack/VM",
        name: "GpuMemoryUtilization",
        labelNames: ["VMUuid", "SerialNumber"],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.GpuMemoryUtilization",
            defaultMessage: "VRAM Utilization",
          }),
      },
      GpuTemperature: {
        namespace: "ZStack/VM",
        name: "GpuTemperature",
        labelNames: ["VMUuid", "SerialNumber"],
        tags: [],
        unit: "temperature",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.GpuTemperature",
            defaultMessage: "GPU Temperature",
          }),
      },
      VGpuUtilization: {
        namespace: "ZStack/VM",
        name: "VGpuUtilization",
        labelNames: ["VMUuid"],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.VGpuUtilization",
            defaultMessage: "vGPU Utilization",
          }),
      },
      VGpuMemoryUtilization: {
        namespace: "ZStack/VM",
        name: "VGpuMemoryUtilization",
        labelNames: ["VMUuid"],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.VGpuMemoryUtilization",
            defaultMessage: "vGPU VRAM Utilization",
          }),
      },
    },
    slbVmInstance: {
      name: intl.formatMessage({
        id: "loadBalancer",
        defaultMessage: "Load Balancer",
      }),
      auth: {
        type: "block" as const,
        resource: "load.balancer",
        authKey: "load.balancer.alarm",
      },
    },
    baremetalVm: {
      name: intl.formatMessage({
        id: "baremetal.instance",
        defaultMessage: "Bare Metal Instance",
      }),
      auth: {
        type: "block" as const,
        resource: "baremetal.instance",
        authKey: "baremetal.instance.alarm",
      },
      OperatingSystemCPUUsedUtilization: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemCPUUsedUtilization",
        labelNames: ["BaremetalVMUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemCPUUsedUtilization.in.select",
            defaultMessage: "CPU Utilization",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemCPUUsedUtilization",
              defaultMessage: "Bare Metal Instance {name} CPU Utilization",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskUsedCapacityInBytes: {
        namespace: "ZStack/BaremetalVM",
        name: "DiskUsedCapacityInBytes",
        labelNames: ["BaremetalVMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskUsedCapacityInBytes.in.select",
            defaultMessage: "Disk Capacity Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.DiskUsedCapacityInBytes",
              defaultMessage: "Bare Metal Instance {name} Disk Capacity Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskUsedCapacityInPercent: {
        namespace: "ZStack/BaremetalVM",
        name: "DiskUsedCapacityInPercent",
        labelNames: ["BaremetalVMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskUsedCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Percent Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.DiskUsedCapacityInPercent",
              defaultMessage: "Bare Metal Instance Disk Capacity Percent Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskFreeCapacityInPercent: {
        namespace: "ZStack/BaremetalVM",
        name: "DiskFreeCapacityInPercent",
        labelNames: ["BaremetalVMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskFreeCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Remaining Percent",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.DiskFreeCapacityInPercent",
              defaultMessage: "Bare Metal Instance {name} Disk Capacity Remaining Percent",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskFreeCapacityInBytes: {
        namespace: "ZStack/BaremetalVM",
        name: "DiskFreeCapacityInBytes",
        labelNames: ["BaremetalVMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskFreeCapacityInBytes.in.select",
            defaultMessage: "Disk Remaining Capacity",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.DiskFreeCapacityInBytes",
              defaultMessage: "Bare Metal Instance {name} Disk Remaining Capacity",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskReadRequestPerSecond: {
        namespace: "ZStack/BaremetalVM",
        name: "DiskReadRequestPerSecond",
        labelNames: ["BaremetalVMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskReadRequestPerSecond.in.select",
            defaultMessage: "Disk Read IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.DiskReadRequestPerSecond",
              defaultMessage: "Bare Metal Instance {name} Disk Read IOPS",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskWriteRequestPerSecond: {
        namespace: "ZStack/BaremetalVM",
        name: "DiskWriteRequestPerSecond",
        labelNames: ["BaremetalVMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskWriteRequestPerSecond.in.select",
            defaultMessage: "Disk Write IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.DiskWriteRequestPerSecond",
              defaultMessage: "Bare Metal Instance {name} Disk Write IOPS",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskReadBytesPerSecond: {
        namespace: "ZStack/BaremetalVM",
        name: "DiskReadBytesPerSecond",
        labelNames: ["BaremetalVMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskReadBytesPerSecond.in.select",
            defaultMessage: "Disk Read Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.DiskReadBytesPerSecond",
              defaultMessage: "Bare Metal Instance {name} Disk Read Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskWriteBytesPerSecond: {
        namespace: "ZStack/BaremetalVM",
        name: "DiskWriteBytesPerSecond",
        labelNames: ["BaremetalVMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskWriteBytesPerSecond.in.select",
            defaultMessage: "Disk Write Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.DiskWriteBytesPerSecond",
              defaultMessage: "Bare Metal Instance {name} Disk Write Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkInBytes: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemNetworkInBytes",
        labelNames: ["BaremetalVMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkInBytes.in.select",
            defaultMessage: "NIC In Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemNetworkInBytes",
              defaultMessage: "Bare Metal Instance {name} NIC In Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkInPackets: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemNetworkInPackets",
        labelNames: ["BaremetalVMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkInPackets.in.select",
            defaultMessage: "NIC In Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemNetworkInPackets",
              defaultMessage: "Bare Metal Instance {name} NIC In Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkInErrors: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemNetworkInErrors",
        labelNames: ["BaremetalVMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkInErrors.in.select",
            defaultMessage: "NIC In Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemNetworkInErrors",
              defaultMessage: "Bare Metal Instance {name} NIC In Errors",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkOutBytes: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemNetworkOutBytes",
        labelNames: ["BaremetalVMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkOutBytes.in.select",
            defaultMessage: "NIC Out Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemNetworkOutBytes",
              defaultMessage: "Bare Metal Instance {name} NIC Out Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkOutPackets: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemNetworkOutPackets",
        labelNames: ["BaremetalVMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkOutPackets.in.select",
            defaultMessage: "NIC Out Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemNetworkOutPackets",
              defaultMessage: "Bare Metal Instance {name} NIC Out Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkOutErrors: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemNetworkOutErrors",
        labelNames: ["BaremetalVMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkOutErrors.in.select",
            defaultMessage: "NIC Out Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemNetworkOutErrors",
              defaultMessage: "Bare Metal Instance {name} NIC Out Errors",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryTotalBytes: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemMemoryTotalBytes",
        labelNames: ["BaremetalVMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryTotalBytes.in.select",
            defaultMessage: "Memory Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemMemoryTotalBytes",
              defaultMessage: "Bare Metal Instance {name} Memory Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryFreeBytes: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemMemoryFreeBytes",
        labelNames: ["BaremetalVMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryFreeBytes.in.select",
            defaultMessage: "Reamining Memory",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemMemoryFreeBytes",
              defaultMessage: "Bare Metal Instance {name} Remaining Memory",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryUsedBytes: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemMemoryUsedBytes",
        labelNames: ["BaremetalVMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryUsedBytes.in.select",
            defaultMessage: "Memory Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemMemoryUsedBytes",
              defaultMessage: "Bare Metal Instance {name} Memory Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryAvailableBytes: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemMemoryAvailableBytes",
        labelNames: ["BaremetalVMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryAvailableBytes.in.select",
            defaultMessage: "Available Memory",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemMemoryAvailableBytes",
              defaultMessage: "Bare Metal Instance {name} Available Memory",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryFreePercent: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemMemoryFreePercent",
        labelNames: ["BaremetalVMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryFreePercent.in.select",
            defaultMessage: "Memory Remaining Percent",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemMemoryFreePercent",
              defaultMessage: "Bare Metal Instance {name} Memory Remaining Percent",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryUsedPercent: {
        namespace: "ZStack/BaremetalVM",
        name: "OperatingSystemMemoryUsedPercent",
        labelNames: ["BaremetalVMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryUsedPercent.in.select",
            defaultMessage: "Memory Utilization",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetalVm.OperatingSystemMemoryUsedPercent",
              defaultMessage: "Bare Metal Instance {name} Memory Utilization",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
    },
    baremetal2Vm: {
      name: intl.formatMessage({
        id: "baremetal2.instance",
        defaultMessage: "Elastic Baremetal Instance",
      }),
      OperatingSystemCPUUsedUtilization: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemCPUUsedUtilization",
        labelNames: ["Baremetal2VMUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemCPUUsedUtilization.in.select",
            defaultMessage: "CPU Utilization",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemCPUUsedUtilization",
              defaultMessage: "Elastic Baremetal Instance {name} CPU Utilization",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemCPUAverageUsedUtilization: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemCPUAverageUsedUtilization",
        labelNames: ["Baremetal2VMUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemCPUAverageUsedUtilization.in.select",
            defaultMessage: "CPU Utilization Average",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemCPUAverageUsedUtilization",
              defaultMessage: "Elastic Baremetal Instance {name} CPU Utilization Average",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskUsedCapacityInBytes: {
        namespace: "ZStack/Baremetal2VM",
        name: "DiskUsedCapacityInBytes",
        labelNames: ["Baremetal2VMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskUsedCapacityInBytes.in.select",
            defaultMessage: "Disk Capacity Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.DiskUsedCapacityInBytes",
              defaultMessage: "Elastic Baremetal Instance {name} Disk Capacity Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskUsedCapacityInPercent: {
        namespace: "ZStack/Baremetal2VM",
        name: "DiskUsedCapacityInPercent",
        labelNames: ["Baremetal2VMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskUsedCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Percent Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.DiskUsedCapacityInPercent",
              defaultMessage: "Elastic Baremetal Instance Disk Capacity Percent Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskFreeCapacityInPercent: {
        namespace: "ZStack/Baremetal2VM",
        name: "DiskFreeCapacityInPercent",
        labelNames: ["Baremetal2VMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskFreeCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Remaining Percent",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.DiskFreeCapacityInPercent",
              defaultMessage: "Elastic Baremetal Instance {name} Disk Capacity Remaining Percent",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskFreeCapacityInBytes: {
        namespace: "ZStack/Baremetal2VM",
        name: "DiskFreeCapacityInBytes",
        labelNames: ["Baremetal2VMUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskFreeCapacityInBytes.in.select",
            defaultMessage: "Disk Remaining Capacity",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.DiskFreeCapacityInBytes",
              defaultMessage: "Elastic Baremetal Instance {name} Disk Remaining Capacity",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskReadRequestPerSecond: {
        namespace: "ZStack/Baremetal2VM",
        name: "DiskReadRequestPerSecond",
        labelNames: ["Baremetal2VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskReadRequestPerSecond.in.select",
            defaultMessage: "Disk Read IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.DiskReadRequestPerSecond",
              defaultMessage: "Elastic Baremetal Instance {name} Disk Read IOPS",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskWriteRequestPerSecond: {
        namespace: "ZStack/Baremetal2VM",
        name: "DiskWriteRequestPerSecond",
        labelNames: ["Baremetal2VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskWriteRequestPerSecond.in.select",
            defaultMessage: "Disk Write IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.DiskWriteRequestPerSecond",
              defaultMessage: "Elastic Baremetal Instance {name} Disk Write IOPS",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskReadBytesPerSecond: {
        namespace: "ZStack/Baremetal2VM",
        name: "DiskReadBytesPerSecond",
        labelNames: ["Baremetal2VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskReadBytesPerSecond.in.select",
            defaultMessage: "Disk Read Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.DiskReadBytesPerSecond",
              defaultMessage: "Elastic Baremetal Instance {name} Disk Read Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskWriteBytesPerSecond: {
        namespace: "ZStack/Baremetal2VM",
        name: "DiskWriteBytesPerSecond",
        labelNames: ["Baremetal2VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.DiskWriteBytesPerSecond.in.select",
            defaultMessage: "Disk Write Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.DiskWriteBytesPerSecond",
              defaultMessage: "Elastic Baremetal Instance {name} Disk Write Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkInBytes: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemNetworkInBytes",
        labelNames: ["Baremetal2VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkInBytes.in.select",
            defaultMessage: "NIC In Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemNetworkInBytes",
              defaultMessage: "Elastic Baremetal Instance {name} NIC In Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkInPackets: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemNetworkInPackets",
        labelNames: ["Baremetal2VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkInPackets.in.select",
            defaultMessage: "NIC In Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemNetworkInPackets",
              defaultMessage: "Elastic Baremetal Instance {name} NIC In Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkInErrors: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemNetworkInErrors",
        labelNames: ["Baremetal2VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkInErrors.in.select",
            defaultMessage: "NIC In Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemNetworkInErrors",
              defaultMessage: "Elastic Baremetal Instance {name} NIC In Errors",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkOutBytes: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemNetworkOutBytes",
        labelNames: ["Baremetal2VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkOutBytes.in.select",
            defaultMessage: "NIC Out Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemNetworkOutBytes",
              defaultMessage: "Elastic Baremetal Instance {name} NIC Out Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkOutPackets: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemNetworkOutPackets",
        labelNames: ["Baremetal2VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkOutPackets.in.select",
            defaultMessage: "NIC Out Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemNetworkOutPackets",
              defaultMessage: "Elastic Baremetal Instance {name} NIC Out Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemNetworkOutErrors: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemNetworkOutErrors",
        labelNames: ["Baremetal2VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemNetworkOutErrors.in.select",
            defaultMessage: "NIC Out Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemNetworkOutErrors",
              defaultMessage: "Elastic Baremetal Instance {name} NIC Out Errors",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryTotalBytes: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemMemoryTotalBytes",
        labelNames: ["Baremetal2VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryTotalBytes.in.select",
            defaultMessage: "Memory Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemMemoryTotalBytes",
              defaultMessage: "Elastic Baremetal Instance {name} Memory Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryFreeBytes: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemMemoryFreeBytes",
        labelNames: ["Baremetal2VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryFreeBytes.in.select",
            defaultMessage: "Reamining Memory",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemMemoryFreeBytes",
              defaultMessage: "Elastic Baremetal Instance {name} Remaining Memory",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryUsedBytes: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemMemoryUsedBytes",
        labelNames: ["Baremetal2VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryUsedBytes.in.select",
            defaultMessage: "Memory Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemMemoryUsedBytes",
              defaultMessage: "Elastic Baremetal Instance {name} Memory Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryAvailableBytes: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemMemoryAvailableBytes",
        labelNames: ["Baremetal2VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryAvailableBytes.in.select",
            defaultMessage: "Available Memory",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemMemoryAvailableBytes",
              defaultMessage: "Elastic Baremetal Instance {name} Available Memory",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryFreePercent: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemMemoryFreePercent",
        labelNames: ["Baremetal2VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryFreePercent.in.select",
            defaultMessage: "Memory Remaining Percent",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemMemoryFreePercent",
              defaultMessage: "Elastic Baremetal Instance {name} Memory Remaining Percent",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      OperatingSystemMemoryUsedPercent: {
        namespace: "ZStack/Baremetal2VM",
        name: "OperatingSystemMemoryUsedPercent",
        labelNames: ["Baremetal2VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.baremetalVm.OperatingSystemMemoryUsedPercent.in.select",
            defaultMessage: "Memory Utilization",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.baremetal2Vm.OperatingSystemMemoryUsedPercent",
              defaultMessage: "Elastic Baremetal Instance {name} Memory Utilization",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
    },
    vrouter: {
      name: intl.formatMessage({
        id: "vpcVirtualRouter",
        defaultMessage: "VPC vRouter",
      }),
      auth: {
        type: "block" as const,
        resource: "vpc.vrouter",
        authKey: "vpc.vrouter.alarm",
      },
      CPUUsedUtilization: {
        namespace: "ZStack/VRouter",
        name: "CPUUsedUtilization",
        labelNames: ["VMUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vrouter.CPUUsedUtilization.in.select",
            defaultMessage: "CPU Utilization",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vrouter.CPUUsedUtilization",
              defaultMessage: "VPC vRouter {name} CPU Utilization",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterMemoryUsedPercent: {
        namespace: "ZStack/VRouter",
        name: "VRouterMemoryUsedPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vrouter.VRouterMemoryUsedPercent.in.select",
            defaultMessage: "Memory Percent Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vrouter.VRouterMemoryUsedPercent",
              defaultMessage: "VPC vRouter {name} Memory Percent Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      MemoryUsedInPercent: {
        namespace: "ZStack/VRouter",
        name: "MemoryUsedInPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vrouter.MemoryUsedInPercents.in.select",
            defaultMessage: "Memory Percent Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vrouter.MemoryUsedInPercents",
              defaultMessage: "VPC vRouter {name} Memory Percent Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      CPUAverageUsedUtilization: {
        namespace: "ZStack/VRouter",
        name: "CPUAverageUsedUtilization",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vrouter.CPUAverageUsedUtilization.in.select",
            defaultMessage: "CPU Utilization Average",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vrouter.CPUAverageUsedUtilization",
              defaultMessage: "VPC vRouter {name} CPU Utilization Average",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterCPUAverageUsedUtilization: {
        namespace: "ZStack/VRouter",
        name: "VRouterCPUAverageUsedUtilization",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vrouter.VRouterCPUAverageUsedUtilization.in.select",
            defaultMessage: "CPU Utilization Average",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vrouter.VRouterCPUAverageUsedUtilization",
              defaultMessage: "VPC vRouter {name} CPU Utilization Average",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },

      CPUIdleUtilization: {
        namespace: "ZStack/VRouter",
        name: "CPUIdleUtilization",
        labelNames: ["VMUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouter.CPUIdleUtilization.in.select",
            defaultMessage: "CPU Idle Rate",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouter.CPUIdleUtilization",
              defaultMessage: "VPC vRouter {name} CPU Idle Rate",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      CPUAllUsedUtilization: {
        namespace: "ZStack/VRouter",
        name: "CPUAllUsedUtilization",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouter.CPUAllUsedUtilization.in.select",
            defaultMessage: "CPU Utilization Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouter.CPUAllUsedUtilization",
              defaultMessage: "VPC vRouter {name} CPU Utilization Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      CPUAllIdleUtilization: {
        namespace: "ZStack/VRouter",
        name: "CPUAllIdleUtilization",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouter.CPUAllIdleUtilization.in.select",
            defaultMessage: "CPU Idle Rate Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouter.CPUAllIdleUtilization",
              defaultMessage: "VPC vRouter {name} CPU Idle Rate Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskReadOps: {
        namespace: "ZStack/VRouter",
        name: "DiskReadOps",
        labelNames: ["VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouter.DiskReadOps.in.select",
            defaultMessage: "Disk Read IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouter.DiskReadOps",
              defaultMessage: "VPC vRouter {name} Disk Read IOPS Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllReadOps: {
        namespace: "ZStack/VRouter",
        name: "DiskAllReadOps",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouter.DiskAllReadOps.in.select",
            defaultMessage: "Disk Read IOPS Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouter.DiskAllReadOps",
              defaultMessage: "VPC vRouter {name} Disk Read IOPS Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskWriteOps: {
        namespace: "ZStack/VRouter",
        name: "DiskWriteOps",
        labelNames: ["VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouter.DiskWriteOps.in.select",
            defaultMessage: "Disk Write IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouter.DiskWriteOps",
              defaultMessage: "VPC vRouter {name} Disk Write IOPS",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllWriteOps: {
        namespace: "ZStack/VRouter",
        name: "DiskAllWriteOps",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouter.DiskAllWriteOps.in.select",
            defaultMessage: "Disk Write IOPS Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouter.DiskAllWriteOps",
              defaultMessage: "VPC vRouter {name} Disk Write IOPS Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskReadBytes: {
        namespace: "ZStack/VRouter",
        name: "DiskReadBytes",
        labelNames: ["VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterDiskReadBytes.in.select",
            defaultMessage: "Disk Read Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskReadBytes",
              defaultMessage: "VPC vRouter {name} Disk Read Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllReadBytes: {
        namespace: "ZStack/VRouter",
        name: "DiskAllReadBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterDiskAllReadBytes.in.select",
            defaultMessage: "Disk Read Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskAllReadBytes",
              defaultMessage: "VPC vRouter {name} Disk Read Speed Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskWriteBytes: {
        namespace: "ZStack/VRouter",
        name: "DiskWriteBytes",
        labelNames: ["VMUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterDiskWriteBytes.in.select",
            defaultMessage: "Disk Write Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskWriteBytes",
              defaultMessage: "VPC vRouter {name} Disk Write Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DiskAllWriteBytes: {
        namespace: "ZStack/VRouter",
        name: "DiskAllWriteBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterDiskAllWriteBytes.in.select",
            defaultMessage: "Disk Write Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskAllWriteBytes",
              defaultMessage: "VPC vRouter {name} Disk Write Speed Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkInBytes: {
        namespace: "ZStack/VRouter",
        name: "NetworkInBytes",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkInBytes.in.select",
            defaultMessage: "NIC In Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkInBytes",
              defaultMessage: "VPC vRouter {name} NIC In Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllInBytes: {
        namespace: "ZStack/VRouter",
        name: "NetworkAllInBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkAllInBytes.in.select",
            defaultMessage: "NIC In Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkAllInBytes",
              defaultMessage: "VPC vRouter {name} NIC In Speed Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkInPackets: {
        namespace: "ZStack/VRouter",
        name: "NetworkInPackets",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkInPackets.in.select",
            defaultMessage: "NIC In Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkInPackets",
              defaultMessage: "VPC vRouter {name} NIC In Packet",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllInPackets: {
        namespace: "ZStack/VRouter",
        name: "NetworkAllInPackets",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkAllInPackets.in.select",
            defaultMessage: "NIC In Packets Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkAllInPackets",
              defaultMessage: "VPC vRouter {name} NIC In Packets Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkInErrors: {
        namespace: "ZStack/VRouter",
        name: "NetworkInErrors",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkInErrors.in.select",
            defaultMessage: "NIC In Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkInErrors",
              defaultMessage: "VPC vRouter {name} NIC In Errors",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllInErrors: {
        namespace: "ZStack/VRouter",
        name: "NetworkAllInErrors",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkAllInErrors.in.select",
            defaultMessage: "NIC In Errors Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkAllInErrors",
              defaultMessage: "VPC vRouter {name} NIC In Errors Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkOutBytes: {
        namespace: "ZStack/VRouter",
        name: "NetworkOutBytes",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkOutBytes.in.select",
            defaultMessage: "NIC Out Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkOutBytes",
              defaultMessage: "VPC vRouter {name} NIC Out Speed",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllOutBytes: {
        namespace: "ZStack/VRouter",
        name: "NetworkAllOutBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkAllOutBytes.in.select",
            defaultMessage: "NIC Out Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkAllOutBytes",
              defaultMessage: "VPC vRouter {name} NIC Out Speed Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkOutPackets: {
        namespace: "ZStack/VRouter",
        name: "NetworkOutPackets",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkOutPackets.in.select",
            defaultMessage: "NIC Out Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkOutPackets",
              defaultMessage: "VPC vRouter {name} NIC Out Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllOutPackets: {
        namespace: "ZStack/VRouter",
        name: "NetworkAllOutPackets",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkAllOutPackets.in.select",
            defaultMessage: "NIC Out Packets Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkAllOutPackets",
              defaultMessage: "VPC vRouter {name} NIC Out Packets Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkOutErrors: {
        namespace: "ZStack/VRouter",
        name: "NetworkOutErrors",
        labelNames: ["VMUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkOutErrors.in.select",
            defaultMessage: "NIC Out Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkOutErrors",
              defaultMessage: "VPC vRouter {name} NIC Out Errors",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      NetworkAllOutErrors: {
        namespace: "ZStack/VRouter",
        name: "NetworkAllOutErrors",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterNetworkAllOutErrors.in.select",
            defaultMessage: "NIC Out Errors Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterNetworkAllOutErrors",
              defaultMessage: "VPC vRouter {name} NIC Out Errors Sum",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      MemoryFreeBytes: {
        namespace: "ZStack/VRouter",
        name: "MemoryFreeBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterMemoryFreeBytes.in.select",
            defaultMessage: "Idle Memory",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterMemoryFreeBytes",
              defaultMessage: "VPC vRouter {name} Idle Memory",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      MemoryFreeInPercent: {
        namespace: "ZStack/VRouter",
        name: "MemoryFreeInPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterMemoryFreeInPercent.in.select",
            defaultMessage: "Memory Idle Percent",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterMemoryFreeInPercent",
              defaultMessage: "VPC vRouter {name} Memory Idle Percent",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      MemoryUsedBytes: {
        namespace: "ZStack/VRouter",
        name: "MemoryUsedBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterMemoryUsedBytes.in.select",
            defaultMessage: "Used Memory",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterMemoryUsedBytes",
              defaultMessage: "VPC vRouter {name} Used Memory",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      // MemoryUsedInPercent: {
      //   namespace: 'ZStack/VRouter',
      //   name: 'MemoryUsedInPercent',
      //   labelNames: ['VMUuid'],
      //   tags: ['range::multiple'],
      //   unit: 'percent',
      //   displayName: (name: string) => intl.formatMessage({
      //     id: 'metric.name.vpc.vrouterMemoryUsedInPercent',
      //     defaultMessage: 'VPC路由器{name}内存已用百分比'
      //    })
      // },
      VRouterDiskAllFreeCapacityInBytes: {
        namespace: "ZStack/VRouter",
        name: "VRouterDiskAllFreeCapacityInBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vpc.vrouterDiskAllFreeCapacityInBytes.in.select",
                defaultMessage: "Disk Remaining Capacity Sum(Preinstalled agent)",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskAllFreeCapacityInBytes",
              defaultMessage: "VPC vRouter {name} Disk Remaining Capacity Sum(Preinstalled agent)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterDiskAllFreeCapacityInPercent: {
        namespace: "ZStack/VRouter",
        name: "VRouterDiskAllFreeCapacityInPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vpc.vrouterDiskAllFreeCapacityInPercent.in.select",
                defaultMessage: "Disk Capacity Remaining Percent Sum(Preinstalled agent)",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskAllFreeCapacityInPercent",
              defaultMessage: "VPC vRouter {name} Disk Capacity Remaining Percent Sum(Preinstalled agent)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterDiskAllUsedCapacityInBytes: {
        namespace: "ZStack/VRouter",
        name: "VRouterDiskAllUsedCapacityInBytes",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vpc.vrouterDiskAllUsedCapacityInBytes.in.select",
                defaultMessage: "Disk Capacity Used Sum(Preinstalled agent)",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskAllUsedCapacityInBytes",
              defaultMessage: "VPC vRouter {name} Disk Capacity Used Sum(Preinstalled agent)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterDiskAllUsedCapacityInPercent: {
        namespace: "ZStack/VRouter",
        name: "VRouterDiskAllUsedCapacityInPercent",
        labelNames: ["VMUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vpc.vrouterDiskAllUsedCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Percent Used Sum(Preinstalled agent)",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskAllUsedCapacityInPercent",
              defaultMessage: "VPC vRouter {name} Disk Capacity Percent Used Sum(Preinstalled agent)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterDiskFreeCapacityInPercent: {
        namespace: "ZStack/VRouter",
        name: "VRouterDiskFreeCapacityInPercent",
        labelNames: ["VMUuid", "MountPoint"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vpc.vrouterDiskFreeCapacityInPercent.in.select",
                defaultMessage: "Disk Capacity Remaining Percent(Preinstalled agent)",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskFreeCapacityInPercent",
              defaultMessage: "VPC vRouter {name} Disk Capacity Remaining Percent(Preinstalled agent)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterDiskUsedCapacityInBytes: {
        namespace: "ZStack/VRouter",
        name: "VRouterDiskUsedCapacityInBytes",
        labelNames: ["VMUuid", "MountPoint"],
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vpc.vrouterDiskUsedCapacityInBytes.in.select",
                defaultMessage: "Disk Capacity Used",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskUsedCapacityInBytes",
              defaultMessage: "VPC vRouter {name} Disk Capacity Used(Preinstalled agent)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterDiskUsedCapacityInPercent: {
        namespace: "ZStack/VRouter",
        name: "VRouterDiskUsedCapacityInPercent",
        labelNames: ["VMUuid", "MountPoint"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vpc.vrouterDiskUsedCapacityInPercent.in.select",
                defaultMessage: "Disk Capacity Percent Used(Preinstalled agent)",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskUsedCapacityInPercent",
              defaultMessage: "VPC vRouter {name} Disk Capacity Percent Used(Preinstalled agent)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VRouterDiskFreeCapacityInBytes: {
        namespace: "ZStack/VRouter",
        name: "VRouterDiskFreeCapacityInBytes",
        labelNames: ["VMUuid", "MountPoint"],
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.vpc.vrouterDiskFreeCapacityInBytes.in.select",
                defaultMessage: "Disk Remaining Capacity(Preinstalled agent)",
              })}
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vpc.vrouterDiskFreeCapacityInBytes",
              defaultMessage: "VPC vRouter {name} Disk Remaining Capacity(Preinstalled agent)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
    },
    image: {
      name: intl.formatMessage({ id: "image", defaultMessage: "Image" }),
      auth: {
        type: "view" as const,
        resource: "virtualization.image",
        authKey: "list",
      },
      TotalImageCount: {
        namespace: "ZStack/Image",
        name: "TotalImageCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.TotalImageCount",
            defaultMessage: "Total Images",
          }),
      },
      ReadyImageCount: {
        namespace: "ZStack/Image",
        name: "ReadyImageCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.ReadyImageCount",
            defaultMessage: "Total Available Images",
          }),
      },
      ReadyImageInPercent: {
        namespace: "ZStack/Image",
        name: "ReadyImageInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.ReadyImageInPercent",
            defaultMessage: "Image Available Percent",
          }),
      },
      RootVolumeTemplateCount: {
        namespace: "ZStack/Image",
        name: "RootVolumeTemplateCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.RootVolumeTemplateCount",
            defaultMessage: "Root Disk Images",
          }),
      },
      RootVolumeTemplateInPercent: {
        namespace: "ZStack/Image",
        name: "RootVolumeTemplateInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.RootVolumeTemplateInPercent",
            defaultMessage: "Root Disk Image Percent",
          }),
      },
      DataVolumeTemplateCount: {
        namespace: "ZStack/Image",
        name: "DataVolumeTemplateCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.DataVolumeTemplateCount",
            defaultMessage: "Data Disk Images",
          }),
      },
      DataVolumeTemplateInPercent: {
        namespace: "ZStack/Image",
        name: "DataVolumeTemplateInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.DataVolumeTemplateInPercent",
            defaultMessage: "Data Disk Image Percent",
          }),
      },
      ISOCount: {
        namespace: "ZStack/Image",
        name: "ISOCount",
        labelNames: [],
        tags: [],
        unit: "count",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.ISOCount",
            defaultMessage: "ISO Images",
          }),
      },
      ISOInPercent: {
        namespace: "ZStack/Image",
        name: "ISOInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        hideProp: ["period"],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.image.ISOInPercent",
            defaultMessage: "ISO Image Percent",
          }),
      },
    },
    backupStorage: {
      name: intl.formatMessage({
        id: "backupStorage",
        defaultMessage: "Image Storage",
      }),
      auth: {
        type: "view" as const,
        resource: "virtualization.backup.storage",
        authKey: "list",
      },
      TotalAvailableCapacityInBytes: {
        namespace: "ZStack/BackupStorage",
        name: "TotalAvailableCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.backupStorage.TotalAvailableCapacityInBytes",
            defaultMessage: "Image Storage Available Capacity Sum",
          }),
      },
      TotalAvailableCapacityInPercent: {
        namespace: "ZStack/BackupStorage",
        name: "TotalAvailableCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.backupStorage.TotalAvailableCapacityInPercent",
            defaultMessage: "Image Storage Capacity Available Percent Sum",
          }),
      },
      AvailableCapacityInBytes: {
        namespace: "ZStack/BackupStorage",
        name: "AvailableCapacityInBytes",
        labelNames: ["BackupStorageUuid", "BackupStorageType"],
        tags: ["or", "range::multiple"],
        unit: "byte",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.backupStorage.AvailableCapacityInBytes",
              defaultMessage: "Image Storage {name} Available Capacity",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      AvailableCapacityInPercent: {
        namespace: "ZStack/BackupStorage",
        name: "AvailableCapacityInPercent",
        labelNames: ["BackupStorageUuid", "BackupStorageType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.backupStorage.AvailableCapacityInPercent",
              defaultMessage: "Image Storage {name} Capacity Available Percent",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      TotalUsedCapacityInBytes: {
        namespace: "ZStack/BackupStorage",
        name: "TotalUsedCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.backupStorage.TotalUsedCapacityInBytes",
            defaultMessage: "Image Storage Capacity Used Sum",
          }),
      },
      TotalUsedCapacityInPercent: {
        namespace: "ZStack/BackupStorage",
        name: "TotalUsedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.backupStorage.TotalUsedCapacityInPercent",
            defaultMessage: "Image Storage Capacity Percent Used Sum",
          }),
      },
      UsedCapacityInBytes: {
        namespace: "ZStack/BackupStorage",
        name: "UsedCapacityInBytes",
        labelNames: ["BackupStorageUuid", "BackupStorageType"],
        tags: ["or", "range::multiple"],
        unit: "byte",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.backupStorage.UsedCapacityInBytes",
              defaultMessage: "Image Storage {name} Capacity Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      UsedCapacityInPercent: {
        namespace: "ZStack/BackupStorage",
        name: "UsedCapacityInPercent",
        labelNames: ["BackupStorageUuid", "BackupStorageType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.backupStorage.UsedCapacityInPercent",
              defaultMessage: "Image Storage {name} Capacity Percent Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      TotalLockedCapacityInBytes: {
        namespace: "ZStack/BackupStorage",
        name: "TotalLockedCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.backupStorage.TotalLockedCapacityInBytes",
            defaultMessage: "Image Storage Locked Capacity",
          }),
      },
      TotalLockedCapacityInPercent: {
        namespace: "ZStack/BackupStorage",
        name: "TotalLockedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.backupStorage.TotalLockedCapacityInPercent",
            defaultMessage: "Image Storage Capacity Locked Percent",
          }),
      },
    },
    managementServerDir: {
      name: intl.formatMessage({
        id: "managementServerDir",
        defaultMessage: "System Data Directory",
      }),
      auth: {
        type: "block" as const,
        resource: "common",
        authKey: "management.server.dir.alarm",
      },
      ManagementServerDirFreeCapacityInBytes: {
        namespace: "ZStack/System",
        name: "ManagementServerDirFreeCapacityInBytes",
        labelNames: ["ManagementNodeIP", "DirPath"],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.system.ManagementServerDirFreeCapacityInBytes",
            defaultMessage: "Management Node Data Directory Disk Idle",
          }),
      },
      ManagementServerDirFreeCapacityInPercent: {
        namespace: "ZStack/System",
        name: "ManagementServerDirFreeCapacityInPercent",
        labelNames: ["ManagementNodeIP", "DirPath"],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.system.ManagementServerDirFreeCapacityInPercent",
            defaultMessage: "Management Node Data Directory Disk Idle Rate",
          }),
      },
      ManagementServerDirUsedCapacityInBytes: {
        namespace: "ZStack/System",
        name: "ManagementServerDirUsedCapacityInBytes",
        labelNames: ["ManagementNodeIP", "DirPath"],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.system.ManagementServerDirUsedCapacityInBytes",
            defaultMessage: "Disk Capacity Used",
          }),
      },
      ManagementServerDirUsedCapacityInPercent: {
        namespace: "ZStack/System",
        name: "ManagementServerDirUsedCapacityInPercent",
        labelNames: ["ManagementNodeIP", "DirPath"],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.system.ManagementServerDirUsedCapacityInPercent",
            defaultMessage: "Management Node Data Directory Disk Utilization",
          }),
      },
    },
    host: {
      name: intl.formatMessage({ id: "host", defaultMessage: "Host" }),
      auth: {
        type: "view" as const,
        resource: "virtualization.host",
        authKey: "list",
      },
      DiskRootUsedCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "DiskRootUsedCapacityInPercent",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskRootUsedCapacityInPercent.in.select",
            defaultMessage: "Root Volume Utilization",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskRootUsedCapacityInPercent",
              defaultMessage: "Host {name} Root Volume Utilization",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskRootUsedCapacityInBytes: {
        namespace: "ZStack/Host",
        name: "DiskRootUsedCapacityInBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskRootUsedCapacityInBytes.in.select",
            defaultMessage: "Root Volume Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskRootUsedCapacityInBytes",
              defaultMessage: "Host {name} Root Volume Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CPUIdleUtilization: {
        namespace: "ZStack/Host",
        name: "CPUIdleUtilization",
        labelNames: ["HostUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUIdleUtilization.in.select",
            defaultMessage: "CPU Idle Rate",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUIdleUtilization",
              defaultMessage: "Host {name} CPU Idle Rate",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CPUAllIdleUtilization: {
        namespace: "ZStack/Host",
        name: "CPUAllIdleUtilization",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUAllIdleUtilization.in.select",
            defaultMessage: "CPU Idle Rate Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUAllIdleUtilization",
              defaultMessage: "Host {name} CPU Idle Rate Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CPUUsedUtilization: {
        namespace: "ZStack/Host",
        name: "CPUUsedUtilization",
        labelNames: ["HostUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUUsedUtilization.in.select",
            defaultMessage: "CPU Utilization",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUUsedUtilization",
              defaultMessage: "Host {name} CPU Utilization",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CPUAverageUsedUtilization: {
        namespace: "ZStack/Host",
        name: "CPUAverageUsedUtilization",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUAverageUsedUtilization.in.select",
            defaultMessage: "CPU Utilization Average",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUAverageUsedUtilization",
              defaultMessage: "Host {name} CPU Utilization Average",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CPUAllUsedUtilization: {
        namespace: "ZStack/Host",
        name: "CPUAllUsedUtilization",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUAllUsedUtilization.in.select",
            defaultMessage: "CPU Utilization Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUAllUsedUtilization",
              defaultMessage: "Host {name} CPU Utilization Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      MemoryFreeBytes: {
        namespace: "ZStack/Host",
        name: "MemoryFreeBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryFreeBytes.in.select",
            defaultMessage: "Free Memory Capacity",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.MemoryFreeBytes",
              defaultMessage: "Host {name} Free Memory Capacity",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      MemoryFreeInPercent: {
        namespace: "ZStack/Host",
        name: "MemoryFreeInPercent",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryFreeInPercent.in.select",
            defaultMessage: "Memory Free Percent",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.MemoryFreeInPercent",
              defaultMessage: "host {name} Memory Free Percent",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      MemoryUsedBytes: {
        namespace: "ZStack/Host",
        name: "MemoryUsedBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryUsedBytes.in.select",
            defaultMessage: "Memory Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.MemoryUsedBytes",
              defaultMessage: "Host {name} Memory Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      MemoryUsedInPercent: {
        namespace: "ZStack/Host",
        name: "MemoryUsedInPercent",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryUsedInPercent.in.select",
            defaultMessage: "Memory Usage Percentage",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.MemoryUsedInPercent",
              defaultMessage: "Host {name} Memory Percent Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskReadOps: {
        namespace: "ZStack/Host",
        name: "DiskReadOps",
        labelNames: ["HostUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskReadOps.in.select",
            defaultMessage: "Disk Read IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskReadOps",
              defaultMessage: "Host {name} Disk Read IOPS",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskAllReadOps: {
        namespace: "ZStack/Host",
        name: "DiskAllReadOps",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskAllReadOps.in.select",
            defaultMessage: "Disk Read IOPS Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskAllReadOps",
              defaultMessage: "Host {name} Disk Read IOPS Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskWriteOps: {
        namespace: "ZStack/Host",
        name: "DiskWriteOps",
        labelNames: ["HostUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskWriteOps.in.select",
            defaultMessage: "Disk Write IOPS",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskWriteOps",
              defaultMessage: "Host {name} Disk Write IOPS",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskAllWriteOps: {
        namespace: "ZStack/Host",
        name: "DiskAllWriteOps",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskAllWriteOps.in.select",
            defaultMessage: "Disk Write IOPS Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskAllWriteOps",
              defaultMessage: "Host {name} Disk Write IOPS Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskReadBytes: {
        namespace: "ZStack/Host",
        name: "DiskReadBytes",
        labelNames: ["HostUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskReadBytes.in.select",
            defaultMessage: "Disk Read Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskReadBytes",
              defaultMessage: "Host {name} Disk Read Speed",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskAllReadBytes: {
        namespace: "ZStack/Host",
        name: "DiskAllReadBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskAllReadBytes.in.select",
            defaultMessage: "Disk Read Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskAllReadBytes",
              defaultMessage: "Host {name} Disk Read Speed Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskWriteBytes: {
        namespace: "ZStack/Host",
        name: "DiskWriteBytes",
        labelNames: ["HostUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskWriteBytes.in.select",
            defaultMessage: "Disk Write Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskWriteBytes",
              defaultMessage: "Host {name} Disk Write Speed",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskAllWriteBytes: {
        namespace: "ZStack/Host",
        name: "DiskAllWriteBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskAllWriteBytes.in.select",
            defaultMessage: "Disk Write Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskAllWriteBytes",
              defaultMessage: "Host {name} Disk Write Speed Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkInBytes: {
        namespace: "ZStack/Host",
        name: "NetworkInBytes",
        labelNames: ["HostUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkInBytes.in.select",
            defaultMessage: "NIC In Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkInBytes",
              defaultMessage: "Host {name} NIC In Speed",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkAllInBytes: {
        namespace: "ZStack/Host",
        name: "NetworkAllInBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkAllInBytes.in.select",
            defaultMessage: "NIC In Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkAllInBytes",
              defaultMessage: "Host {name} NIC In Speed Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkInPackets: {
        namespace: "ZStack/Host",
        name: "NetworkInPackets",
        labelNames: ["HostUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkInPackets.in.select",
            defaultMessage: "NIC In Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkInPackets",
              defaultMessage: "Host {name} NIC In Packets",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkAllInPackets: {
        namespace: "ZStack/Host",
        name: "NetworkAllInPackets",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkAllInPackets.in.select",
            defaultMessage: "NIC In Packets Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkAllInPackets",
              defaultMessage: "Host {name} NIC In Packets Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkInErrors: {
        namespace: "ZStack/Host",
        name: "NetworkInErrors",
        labelNames: ["HostUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkInErrors.in.select",
            defaultMessage: "NIC In Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkInErrors",
              defaultMessage: "Host {name} NIC In Errors",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkAllInErrors: {
        namespace: "ZStack/Host",
        name: "NetworkAllInErrors",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkAllInErrors.in.select",
            defaultMessage: "NIC In Errors Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkAllInErrors",
              defaultMessage: "Host {name} NIC In Errors Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkOutBytes: {
        namespace: "ZStack/Host",
        name: "NetworkOutBytes",
        labelNames: ["HostUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkOutBytes.in.select",
            defaultMessage: "NIC Out Speed",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkOutBytes",
              defaultMessage: "Host {name} NIC Out Speed",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkAllOutBytes: {
        namespace: "ZStack/Host",
        name: "NetworkAllOutBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkAllOutBytes.in.select",
            defaultMessage: "NIC Out Speed Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkAllOutBytes",
              defaultMessage: "Host {name} NIC Out Speed Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkOutPackets: {
        namespace: "ZStack/Host",
        name: "NetworkOutPackets",
        labelNames: ["HostUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkOutPackets.in.select",
            defaultMessage: "NIC Out Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkOutPackets",
              defaultMessage: "Host {name} NIC Out Packets",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkAllOutPackets: {
        namespace: "ZStack/Host",
        name: "NetworkAllOutPackets",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkAllOutPackets.in.select",
            defaultMessage: "NIC Out Packets Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkAllOutPackets",
              defaultMessage: "Host {name} NIC Out Packets Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkOutErrors: {
        namespace: "ZStack/Host",
        name: "NetworkOutErrors",
        labelNames: ["HostUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkOutErrors.in.select",
            defaultMessage: "NIC Out Errors",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkOutErrors",
              defaultMessage: "Host {name} NIC Out Errors",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkAllOutErrors: {
        namespace: "ZStack/Host",
        name: "NetworkAllOutErrors",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkAllOutErrors.in.select",
            defaultMessage: "NIC Out Errors Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkAllOutErrors",
              defaultMessage: "Host {name} NIC Out Errors Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkConntrackCount: {
        namespace: "ZStack/Host",
        name: "NetworkConntrackCount",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkConntrackCount.in.select",
            defaultMessage: "Host Conntrack Connections",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkConntrackCount",
              defaultMessage: "Host {name} Conntrack Connections",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkConntrackInPercent: {
        namespace: "ZStack/Host",
        name: "NetworkConntrackInPercent",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkConntrackInPercent.in.select",
            defaultMessage: "Host Conntrack Percent Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkConntrackInPercent",
              defaultMessage: "Host {name} Conntrack Percent Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkInDropped: {
        namespace: "ZStack/Host",
        name: "NetworkInDropped",
        labelNames: ["HostUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkInDropped.in.select",
            defaultMessage: "NIC Lost Packets (Inbound)",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkInDropped",
              defaultMessage: "Host {name} NIC Lost Packets (Inbound)",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      NetworkOutDropped: {
        namespace: "ZStack/Host",
        name: "NetworkOutDropped",
        labelNames: ["HostUuid", "NetworkDeviceLetter"],
        tags: ["range::optional"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.NetworkOutDropped.in.select",
            defaultMessage: "NIC Lost Packets (Outbound)",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.NetworkOutDropped",
              defaultMessage: "Host {name} NIC Lost Packets (Outbound)",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      PhysicalNetworkInterface: {
        namespace: "ZStack/Host",
        name: "PhysicalNetworkInterface",
        labelNames: ["HostUuid", "InterfaceName"],
        tags: ["range::optional"],
        unit: "",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.PhysicalNetworkInterface",
            defaultMessage: "NIC ",
          }),
      },
      DiskAllFreeCapacityInBytes: {
        namespace: "ZStack/Host",
        name: "DiskAllFreeCapacityInBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskAllFreeCapacityInBytes.in.select",
            defaultMessage: "Disk Remaining Capacity Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskAllFreeCapacityInBytes",
              defaultMessage: "Host {name} Disk Remaining Capacity Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskAllFreeCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "DiskAllFreeCapacityInPercent",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskAllFreeCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Remaining Percent Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskAllFreeCapacityInPercent",
              defaultMessage: "Host {name} Disk Capacity Remaining Percent Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskAllUsedCapacityInBytes: {
        namespace: "ZStack/Host",
        name: "DiskAllUsedCapacityInBytes",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskAllUsedCapacityInBytes.in.select",
            defaultMessage: "Disk Capacity Used Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskAllUsedCapacityInBytes",
              defaultMessage: "Host {name} Disk Capacity Used Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskAllUsedCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "DiskAllUsedCapacityInPercent",
        labelNames: ["HostUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskAllUsedCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Percent Used Sum",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskAllUsedCapacityInPercent",
              defaultMessage: "Host {name} Disk Capacity Percent Used Sum",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskCapacityInBytes: {
        namespace: "ZStack/Host",
        name: "DiskCapacityInBytes",
        labelNames: ["HostUuid", "DiskDeviceLetter", "MountPoint"],
        tags: ["range::optional"],
        filterLabels: "FSType!~proc|tmpfs|rootfs|ramfs|iso9660|rpc_pipefs",
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskCapacityInBytes.in.select",
            defaultMessage: "Disk Capacity",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskCapacityInBytes",
              defaultMessage: "Host {name} Disk Capacity",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskFreeCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "DiskFreeCapacityInPercent",
        labelNames: ["HostUuid", "DiskDeviceLetter", "MountPoint"],
        filterLabels: "FSType!~proc|tmpfs|rootfs|ramfs|iso9660|rpc_pipefs",
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskFreeCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Remaining Percent",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskFreeCapacityInPercent",
              defaultMessage: "Host {name} Disk Capacity Remaining Percent",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskUsedCapacityInBytes: {
        namespace: "ZStack/Host",
        name: "DiskUsedCapacityInBytes",
        labelNames: ["HostUuid", "DiskDeviceLetter", "MountPoint"],
        filterLabels: "FSType!~proc|tmpfs|rootfs|ramfs|iso9660|rpc_pipefs",
        tags: ["range::optional"],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskUsedCapacityInBytes.in.select",
            defaultMessage: "Disk Capacity Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskUsedCapacityInBytes",
              defaultMessage: "Host {name} Disk Capacity Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskUsedCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "DiskUsedCapacityInPercent",
        labelNames: ["HostUuid", "DiskDeviceLetter", "MountPoint"],
        filterLabels: "FSType!~proc|tmpfs|rootfs|ramfs|iso9660|rpc_pipefs",
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DiskUsedCapacityInPercent.in.select",
            defaultMessage: "Disk Capacity Percent Used",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskUsedCapacityInPercent",
              defaultMessage: "Host {name} Disk Capacity Percent Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      DiskXfsFragInPercent: {
        namespace: "ZStack/Host",
        name: "DiskXfsFragInPercent",
        labelNames: ["HostUuid"],
        tags: ["range::optional"],
        unit: "percent",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.host.DiskXfsFragInPercent.in.select",
                defaultMessage: "XFS Fragmentation Degree Percent",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "diskXfsFragMonitoring",
                      defaultMessage: `### XFS Fragmentation Monitoring

1. The system collects the monitoring data of the XFS fragmentation degree at an interval of 12 hours.
2. We recommend that you set a reasonable alarm threshold duration based on the sampling period.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.DiskXfsFragInPercent",
              defaultMessage: "Host {name} XFS Fragmentation Degree Percent",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      SSDLifeLeft: {
        namespace: "ZStack/Host",
        name: "SSDLifeLeft",
        labelNames: ["HostUuid", "DiskDeviceLetter"],
        tags: ["range::optional"],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.SSDLifeLeft",
            defaultMessage: "SSD Remaining Life Expectancy",
          }),
      },
      SSDTemperature: {
        namespace: "ZStack/Host",
        name: "SSDTemperature",
        unit: "temperature",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.SSDTemperature",
            defaultMessage: "SSD Temperature",
          }),
      },
      HostTotal: {
        namespace: "ZStack/Host",
        name: "HostTotal",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.HostTotal",
            defaultMessage: "Hosts",
          }),
      },
      KVMHostTotal: {
        namespace: "ZStack/Host",
        name: "KVMHostTotal",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.KVMHostTotal",
            defaultMessage: "KVM Hosts",
          }),
      },
      XDragonHostTotal: {
        namespace: "ZStack/Host",
        name: "XDragonHostTotal",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.XDragonHostTotal",
            defaultMessage: "XDragon Hosts",
          }),
      },
      ConnectedHostCount: {
        namespace: "ZStack/Host",
        name: "ConnectedHostCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.ConnectedHostCount",
            defaultMessage: "Connected Hosts",
          }),
      },
      KVMConnectedHostCount: {
        namespace: "ZStack/Host",
        name: "KVMConnectedHostCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.KVMConnectedHostCount",
            defaultMessage: "Connected KVM Hosts",
          }),
      },
      XDragonConnectedHostCount: {
        namespace: "ZStack/Host",
        name: "XDragonConnectedHostCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.XDragonConnectedHostCount",
            defaultMessage: "Connected XDragon Hosts",
          }),
      },
      ConnectedHostInPercent: {
        namespace: "ZStack/Host",
        name: "ConnectedHostInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.ConnectedHostInPercent",
            defaultMessage: "Connected Host Percent",
          }),
      },
      KVMConnectedHostInPercent: {
        namespace: "ZStack/Host",
        name: "KVMConnectedHostInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.KVMConnectedHostInPercent",
            defaultMessage: "KVM Host Connected Percent",
          }),
      },
      XDragonConnectedHostInPercent: {
        namespace: "ZStack/Host",
        name: "XDragonConnectedHostInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.XDragonConnectedHostInPercent",
            defaultMessage: "XDragon Host Connected Percent",
          }),
      },
      DisconnectedHostCount: {
        namespace: "ZStack/Host",
        name: "DisconnectedHostCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DisconnectedHostCount",
            defaultMessage: "Hosts Not Connected",
          }),
      },
      KVMDisconnectedHostCount: {
        namespace: "ZStack/Host",
        name: "KVMDisconnectedHostCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.KVMDisconnectedHostCount",
            defaultMessage: "KVM Hosts Not Connected",
          }),
      },
      XDragonDisconnectedHostCount: {
        namespace: "ZStack/Host",
        name: "XDragonDisconnectedHostCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.XDragonDisconnectedHostCount",
            defaultMessage: "XDragon Hosts Not Connected",
          }),
      },
      DisconnectedHostInPercent: {
        namespace: "ZStack/Host",
        name: "DisconnectedHostInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.DisconnectedHostInPercent",
            defaultMessage: "Host Disconnected Percent",
          }),
      },
      KVMDisconnectedHostInPercent: {
        namespace: "ZStack/Host",
        name: "KVMDisconnectedHostInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.KVMDisconnectedHostInPercent",
            defaultMessage: "KVM Hosts Not Connected Percent",
          }),
      },
      XDragonDisconnectedHostInPercent: {
        namespace: "ZStack/Host",
        name: "XDragonDisconnectedHostInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.XDragonDisconnectedHostInPercent",
            defaultMessage: "XDragon Host Not Connected Percent",
          }),
      },
      CPUCapacityTotal: {
        namespace: "ZStack/Host",
        name: "CPUCapacityTotal",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUCapacityTotal",
            defaultMessage: "CPU Sum",
          }),
      },
      CPUUsedCapacityCount: {
        namespace: "ZStack/Host",
        name: "CPUUsedCapacityCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUUsedCapacityCount",
            defaultMessage: "Used CPUs",
          }),
      },
      CPULockedCapacityCount: {
        namespace: "ZStack/Host",
        name: "CPULockedCapacityCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPULockedCapacityCount",
            defaultMessage: "Locked CPUs",
          }),
      },
      CPUUsedCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "CPUUsedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUUsedCapacityInPercent",
            defaultMessage: "CPU Percent Used",
          }),
      },
      CPULockedCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "CPULockedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPULockedCapacityInPercent",
            defaultMessage: "CPU Locked Percent",
          }),
      },
      CPUAvailableCapacityCount: {
        namespace: "ZStack/Host",
        name: "CPUAvailableCapacityCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUAvailableCapacityCount",
            defaultMessage: "Available CPUs",
          }),
      },
      CPUAvailableCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "CPUAvailableCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CPUAvailableCapacityInPercent",
            defaultMessage: "CPU Available Percent",
          }),
      },
      CPUUsedCapacityPerHostCount: {
        namespace: "ZStack/Host",
        name: "CPUUsedCapacityPerHostCount",
        labelNames: ["HostUuid", "HypervisorType"],
        tags: ["or", "range::optional"],
        unit: "count",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUUsedCapacityPerHostCount",
              defaultMessage: "Host {name} Used CPUs",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CPUUsedCapacityPerHostInPercent: {
        namespace: "ZStack/Host",
        name: "CPUUsedCapacityPerHostInPercent",
        labelNames: ["HostUuid", "HypervisorType"],
        tags: ["or", "range::optional"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUUsedCapacityPerHostInPercent",
              defaultMessage: "Host {name} CPU Percent Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CPUAvailableCapacityPerHostCount: {
        namespace: "ZStack/Host",
        name: "CPUAvailableCapacityPerHostCount",
        labelNames: ["HostUuid", "HypervisorType"],
        tags: ["or", "range::optional"],
        unit: "count",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUAvailableCapacityPerHostCount",
              defaultMessage: "Host {name} Available CPUs",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CPUAvailableCapacityPerHostInPercent: {
        namespace: "ZStack/Host",
        name: "CPUAvailableCapacityPerHostInPercent",
        labelNames: ["HostUuid", "HypervisorType"],
        tags: ["or", "range::optional"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.CPUAvailableCapacityPerHostInPercent",
              defaultMessage: "Host {name} CPU Available Percent",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      CpuTemperature: {
        namespace: "ZStack/Host",
        name: "CpuTemperature",
        labelNames: ["HostUuid", "CPUNum"],
        tags: ["range::optional"],
        unit: "temperature",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.CpuTemperature",
            defaultMessage: "CPU Temperature",
          }),
      },
      MemoryCapacityTotal: {
        namespace: "ZStack/Host",
        name: "MemoryCapacityTotal",
        labelNames: [],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryCapacityTotal",
            defaultMessage: "Memory Capacity",
          }),
      },
      MemoryUsedCapacityInBytes: {
        namespace: "ZStack/Host",
        name: "MemoryUsedCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryUsedCapacityInBytes",
            defaultMessage: "Memory Used",
          }),
      },
      MemoryUsedCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "MemoryUsedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryUsedCapacityInPercent",
            defaultMessage: "Memory Percent Used",
          }),
      },
      MemoryLockedCapacityInBytes: {
        namespace: "ZStack/Host",
        name: "MemoryLockedCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryLockedCapacityInBytes",
            defaultMessage: "Locked Memory",
          }),
      },
      MemoryLockedCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "MemoryLockedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryLockedCapacityInPercent",
            defaultMessage: "Memory Locked Percent",
          }),
      },
      MemoryAvailableCapacityInBytes: {
        namespace: "ZStack/Host",
        name: "MemoryAvailableCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryAvailableCapacityInBytes",
            defaultMessage: "Remaining Memory",
          }),
      },
      MemoryAvailableCapacityInPercent: {
        namespace: "ZStack/Host",
        name: "MemoryAvailableCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.MemoryAvailableCapacityInPercent",
            defaultMessage: "Memory Remaining Percent",
          }),
      },
      MemoryUsedCapacityPerHostInBytes: {
        namespace: "ZStack/Host",
        name: "MemoryUsedCapacityPerHostInBytes",
        labelNames: ["HostUuid", "HypervisorType"],
        tags: ["or", "range::multiple"],
        unit: "byte",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.MemoryUsedCapacityPerHostInBytes",
              defaultMessage: "Host {name} Memory Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      MemoryUsedCapacityPerHostInPercent: {
        namespace: "ZStack/Host",
        name: "MemoryUsedCapacityPerHostInPercent",
        labelNames: ["HostUuid", "HypervisorType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.MemoryUsedCapacityPerHostInPercent",
              defaultMessage: "Host {name} Memory Percent Used",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      MemoryAvailableCapacityPerHostInBytes: {
        namespace: "ZStack/Host",
        name: "MemoryAvailableCapacityPerHostInBytes",
        labelNames: ["HostUuid", "HypervisorType"],
        tags: ["or", "range::multiple"],
        unit: "byte",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.MemoryAvailableCapacityPerHostInBytes",
              defaultMessage: "Host {name} Available Memory",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      MemoryAvailableCapacityPerHostInPercent: {
        namespace: "ZStack/Host",
        name: "MemoryAvailableCapacityPerHostInPercent",
        labelNames: ["HostUuid", "HypervisorType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.MemoryAvailableCapacityPerHostInPercent",
              defaultMessage: "Host {name} Memory Available Percent",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      RaidState: {
        namespace: "ZStack/Host",
        name: "RaidState",
        labelNames: ["HostUuid"],
        tags: [],
        unit: "",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.RaidState",
            defaultMessage: "RAID Status",
          }),
      },
      PowerSupply: {
        namespace: "ZStack/Host",
        name: "PowerSupply",
        labelNames: ["HostUuid"],
        tags: [],
        unit: "",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.PowerSupply",
            defaultMessage: "Power Status",
          }),
      },
      GpuUtilization: {
        namespace: "ZStack/Host",
        name: "GpuUtilization",
        labelNames: ["HostUuid", "PciDeviceAddress"],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.GpuUtilization",
            defaultMessage: "GPU Utilization",
          }),
      },
      GpuMemoryUtilization: {
        namespace: "ZStack/Host",
        name: "GpuMemoryUtilization",
        labelNames: ["HostUuid", "PciDeviceAddress"],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.GpuMemoryUtilization",
            defaultMessage: "VRAM Utilization",
          }),
      },
      GpuTemperature: {
        namespace: "ZStack/Host",
        name: "GpuTemperature",
        labelNames: ["HostUuid", "PciDeviceAddress"],
        tags: [],
        unit: "temperature",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.GpuTemperature",
            defaultMessage: "GPU Temperature",
          }),
      },
      FcHbaLinkFailureTotal: {
        namespace: "ZStack/Host",
        name: "FcHbaLinkFailureTotal",
        labelNames: ["HostUuid"],
        tags: [],
        unit: "count",
        selectDisplayName: () => (
          <div style={{ display: "flex", alignItems: "center" }}>
            {intl.formatMessage({
              id: "metric.name.host.FcHbaLinkFailureTotal.in.select",
              defaultMessage: "FC-HBA Link Failure Count",
            })}
            <Tooltip
              overlayInnerStyle={{ wordBreak: "break-all" }}
              title={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "metric.name.host.FcHbaLinkFailureTotal.tooltip",
                    defaultMessage:
                      "If the /sys/class/fc_host/<Name>/statistics/ directory is missing on the FC-HBA device, the platform cannot monitor FC link failures or trigger this alarm.",
                  })}
                </ReactMarkdown>
              }
            >
              <Icon
                type="info"
                className="info-icon"
                style={{ marginLeft: 4 }}
              />
            </Tooltip>
          </div>
        ),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.FcHbaLinkFailureTotal",
              defaultMessage: "Host {name} FC-HBA Link Failure Count",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
      FcHbaLossOfSignalTotal: {
        namespace: "ZStack/Host",
        name: "FcHbaLossOfSignalTotal",
        labelNames: ["HostUuid"],
        tags: [],
        unit: "count",
        selectDisplayName: () => (
          <div style={{ display: "flex", alignItems: "center" }}>
            {intl.formatMessage({
              id: "metric.name.host.FcHbaLossOfSignalTotal.in.select",
              defaultMessage: "FC-HBA Link Signal Loss Count",
            })}
            <Tooltip
              overlayInnerStyle={{ wordBreak: "break-all" }}
              title={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "metric.name.host.FcHbaLossOfSignalTotal.tooltip",
                    defaultMessage:
                      "If the /sys/class/fc_host/<Name>/statistics/ directory is missing on the FC-HBA device, the platform cannot monitor FC link signal loss events or trigger this alarm.",
                  })}
                </ReactMarkdown>
              }
            >
              <Icon
                type="info"
                className="info-icon"
                style={{ marginLeft: 4 }}
              />
            </Tooltip>
          </div>
        ),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.host.FcHbaLossOfSignalTotal",
              defaultMessage: "Host {name} FC-HBA Link Signal Loss Count",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
    },
    baremetal2GateWay: {
      name: intl.formatMessage({
        id: "baremetal2GateWay",
        defaultMessage: "Elastic Baremetal Gateway",
      }),
      Baremetal2GateWayTotal: {
        namespace: "ZStack/BareMetal2Gateway",
        name: "Baremetal2GateWayTotal",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.Baremetal2GateWayTotal",
            defaultMessage: "Elastic Baremetal Gateways",
          }),
      },
      Baremetal2ConnectedGateWayCount: {
        namespace: "ZStack/BareMetal2Gateway",
        name: "Baremetal2ConnectedGateWayCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.Baremetal2ConnectedGateWayCount",
            defaultMessage: "Connected Elastic Baremetal Gateways",
          }),
      },
      Baremetal2ConnectedGateWayInPercent: {
        namespace: "ZStack/BareMetal2Gateway",
        name: "Baremetal2ConnectedGateWayInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.Baremetal2ConnectedGateWayInPercent",
            defaultMessage: "Elastic Baremetal Gateway Connected Percent",
          }),
      },
      Baremetal2DisconnectedGateWayCount: {
        namespace: "ZStack/BareMetal2Gateway",
        name: "Baremetal2DisconnectedGateWayCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.Baremetal2DisconnectedGateWayCount",
            defaultMessage: "Elastic Baremetal Gateways Not Connected",
          }),
      },
      Baremetal2DisconnectedGateWayInPercent: {
        namespace: "ZStack/BareMetal2Gateway",
        name: "Baremetal2DisconnectedGateWayInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.host.Baremetal2DisconnectedGateWayInPercent",
            defaultMessage: "Elastic Baremetal Gateways Not Connected Percent",
          }),
      },
    },
    l3network: {
      name: intl.formatMessage({ id: "l3Network", defaultMessage: "Distributed Port Group" }),
      auth: {
        type: "view" as const,
        resource: "virtualization.l3.network",
        authKey: "list",
      },
      TotalAvailableIPCount: {
        namespace: "ZStack/L3Network",
        name: "TotalAvailableIPCount",
        labelNames: [],
        tags: [],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalAvailableIPCount.in.select",
            defaultMessage: "Available IPs Sum (IPv4)",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalAvailableIPCount",
            defaultMessage: "Distributed Port Group Available IPs Sum (IPv4)",
          }),
      },
      TotalAvailableIPInPercent: {
        namespace: "ZStack/L3Network",
        name: "TotalAvailableIPInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalAvailableIPInPercent.in.select",
            defaultMessage: "IP Available Percent (IPv4)",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalAvailableIPInPercent",
            defaultMessage: "Distributed Port Group IP Available Percent Sum (IPv4)",
          }),
      },
      TotalUsedIPCount: {
        namespace: "ZStack/L3Network",
        name: "TotalUsedIPCount",
        labelNames: [],
        tags: [],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalUsedIPCount.in.select",
            defaultMessage: "Used IPs Sum (IPv4)",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalUsedIPCount",
            defaultMessage: "Distributed Port Group Used IPs Sum (IPv4)",
          }),
      },
      TotalUsedIPInPercent: {
        namespace: "ZStack/L3Network",
        name: "TotalUsedIPInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalUsedIPInPercent.in.select",
            defaultMessage: "IP Percent Used Sum (IPv4)",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalUsedIPInPercent",
            defaultMessage: "Distributed Port Group IP Percent Used Sum (IPv4)",
          }),
      },
      TotalLockedIPCount: {
        namespace: "ZStack/L3Network",
        name: "TotalLockedIPCount",
        labelNames: [],
        tags: [],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalLockedIPCount.in.select",
            defaultMessage: "Locked IPs Sum (IPv4)",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalLockedIPCount",
            defaultMessage: "Distributed Port Group Locked IPs Sum (IPv4)",
          }),
      },
      TotalLockedIPInPercent: {
        namespace: "ZStack/L3Network",
        name: "TotalLockedIPInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalLockedIPInPercent.in.select",
            defaultMessage: "IP Locked Percent Sum (IPv4)",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.TotalLockedIPInPercent",
            defaultMessage: "Distributed Port Group IP Locked Percent Sum (IPv4)",
          }),
      },
      AvailableIPCount: {
        namespace: "ZStack/L3Network",
        name: "AvailableIPCount",
        labelNames: ["L3NetworkUuid", "L3NetworkType"],
        tags: ["or", "range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.AvailableIPCount.in.select",
            defaultMessage: "Available IPs (IPv4)",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.l3network.AvailableIPCount",
              defaultMessage: "Distributed Port Group {name} Available IPs (IPv4)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      AvailableIPInPercent: {
        namespace: "ZStack/L3Network",
        name: "AvailableIPInPercent",
        labelNames: ["L3NetworkUuid", "L3NetworkType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.AvailableIPInPercent.in.select",
            defaultMessage: "IP Available Percent (IPv4)",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.l3network.AvailableIPInPercent",
              defaultMessage: "Distributed Port Group {name} IP Available Percent (IPv4)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      UsedIPCount: {
        namespace: "ZStack/L3Network",
        name: "UsedIPCount",
        labelNames: ["L3NetworkUuid", "L3NetworkType"],
        tags: ["or", "range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.UsedIPCount.in.select",
            defaultMessage: "Used IPs (IPv4)",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.l3network.UsedIPCount",
              defaultMessage: "Distributed Port Group {name} Used IPs (IPv4)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      UsedIPInPercent: {
        namespace: "ZStack/L3Network",
        name: "UsedIPInPercent",
        labelNames: ["L3NetworkUuid", "L3NetworkType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.l3network.UsedIPInPercent.in.select",
            defaultMessage: "Used IP Percentage (IPv4)",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.l3network.UsedIPInPercent",
              defaultMessage: "Distributed Port Group {name} IP Percent Used (IPv4)",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
    },
    volume: {
      name: intl.formatMessage({ id: "volume", defaultMessage: "Disk" }),
      auth: {
        type: "block" as const,
        resource: "volume",
        authKey: "volume.alarm",
      },
      TotalVolumeCount: {
        namespace: "ZStack/Volume",
        name: "TotalVolumeCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.TotalVolumeCount",
            defaultMessage: "Volumes",
          }),
      },
      RootVolumeCount: {
        namespace: "ZStack/Volume",
        name: "RootVolumeCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.RootVolumeCount",
            defaultMessage: "Total Root Volumes",
          }),
      },
      RootVolumeInPercent: {
        namespace: "ZStack/Volume",
        name: "RootVolumeInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.RootVolumeInPercent",
            defaultMessage: "Root Volume Percent",
          }),
      },
      DataVolumeCount: {
        namespace: "ZStack/Volume",
        name: "DataVolumeCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.DataVolumeCount",
            defaultMessage: "Total Data Volumes",
          }),
      },
      DataVolumeInPercent: {
        namespace: "ZStack/Volume",
        name: "DataVolumeInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.DataVolumeInPercent",
            defaultMessage: "Data Volume Percent",
          }),
      },
      ReadyDataVolumeCount: {
        namespace: "ZStack/Volume",
        name: "ReadyDataVolumeCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.ReadyDataVolumeCount",
            defaultMessage: "Available Data Volumes Sum",
          }),
      },
      ReadyDataVolumeInPercent: {
        namespace: "ZStack/Volume",
        name: "ReadyDataVolumeInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.ReadyDataVolumeInPercent",
            defaultMessage: "Data Volume Available Percent",
          }),
      },
      TotalVolumeSnapshotCount: {
        namespace: "ZStack/Volume",
        name: "TotalVolumeSnapshotCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.TotalVolumeSnapshotCount",
            defaultMessage: "Volume Snapshot Sum",
          }),
      },
      RootVolumeSnapshotCount: {
        namespace: "ZStack/Volume",
        name: "RootVolumeSnapshotCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.RootVolumeSnapshotCount",
            defaultMessage: "Root Volume Snapshots",
          }),
      },
      RootVolumeSnapshotInPercent: {
        namespace: "ZStack/Volume",
        name: "RootVolumeSnapshotInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.RootVolumeSnapshotInPercent",
            defaultMessage: "Root Volume Snapshot Percent",
          }),
      },
      DataVolumeSnapshotCount: {
        namespace: "ZStack/Volume",
        name: "DataVolumeSnapshotCount",
        labelNames: [],
        tags: [],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.DataVolumeSnapshotCount",
            defaultMessage: "Data Volume Snapshots",
          }),
      },
      DataVolumeSnapshotInPercent: {
        namespace: "ZStack/Volume",
        name: "DataVolumeSnapshotInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.DataVolumeSnapshotInPercent",
            defaultMessage: "Data Volume Snapshot Percent",
          }),
      },
      VolumeActualSizeInPercent: {
        namespace: "ZStack/Volume",
        name: "VolumeActualSizeInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.VolumeActualSizeInPercent",
            defaultMessage: "Volume Capacity Percent Used",
          }),
      },
      VolumeXfsFragCount: {
        namespace: "ZStack/Volume",
        name: "VolumeXfsFragCount",
        labelNames: ["VolumeUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () => {
          return (
            <>
              {intl.formatMessage({
                id: "metric.name.volume.VolumeXfsFragCount.in.select",
                defaultMessage: "(100 GB and Above) Fragmentation Degree (Total Number of Extents)",
              })}
              <Tooltip
                title={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "diskXfsFragMonitoring",
                      defaultMessage: `### XFS Fragmentation Monitoring

1. The system collects the monitoring data of the XFS fragmentation degree at an interval of 12 hours.
2. We recommend that you set a reasonable alarm threshold duration based on the sampling period.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <Icon type="info" color="neutral" colorNumber={400} />
              </Tooltip>
            </>
          );
        },
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.volume.VolumeXfsFragCount",
            defaultMessage: "Volume (100 GB and Above) Fragmentation Degree (Total Number of Extents)",
          }),
      },
    },
    vip: {
      name: intl.formatMessage({ id: "vip", defaultMessage: "VIP" }),
      auth: {
        type: "block" as const,
        resource: "vip",
        authKey: "vip.alarm",
      },
      VIPInBoundTrafficInBytes: {
        namespace: "ZStack/VIP",
        name: "VIPInBoundTrafficInBytes",
        labelNames: ["VipUUID"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vip.VIPInBoundTrafficInBytes.in.select",
            defaultMessage: "Downstream Traffic",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vip.VIPInBoundTrafficInBytes",
              defaultMessage: "VIP {name} Downstream Traffic",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VIPInBoundTrafficInPackages: {
        namespace: "ZStack/VIP",
        name: "VIPInBoundTrafficInPackages",
        labelNames: ["VipUUID"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vip.VIPInBoundTrafficInPackages.in.select",
            defaultMessage: "Downstream Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vip.VIPInBoundTrafficInPackages",
              defaultMessage: "VIP {name} Downstream Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VIPOutBoundTrafficInBytes: {
        namespace: "ZStack/VIP",
        name: "VIPOutBoundTrafficInBytes",
        labelNames: ["VipUUID"],
        tags: ["range::multiple"],
        unit: "byte/s",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vip.VIPOutBoundTrafficInBytes.in.select",
            defaultMessage: "Upstream Traffic",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vip.VIPOutBoundTrafficInBytes",
              defaultMessage: "VIP {name} Upstream Traffic",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      VIPOutBoundTrafficInPackages: {
        namespace: "ZStack/VIP",
        name: "VIPOutBoundTrafficInPackages",
        labelNames: ["VipUUID"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.vip.VIPOutBoundTrafficInPackages.in.select",
            defaultMessage: "Upstream Network Packets",
          }),
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.vip.VIPOutBoundTrafficInPackages",
              defaultMessage: "VIP {name} Upstream Network Packets",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
    },
    primaryStorage: {
      name: intl.formatMessage({
        id: "primaryStorage",
        defaultMessage: "Data Storage",
      }),
      auth: {
        type: "view" as const,
        resource: "virtualization.data.storage",
        authKey: "list",
      },
      TotalCapacityInBytes: {
        namespace: "ZStack/PrimaryStorage",
        name: "TotalCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalCapacityInBytes.in.select",
            defaultMessage: "Total Capacity",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalCapacityInBytes",
            defaultMessage: "Data Storage Capacity Sum",
          }),
      },
      TotalAvailableCapacityInBytes: {
        namespace: "ZStack/PrimaryStorage",
        name: "TotalAvailableCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalAvailableCapacityInBytes.in.select",
            defaultMessage: "Total Available Capacity",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalAvailableCapacityInBytes",
            defaultMessage: "Data Storage Capacity Allocatable Percent",
          }),
      },
      TotalAvailableCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "TotalAvailableCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalAvailableCapacityInPercent.in.select",
            defaultMessage: "Capacity Available Percent Sum",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalAvailableCapacityInPercent",
            defaultMessage: "Data Storage Capacity Allocatable Percent Sum",
          }),
      },
      TotalUsedCapacityInBytes: {
        namespace: "ZStack/PrimaryStorage",
        name: "TotalUsedCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalUsedCapacityInBytes.in.select",
            defaultMessage: "Capacity Used Sum",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalUsedCapacityInBytes",
            defaultMessage: "Data Storage Capacity Used Sum",
          }),
      },
      TotalUsedCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "TotalUsedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalUsedCapacityInPercent.in.select",
            defaultMessage: "Capacity Percent Used Sum",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalUsedCapacityInPercent",
            defaultMessage: "Data Storage Capacity Percent Used Sum",
          }),
      },
      TotalLockedCapacityInBytes: {
        namespace: "ZStack/PrimaryStorage",
        name: "TotalLockedCapacityInBytes",
        labelNames: [],
        tags: [],
        unit: "byte",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalLockedCapacityInBytes.in.select",
            defaultMessage: "Locked Capacity Sum",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalLockedCapacityInBytes",
            defaultMessage: "Data Storage Locked Capacity Sum",
          }),
      },
      TotalLockedCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "TotalLockedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalLockedCapacityInPercent.in.select",
            defaultMessage: "Capacity Locked Percent Sum",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TotalLockedCapacityInPercent",
            defaultMessage: "Data Storage Capacity Locked Percent Sum",
          }),
      },
      AvailableCapacityInBytes: {
        namespace: "ZStack/PrimaryStorage",
        name: "AvailableCapacityInBytes",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "byte",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.AvailableCapacityInBytes",
              defaultMessage: "Data Storage {name} Allocatable Capacity",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      AvailableCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "AvailableCapacityInPercent",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.AvailableCapacityInPercent",
            defaultMessage: "Data Storage Space Allocatable Percent",
          }),
      },
      UsedCapacityInBytes: {
        namespace: "ZStack/PrimaryStorage",
        name: "UsedCapacityInBytes",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "byte",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.UsedCapacityInBytes",
              defaultMessage: "Data Storage {name} Capacity Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      UsedCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "UsedCapacityInPercent",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.UsedCapacityInPercent",
              defaultMessage: "Data Storage {name} Capacity Percent Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      AvailablePhysicalCapacityInBytes: {
        namespace: "ZStack/PrimaryStorage",
        name: "AvailablePhysicalCapacityInBytes",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "byte",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.AvailablePhysicalCapacityInBytes",
              defaultMessage: "Data Storage {name} Available Physical Capacity",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      AvailablePhysicalCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "AvailablePhysicalCapacityInPercent",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.AvailablePhysicalCapacityInPercent",
              defaultMessage: "Data Storage {name} Physical Capacity Available Percent",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      UsedPhysicalCapacityInBytes: {
        namespace: "ZStack/PrimaryStorage",
        name: "UsedPhysicalCapacityInBytes",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "byte",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.UsedPhysicalCapacityInBytes",
              defaultMessage: "Data Storage {name} Physical Capacity Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      UsedPhysicalCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "UsedPhysicalCapacityInPercent",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.UsedPhysicalCapacityInPercent",
              defaultMessage: "Data Storage {name} Physical Capacity Percent Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      RootVolumeCount: {
        namespace: "ZStack/PrimaryStorage",
        name: "RootVolumeCount",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "count",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.RootVolumeCount",
              defaultMessage: "Data Storage {name} Root Disks",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      DataVolumeCount: {
        namespace: "ZStack/PrimaryStorage",
        name: "DataVolumeCount",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "count",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.DataVolumeCount",
              defaultMessage: "Data Storage {name} Data Disks",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      SnapshotCount: {
        namespace: "ZStack/PrimaryStorage",
        name: "SnapshotCount",
        labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
        tags: ["or", "range::multiple"],
        unit: "count",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.SnapshotCount",
              defaultMessage: "Data Storage {name} Snapshots",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      TimeDurationRequiredForPrimaryStorageForecastUsageExceedingThresholdUsage:
        {
          namespace: "ZStack/PrimaryStorage",
          name: "TimeDurationRequiredForPrimaryStorageForecastUsageExceedingThresholdUsage",
          labelNames: ["PrimaryStorageUuid", "PrimaryStorageType"],
          tags: ["or", "range::multiple"],
          unit: "count",
          displayName: (name: string) =>
            intl.formatMessage(
              {
                id: "metric.name.primaryStorage.TimeDurationRequiredForPrimaryStorageForecastUsageExceedingThresholdUsage",
                defaultMessage: "{name} Predicted Physical Capacity Utilization Exceeds Threshold",
              },
              {
                name: name ? ` ${name} ` : "",
              },
            ),
        },
      PoolAvailableCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "PoolAvailableCapacityInPercent",
        labelNames: ["PoolUuid", "PoolName"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.PoolAvailableCapacityInPercent",
              defaultMessage: "ZCE Distributed Storage Pool Physical Capacity Available Percent",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      PoolUsedCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "PoolUsedCapacityInPercent",
        labelNames: ["PoolUuid", "PoolName"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.primaryStorage.PoolUsedCapacityInPercent",
              defaultMessage: "ZCE Distributed Storage Pool Physical Capacity Percent Used",
            },
            {
              name: name ? ` ${name} ` : "",
            },
          ),
      },
      PoolVirtualAvailableCapacityInPercent: {
        namespace: "ZStack/PrimaryStorage",
        name: "PoolVirtualAvailableCapacityInPercent",
        labelNames: ["PoolUuid", "PoolName"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.PoolVirtualAvailableCapacityInPercent",
            defaultMessage: "ZCE Distributed Storage Pool Virtual Capacity Available Percent",
          }),
      },
      TimeDurationRequiredForCephPoolForecastUsageExceedingThresholdUsage: {
        namespace: "ZStack/PrimaryStorage",
        name: "TimeDurationRequiredForCephPoolForecastUsageExceedingThresholdUsage",
        labelNames: ["PoolUuid", "PoolName"],
        tags: ["or", "range::multiple"],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.primaryStorage.TimeDurationRequiredForCephPoolForecastUsageExceedingThresholdUsage",
            defaultMessage: " Distributed Storage  Pool Predicted Physical Capacity Utilization Exceeds Threshold",
          }),
      },
    },
    loadBalancerListener: {
      name: intl.formatMessage({
        id: "loadbalancerListener",
        defaultMessage: "Listener",
      }),
      auth: {
        type: "block" as const,
        resource: "listener",
        authKey: "listener.alarm",
      },
      LoadBalancerSessionNumber: {
        namespace: "ZStack/LoadBalancer",
        name: "LoadBalancerSessionNumber",
        labelNames: ["ListenerUuid"],
        tags: ["range::multiple"],
        unit: "count",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.loadBalancerListener.LoadBalancerSessionNumber.in.select",
            defaultMessage: "Used Sessions",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.loadBalancerListener.LoadBalancerSessionNumber",
            defaultMessage: "Listener Used Sessions",
          }),
      },
      LoadBalancerSessionUsage: {
        namespace: "ZStack/LoadBalancer",
        name: "LoadBalancerSessionUsage",
        labelNames: ["ListenerUuid"],
        tags: ["range::multiple"],
        unit: "percent",
        selectDisplayName: () =>
          intl.formatMessage({
            id: "metric.name.loadBalancerListener.LoadBalancerSessionUsage.in.select",
            defaultMessage: "Session Percent Used",
          }),
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.loadBalancerListener.LoadBalancerSessionUsage",
            defaultMessage: "Listener Session Percent Used",
          }),
      },
      LoadBalancerBackendStatus: {
        namespace: "ZStack/LoadBalancer",
        name: "LoadBalancerBackendStatus",
        labelNames: ["ListenerUuid", "LoadBalancerUuid", "NicIpAddress"],
        tags: ["range::multiple"],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.loadBalancerListener.LoadBalancerBackendStatus",
            defaultMessage: "No Healthy Backend Server Detected",
          }),
      },
    },
    managementNode: {
      name: intl.formatMessage({
        id: "managementNode",
        defaultMessage: "Management Node",
      }),
      auth: {
        type: "block" as const,
        resource: "common",
        authKey: "management.node.alarm",
      },
      DbFencerIpReachable: {
        namespace: "ZStack/DbFencerIpReachable",
        name: "DbFencerIpReachable",
        labelNames: [],
        tags: ["range::multiple"],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.mn.DbFencerIpReachable",
            defaultMessage: "Monitor IP Unreachable",
          }),
      },
      TimeNeededToSyncDB: {
        namespace: "ZStack/TimeNeededToSyncDB",
        name: "TimeNeededToSyncDB",
        labelNames: [],
        tags: ["range::multiple"],
        unit: "count",
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.mn.TimeNeededToSyncDB",
            defaultMessage: "Dual Management Node Database Needs Synchronization",
          }),
      },
    },
    cdpTask: {
      name: intl.formatMessage({ id: "cdpTask", defaultMessage: "CDP Task" }),
      auth: {
        type: "block" as const,
        resource: "cdp.task",
        authKey: "cdp.task.alarm",
      },
      CdpTaskUsedCapacityInPercent: {
        namespace: "ZStack/CdpTask",
        name: "CdpTaskUsedCapacityInPercent",
        labelNames: [],
        tags: [],
        unit: "percent",
        hideProp: [],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.cdpTask.CdpTaskUsedCapacityInPercent",
            defaultMessage: "Percentage of the Used CDP Capacity to the Planned Capacity",
          }),
      },
      CdpTaskLatency: {
        namespace: "ZStack/CdpTask",
        name: "CdpTaskLatency",
        labelNames: [],
        tags: [],
        unit: "time",
        hideProp: [],
        displayName: () =>
          intl.formatMessage({
            id: "metric.name.cdpTask.CdpTaskLatency",
            defaultMessage: "RPO Latency",
          }),
      },
    },
    scheduler: {
      name: intl.formatMessage({
        id: "scheduler.backup.policy",
        defaultMessage: "Backup Plan",
      }),
      auth: {
        type: "view" as const,
        resource: "virtualization.backup.policy",
        authKey: "list",
      },
      JobGroupFailure: {
        displayName: intl.formatMessage({
          id: "metric.name.scheduler.job.group.failure",
          defaultMessage: "Job Failed",
        }),
        labelNames: [],
        tags: [],
        name: "JobGroupFailure",
        namespace: "ZStack/Scheduler",
      },
    },
    disasterRecoveryStorage: {
      name: intl.formatMessage({
        id: "disaster.recovery.storage",
        defaultMessage: "Backup Storage",
      }),
      auth: {
        type: "block" as const,
        resource: "disaster.recovery.storage",
        authKey: "disaster.recovery.storage.alarm",
      },
      BackupStorageDisconnected: {
        displayName: intl.formatMessage({
          id: "metric.name.disaster.recovery.storage.disconnected",
          defaultMessage: "Backup Storage Disconnected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "BackupStorageDisconnected",
        namespace: "ZStack/DisasterRecoveryStorage",
      },
      BackupStorageConnected: {
        displayName: intl.formatMessage({
          id: "metric.name.disaster.recovery.stroage.connected",
          defaultMessage: "Backup Storage Connected",
        }),
        labelNames: ["Error"],
        tags: ["noLabels"],
        name: "BackupStorageConnected",
        namespace: "ZStack/DisasterRecoveryStorage",
      },
      UsedCapacityInPercent: {
        namespace: "ZStack/DisasterRecoveryStorage",
        name: "UsedCapacityInPercent",
        labelNames: ["BackupStorageUuid", "BackupStorageType"],
        tags: ["or", "range::multiple"],
        unit: "percent",
        displayName: (name: string) =>
          intl.formatMessage(
            {
              id: "metric.name.disasterRecoveryStorage.UsedCapacityInPercent",
              defaultMessage: "Backup Storage {name} Used Capacity (%)",
            },
            {
              name: name ? ` ${name} ` : name,
            },
          ),
      },
    },
    cluster: {
      name: intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" }),
      auth: {
        type: "block" as const,
        resource: "cluster",
        authKey: "cluster.alarm",
      },
    },
  };

  const templateMetricList: any = {
    license: ["LicenseEnabledDays"],
    vm: [
      "DiskAllFreeCapacityInBytes",
      "DiskAllFreeCapacityInPercent",
      "DiskAllUsedCapacityInBytes",
      "DiskAllUsedCapacityInPercent",
      "CPUAverageUsedUtilization",
      "OperatingSystemCPUAverageUsedUtilization",
      "DiskUsedCapacityInBytes",
      "DiskUsedCapacityInPercent",
      "DiskFreeCapacityInPercent",
      "DiskFreeCapacityInBytes",
      "OperatingSystemCPUUsedUtilization",
      "CPUUsedUtilization",
      "CPUIdleUtilization",
      "CPUAllUsedUtilization",
      "CPUAverageUsedUtilization",
      "CPUAllIdleUtilization",
      "DiskReadOps",
      "DiskAllReadOps",
      "DiskWriteOps",
      "DiskAllWriteOps",
      "DiskReadBytes",
      "DiskAllReadBytes",
      "DiskWriteBytes",
      "DiskAllWriteBytes",
      "NetworkInBytes",
      "NetworkAllInBytes",
      "NetworkInPackets",
      "NetworkAllInPackets",
      "NetworkInErrors",
      "NetworkAllInErrors",
      "NetworkOutBytes",
      "NetworkAllOutBytes",
      "NetworkOutPackets",
      "NetworkAllOutPackets",
      "NetworkOutErrors",
      "NetworkAllOutErrors",
      "MemoryFreeBytes",
      "MemoryFreeInPercent",
      "MemoryUsedBytes",
      "OperatingSystemMemoryUsedPercent",
      "MemoryUsedInPercent",
    ],
    baremetalVm: [
      "OperatingSystemCPUUsedUtilization",
      "DiskUsedCapacityInBytes",
      "DiskUsedCapacityInPercent",
      "DiskFreeCapacityInPercent",
      "DiskFreeCapacityInBytes",
      "DiskReadRequestPerSecond",
      "DiskWriteRequestPerSecond",
      "DiskReadBytesPerSecond",
      "DiskWriteBytesPerSecond",
      "OperatingSystemNetworkInBytes",
      "OperatingSystemNetworkInPackets",
      "OperatingSystemNetworkInErrors",
      "OperatingSystemNetworkOutBytes",
      "OperatingSystemNetworkOutPackets",
      "OperatingSystemNetworkOutErrors",
      "OperatingSystemMemoryTotalBytes",
      "OperatingSystemMemoryFreeBytes",
      "OperatingSystemMemoryUsedBytes",
      "OperatingSystemMemoryAvailableBytes",
      "OperatingSystemMemoryFreePercent",
      "OperatingSystemMemoryUsedPercent",
    ],
    vrouter: [
      "CPUUsedUtilization",
      "MemoryUsedInPercent",
      "CPUAverageUsedUtilization",
      "VRouterDiskAllUsedCapacityInPercent",
      "CPUIdleUtilization",
      "CPUAllUsedUtilization",
      "CPUAllIdleUtilization",
      "DiskReadOps",
      "DiskAllReadOps",
      "DiskWriteOps",
      "DiskAllWriteOps",
      "DiskReadBytes",
      "DiskAllReadBytes",
      "DiskWriteBytes",
      "DiskAllWriteBytes",
      "NetworkInBytes",
      "NetworkAllInBytes",
      "NetworkInPackets",
      "NetworkAllInPackets",
      "NetworkInErrors",
      "NetworkAllInErrors",
      "NetworkOutBytes",
      "NetworkAllOutBytes",
      "NetworkOutPackets",
      "NetworkAllOutPackets",
      "NetworkOutErrors",
      "NetworkAllOutErrors",
      "MemoryFreeBytes",
      "MemoryFreeInPercent",
      "MemoryUsedBytes",
      "VRouterDiskAllFreeCapacityInBytes",
      "VRouterDiskAllFreeCapacityInPercent",
      "VRouterDiskAllUsedCapacityInBytes",
      "VRouterDiskAllUsedCapacityInPercent",
      "VRouterDiskFreeCapacityInPercent",
      "VRouterDiskUsedCapacityInBytes",
      "VRouterDiskUsedCapacityInPercent",
      "VRouterDiskFreeCapacityInBytes",
    ],
    backupStorage: [
      "AvailableCapacityInBytes",
      "AvailableCapacityInPercent",
      "UsedCapacityInBytes",
      "UsedCapacityInPercent",
    ],
    host: [
      "DiskRootUsedCapacityInPercent",
      "DiskRootUsedCapacityInBytes",
      "CPUIdleUtilization",
      "CPUAllIdleUtilization",
      "CPUUsedUtilization",
      "CPUAverageUsedUtilization",
      "CPUAllUsedUtilization",
      "MemoryFreeBytes",
      "MemoryFreeInPercent",
      "MemoryUsedBytes",
      "MemoryUsedInPercent",
      "DiskReadOps",
      "DiskAllReadOps",
      "DiskWriteOps",
      "DiskAllWriteOps",
      "DiskReadBytes",
      "DiskAllReadBytes",
      "DiskWriteBytes",
      "DiskAllWriteBytes",
      "NetworkInBytes",
      "NetworkAllInBytes",
      "NetworkInPackets",
      "NetworkAllInPackets",
      "NetworkInErrors",
      "NetworkAllInErrors",
      "NetworkOutBytes",
      "NetworkAllOutBytes",
      "NetworkOutPackets",
      "NetworkAllOutPackets",
      "NetworkOutErrors",
      "NetworkAllOutErrors",
      "NetworkConntrackCount",
      "NetworkConntrackInPercent",
      "PhysicalNetworkInterface",
      "DiskAllFreeCapacityInBytes",
      "DiskAllFreeCapacityInPercent",
      "DiskAllUsedCapacityInBytes",
      "DiskAllUsedCapacityInPercent",
      "DiskCapacityInBytes",
      "DiskFreeCapacityInPercent",
      "DiskUsedCapacityInBytes",
      "DiskUsedCapacityInPercent",
      "DiskXfsFragInPercent",
      "CPUUsedCapacityPerHostCount",
      "CPUUsedCapacityPerHostInPercent",
      "CPUAvailableCapacityPerHostCount",
      "CPUAvailableCapacityPerHostInPercent",
      "CpuTemperature",
      "MemoryUsedCapacityPerHostInBytes",
      "MemoryUsedCapacityPerHostInPercent",
      "MemoryAvailableCapacityPerHostInBytes",
      "MemoryAvailableCapacityPerHostInPercent",
      "SSDLifeLeft",
      "RaidState",
      "PowerSupply",
    ],
    l3network: [
      "AvailableIPCount",
      "AvailableIPInPercent",
      "UsedIPCount",
      "UsedIPInPercent",
    ],
    vip: [
      "VIPInBoundTrafficInBytes",
      "VIPInBoundTrafficInPackages",
      "VIPOutBoundTrafficInBytes",
      "VIPOutBoundTrafficInPackages",
    ],
    primaryStorage: [
      "AvailableCapacityInBytes",
      "AvailableCapacityInPercent",
      "UsedCapacityInBytes",
      "UsedCapacityInPercent",
      "AvailablePhysicalCapacityInBytes",
      "AvailablePhysicalCapacityInPercent",
      "UsedPhysicalCapacityInBytes",
      "UsedPhysicalCapacityInPercent",
      "RootVolumeCount",
      "DataVolumeCount",
      "SnapshotCount",
    ],
    loadBalancerListener: [
      "LoadBalancerSessionNumber",
      "LoadBalancerSessionUsage",
      "LoadBalancerBackendStatus",
    ],
    baremetal2Vm: [
      "OperatingSystemCPUUsedUtilization",
      "OperatingSystemCPUAverageUsedUtilization",
      "DiskUsedCapacityInBytes",
      "DiskUsedCapacityInPercent",
      "DiskFreeCapacityInPercent",
      "DiskFreeCapacityInBytes",
      "DiskReadRequestPerSecond",
      "DiskWriteRequestPerSecond",
      "DiskReadBytesPerSecond",
      "DiskWriteBytesPerSecond",
      "OperatingSystemNetworkInBytes",
      "OperatingSystemNetworkInPackets",
      "OperatingSystemNetworkInErrors",
      "OperatingSystemNetworkOutBytes",
      "OperatingSystemNetworkOutPackets",
      "OperatingSystemNetworkOutErrors",
      "OperatingSystemMemoryTotalBytes",
      "OperatingSystemMemoryFreeBytes",
      "OperatingSystemMemoryUsedBytes",
      "OperatingSystemMemoryAvailableBytes",
      "OperatingSystemMemoryFreePercent",
      "OperatingSystemMemoryUsedPercent",
    ],
  };

  const metricNameGroup: any = {
    vm: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
        list: [
          "CPUUsedUtilization",
          "CPUAverageUsedUtilization",
          "CPUIdleUtilization",
          "CPUAllUsedUtilization",
          "CPUAllIdleUtilization",
          "OperatingSystemCPUUsedUtilization",
        ],
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
        list: [
          "DiskReadOps",
          "DiskAllReadOps",
          "DiskWriteOps",
          "DiskAllWriteOps",
          "DiskReadBytes",
          "DiskAllReadBytes",
          "DiskWriteBytes",
          "DiskAllWriteBytes",
          "DiskAllFreeCapacityInBytes",
          "DiskAllFreeCapacityInPercent",
          "DiskAllUsedCapacityInBytes",
          "DiskAllUsedCapacityInPercent",
          "DiskUsedCapacityInBytes",
          "DiskUsedCapacityInPercent",
          "DiskFreeCapacityInPercent",
          "DiskFreeCapacityInBytes",
        ],
      },
      Network: {
        name: intl.formatMessage({ id: "network", defaultMessage: "Network" }),
        list: [
          "NetworkInBytes",
          "NetworkAllInBytes",
          "NetworkInPackets",
          "NetworkAllInPackets",
          "NetworkInErrors",
          "NetworkAllInErrors",
          "NetworkOutBytes",
          "NetworkAllOutBytes",
          "NetworkOutPackets",
          "NetworkAllOutPackets",
          "NetworkOutErrors",
          "NetworkAllOutErrors",
        ],
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
        list: [
          "MemoryFreeBytes",
          "MemoryFreeInPercent",
          "MemoryUsedBytes",
          "MemoryUsedInPercent",
          "OperatingSystemMemoryUsedPercent",
        ],
      },
      GPU: {
        name: intl.formatMessage({ id: "GPU", defaultMessage: "GPU" }),
        list: ["GpuUtilization", "GpuMemoryUtilization", "GpuTemperature"],
      },
    },
    baremetalVm: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
        list: ["OperatingSystemCPUUsedUtilization"],
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
        list: [
          "DiskReadRequestPerSecond",
          "DiskWriteRequestPerSecond",
          "DiskReadBytesPerSecond",
          "DiskWriteBytesPerSecond",
          "DiskUsedCapacityInBytes",
          "DiskUsedCapacityInPercent",
          "DiskFreeCapacityInPercent",
          "DiskFreeCapacityInBytes",
        ],
      },
      Network: {
        name: intl.formatMessage({ id: "network", defaultMessage: "Network" }),
        list: [
          "OperatingSystemNetworkInBytes",
          "OperatingSystemNetworkInPackets",
          "OperatingSystemNetworkInErrors",
          "OperatingSystemNetworkOutBytes",
          "OperatingSystemNetworkOutPackets",
          "OperatingSystemNetworkOutErrors",
        ],
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
        list: [
          "OperatingSystemMemoryTotalBytes",
          "OperatingSystemMemoryFreeBytes",
          "OperatingSystemMemoryUsedBytes",
          "OperatingSystemMemoryAvailableBytes",
          "OperatingSystemMemoryFreePercent",
          "OperatingSystemMemoryUsedPercent",
        ],
      },
    },
    vrouter: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
        list: [
          "CPUUsedUtilization",
          "CPUIdleUtilization",
          "CPUAllUsedUtilization",
          "CPUAllIdleUtilization",
        ],
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
        list: [
          "DiskReadOps",
          "DiskAllReadOps",
          "DiskWriteOps",
          "DiskAllWriteOps",
          "DiskReadBytes",
          "DiskAllReadBytes",
          "DiskWriteBytes",
          "DiskAllWriteBytes",
          "VRouterDiskAllFreeCapacityInBytes",
          "VRouterDiskAllFreeCapacityInPercent",
          "VRouterDiskAllUsedCapacityInBytes",
          "VRouterDiskAllUsedCapacityInPercent",
          "VRouterDiskFreeCapacityInPercent",
          "VRouterDiskUsedCapacityInBytes",
          "VRouterDiskUsedCapacityInPercent",
          "VRouterDiskFreeCapacityInBytes",
        ],
      },
      Network: {
        name: intl.formatMessage({ id: "network", defaultMessage: "Network" }),
        list: [
          "NetworkInBytes",
          "NetworkAllInBytes",
          "NetworkInPackets",
          "NetworkAllInPackets",
          "NetworkInErrors",
          "NetworkAllInErrors",
          "NetworkOutBytes",
          "NetworkAllOutBytes",
          "NetworkOutPackets",
          "NetworkAllOutPackets",
          "NetworkOutErrors",
          "NetworkAllOutErrors",
        ],
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
        list: [
          "MemoryFreeBytes",
          "MemoryFreeInPercent",
          "MemoryUsedBytes",
          "MemoryUsedInPercent",
        ],
      },
    },
    host: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
        list: [
          "CPUIdleUtilization",
          "CPUAllIdleUtilization",
          "CPUUsedUtilization",
          "CPUAverageUsedUtilization",
          "CPUAllUsedUtilization",
          "CPUUsedCapacityPerHostCount",
          "CPUUsedCapacityPerHostInPercent",
          "CPUAvailableCapacityPerHostCount",
          "CPUAvailableCapacityPerHostInPercent",
          "CpuTemperature",
        ],
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
        list: [
          "MemoryFreeBytes",
          "MemoryFreeInPercent",
          "MemoryUsedBytes",
          "MemoryUsedInPercent",
          "MemoryUsedCapacityPerHostInBytes",
          "MemoryUsedCapacityPerHostInPercent",
          "MemoryAvailableCapacityPerHostInBytes",
          "MemoryAvailableCapacityPerHostInPercent",
        ],
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
        list: [
          "DiskReadOps",
          "DiskAllReadOps",
          "DiskWriteOps",
          "DiskAllWriteOps",
          "DiskReadBytes",
          "DiskAllReadBytes",
          "DiskWriteBytes",
          "DiskAllWriteBytes",
          "DiskAllFreeCapacityInBytes",
          "DiskAllFreeCapacityInPercent",
          "DiskAllUsedCapacityInBytes",
          "DiskAllUsedCapacityInPercent",
          "DiskCapacityInBytes",
          "DiskFreeCapacityInPercent",
          "DiskUsedCapacityInBytes",
          "DiskUsedCapacityInPercent",
          "DiskRootUsedCapacityInPercent",
          "DiskRootUsedCapacityInBytes",
          "DiskXfsFragInPercent",
          "SSDLifeLeft",
        ],
      },
      Raid: {
        name: intl.formatMessage({ id: "raidCard", defaultMessage: "RAID Controller Card" }),
        list: ["RaidState"],
      },
      Network: {
        name: intl.formatMessage({ id: "network", defaultMessage: "Network" }),
        list: [
          "NetworkInBytes",
          "NetworkAllInBytes",
          "NetworkInPackets",
          "NetworkAllInPackets",
          "NetworkInErrors",
          "NetworkAllInErrors",
          "NetworkOutBytes",
          "NetworkAllOutBytes",
          "NetworkOutPackets",
          "NetworkAllOutPackets",
          "NetworkOutErrors",
          "NetworkAllOutErrors",
          "NetworkConntrackCount",
          "NetworkConntrackInPercent",
          "PhysicalNetworkInterface",
        ],
      },
      GPU: {
        name: intl.formatMessage({ id: "GPU", defaultMessage: "GPU" }),
        list: ["GpuUtilization", "GpuMemoryUtilization", "GpuTemperature"],
      },
      vGPU: {
        name: intl.formatMessage({ id: "vGPU", defaultMessage: "vGPU" }),
        list: ["VGpuUtilization", "VGpuMemoryUtilization"],
      },
      Other: {
        name: intl.formatMessage({ id: "other", defaultMessage: "Other" }),
        list: [
          "HostTotal",
          "ConnectedHostCount",
          "ConnectedHostInPercent",
          "DisconnectedHostCount",
          "DisconnectedHostInPercent",
          "PowerSupply",
        ],
      },
    },
    baremetal2Vm: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
        list: [
          "OperatingSystemCPUUsedUtilization",
          "OperatingSystemCPUAverageUsedUtilization",
        ],
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
        list: [
          "DiskReadRequestPerSecond",
          "DiskWriteRequestPerSecond",
          "DiskReadBytesPerSecond",
          "DiskWriteBytesPerSecond",
          "DiskUsedCapacityInBytes",
          "DiskUsedCapacityInPercent",
          "DiskFreeCapacityInPercent",
          "DiskFreeCapacityInBytes",
        ],
      },
      Network: {
        name: intl.formatMessage({ id: "network", defaultMessage: "Network" }),
        list: [
          "OperatingSystemNetworkInBytes",
          "OperatingSystemNetworkInPackets",
          "OperatingSystemNetworkInErrors",
          "OperatingSystemNetworkOutBytes",
          "OperatingSystemNetworkOutPackets",
          "OperatingSystemNetworkOutErrors",
        ],
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
        list: [
          "OperatingSystemMemoryTotalBytes",
          "OperatingSystemMemoryFreeBytes",
          "OperatingSystemMemoryUsedBytes",
          "OperatingSystemMemoryAvailableBytes",
          "OperatingSystemMemoryFreePercent",
          "OperatingSystemMemoryUsedPercent",
        ],
      },
    },
  };

  const metricNameGroupAll: any = {
    vm: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
      },
      Network: {
        name: intl.formatMessage({ id: "netcard", defaultMessage: "NIC" }),
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      },
      GPU: {
        name: intl.formatMessage({ id: "GPU", defaultMessage: "GPU" }),
      },
      vGPU: {
        name: intl.formatMessage({ id: "vGPU", defaultMessage: "vGPU" }),
        list: ["VGpuUtilization", "VGpuMemoryUtilization"],
      },
      Other: {
        name: intl.formatMessage({ id: "other", defaultMessage: "Other" }),
      },
    },
    baremetalVm: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
        list: ["OperatingSystemCPUUsedUtilization"],
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
      },
      Network: {
        name: intl.formatMessage({ id: "netcard", defaultMessage: "NIC" }),
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      },
    },
    baremetal2Vm: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
        list: [
          "OperatingSystemCPUUsedUtilization",
          "OperatingSystemCPUAverageUsedUtilization",
        ],
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
      },
      Network: {
        name: intl.formatMessage({ id: "netcard", defaultMessage: "NIC" }),
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      },
    },
    vrouter: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
      },
      Network: {
        name: intl.formatMessage({ id: "netcard", defaultMessage: "NIC" }),
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
        list: [
          "MemoryFreeBytes",
          "MemoryFreeInPercent",
          "MemoryUsedBytes",
          "MemoryUsedInPercent",
        ],
      },
    },
    host: {
      CPU: {
        name: intl.formatMessage({ id: "cpu", defaultMessage: "CPU" }),
      },
      Memory: {
        name: intl.formatMessage({ id: "memory", defaultMessage: "Memory" }),
      },
      Disk: {
        name: intl.formatMessage({ id: "disk", defaultMessage: "Disk" }),
      },
      Network: {
        name: intl.formatMessage({ id: "netcard", defaultMessage: "NIC" }),
      },
      Raid: {
        name: intl.formatMessage({ id: "raidCard", defaultMessage: "RAID Controller Card" }),
      },
      GPU: {
        name: intl.formatMessage({ id: "GPU", defaultMessage: "GPU" }),
      },
      StorageAdapter: {
        name: intl.formatMessage({
          id: "storage.adapter",
          defaultMessage: "Storage Adapter",
        }),
      },
      Other: {
        name: intl.formatMessage({ id: "other", defaultMessage: "Other" }),
      },
    },
  };

  const translateMetricName = (
    namespace: string,
    metricName: string,
    resourceName = "",
  ) => {
    if (["ZStack/KVMHost", "ZStack/XDragonHost"].includes(namespace)) {
      namespace = "ZStack/Host";
    }

    return (
      resourceAlarmConfig?.[namespaceMap?.[namespace]]?.[
        metricName
      ]?.displayName(resourceName) ?? metricName
    );
  };

  const translateSelectMetricName = (
    namespace: string,
    metricName: string,
    resourceName = "",
  ) => {
    return resourceAlarmConfig?.[namespaceMap?.[namespace]]?.[metricName]
      ?.selectDisplayName
      ? resourceAlarmConfig?.[namespaceMap?.[namespace]]?.[
          metricName
        ]?.selectDisplayName()
      : resourceAlarmConfig?.[namespaceMap?.[namespace]]?.[
          metricName
        ]?.displayName(resourceName);
  };

  const getMetricAuth = (
    namespace: string,
    metricName: string,
    type: "resource" | "event" = "resource",
  ) => {
    const config = type === "resource" ? resourceAlarmConfig : eventAlarmConfig;
    return config?.[namespaceMap?.[namespace]]?.[metricName]?.auth;
  };

  const translateMetricLabels = (
    namespace: string,
    metricName: string,
    threshold: number,
    period: number,
    comparisonOperator: ComparisonOperator,
  ) => {
    let result: string = `${operatorMap[comparisonOperator]}`;
    result += translateThreshold(namespace, metricName, threshold);

    if (!period) return result;
    result += `, ${intl.formatMessage(
      { id: "zwatch.rule.period.translate", defaultMessage: "lasts {time} " },
      {
        time: `${translatePeriod(period)}`,
      },
    )}`;

    return result;
  };

  const translateThreshold = (
    namespace: string,
    metricName: string,
    threshold: number,
  ) => {
    let result = "";
    const metricConfig: any =
      resourceAlarmConfig?.[namespaceMap?.[namespace]]?.[metricName];
    switch (metricConfig?.unit) {
      case "byte":
        result += formatBytesToSize(threshold);
        break;
      case "byte/s":
        // TODO,这里可能有问题,但是原来的写法一定有问题:formatBytesToSize(threshold,'B/s')
        result += formatStorageToObj(Number(threshold), 0, "B/s");
        break;
      case "percent":
        result += `${threshold?.toFixed(0)}%`;
        break;
      case "count":
        result += `${threshold}${
          namespace === "ZStack/License" ||
          ["LoadBalancerBackendStatus"].includes(metricName) ||
          (namespace === "ZStack/PrimaryStorage" &&
            [
              "TimeDurationRequiredForPrimaryStorageForecastUsageExceedingThresholdUsage",
              "TimeDurationRequiredForCephPoolForecastUsageExceedingThresholdUsage",
            ].includes(metricName))
            ? ""
            : intl.formatMessage({ id: "count", defaultMessage: " " })
        }`;
        break;
      case "time":
        result += `${translatePeriod(_floor(Number(threshold) / 1000))}`;
        break;
      case "temperature":
        result += `${threshold} ℃`;
        break;
      default:
        result += `${threshold}`;
        break;
    }
    if (
      namespace === "ZStack/License" ||
      (namespace === "ZStack/PrimaryStorage" &&
        [
          "TimeDurationRequiredForPrimaryStorageForecastUsageExceedingThresholdUsage",
          "TimeDurationRequiredForCephPoolForecastUsageExceedingThresholdUsage",
        ].includes(metricName))
    ) {
      result += intl.formatMessage({ id: "day", defaultMessage: "days" });
    }
    return result;
  };

  const day = intl.formatMessage({
    id: "zwatch.time.day",
    defaultMessage: `days`,
  });
  const hour = intl.formatMessage({
    id: "zwatch.time.hour",
    defaultMessage: `hours`,
  });
  const min = intl.formatMessage({
    id: "zwatch.time.minute",
    defaultMessage: "minutes",
  });
  const s = intl.formatMessage({
    id: "zwatch.time.second",
    defaultMessage: "seconds",
  });

  const timeMap: any = {
    day,
    hour,
    min,
    minute: min,
    s,
    second: s,
  };

  const translatePeriod = (period: number) => {
    let str = "";
    const time: any = secToTime(period);
    _keys(time).forEach((key: string) => {
      if (time[key] > 0) str += `${time[key]}${timeMap[key]}`;
    });
    return str;
  };

  const translateRepeeatInterval = (
    repeatInterval: number,
    repeatCount: any,
  ) => {
    if (repeatInterval === 1 || repeatCount?.unit === "once")
      return intl.formatMessage({
        id: "zwatch.alarm.once",
        defaultMessage: "Only Once",
      });

    const repeat = !repeatCount.unit
      ? translatePeriod(repeatCount)
      : `${repeatCount.number}${timeMap[repeatCount.unit]}`;
    return intl.formatMessage(
      { id: "zwatch.alarm.more.times", defaultMessage: "Every {num}" },
      { num: repeat },
    );
  };

  const translateResourceType = (namespace: string) => {
    if (["ZStack/KVMHost", "ZStack/XDragonHost"].includes(namespace)) {
      namespace = "ZStack/Host";
    }
    return resourceAlarmConfig?.[namespaceMap?.[namespace]]?.name ?? namespace;
  };

  const translateAlarmAuth = (namespace: string) => {
    return (
      resourceAlarmConfig?.[namespaceMap?.[namespace]]?.auth ||
      eventAlarmConfig?.[namespaceMap?.[namespace]]?.auth
    );
  };

  const translateMetricNameGroupType = (
    namespace: string,
    metricGroup: string,
  ) => {
    return metricNameGroup?.[namespaceMap?.[namespace]]?.[metricGroup]?.name;
  };

  const translateMetricNameGroupAllType = (
    namespace: string,
    metricGroup: string,
  ) => {
    return metricNameGroupAll?.[namespaceMap?.[namespace]]?.[metricGroup]?.name;
  };

  const translateEmergencyLevel = (emergencyLevel: EmergencyLevel) => {
    return emergencyLevelMap?.[emergencyLevel] ?? "";
  };

  const translateEventName = (namespace: string, eventName: string) => {
    return (
      eventAlarmConfig?.[namespaceMap?.[namespace]]?.[eventName]?.displayName ??
      eventName
    );
  };

  const translateEventType = (namespace: string) => {
    return eventAlarmConfig?.[namespaceMap?.[namespace]]?.name;
  };

  const translateNamespaceToName = (namespace: string) => {
    return (
      resourceAlarmConfig?.[namespaceMap?.[namespace]]?.name ??
      eventAlarmConfig?.[namespaceMap?.[namespace]]?.name ??
      namespace
    );
  };

  const translateSystemALarmName = (name: string) => {
    return (
      systemALarmNameMap[name] || oneClickAutoGenerateAlarmNameMap[name] || name
    );
  };

  const translateAlarmNameByLocale = (name?: string, zhName?: string) => {
    const locale = getLocaleFromStorage() || "zh-CN";
    return (locale === "zh-CN" ? zhName || name : name) || "";
  };

  const translatePointConfigName = (name: string) => {
    return pointConfigNameMap[name] || name;
  };

  const translateThirdPartyAlarmName = (name: string) => {
    return thirdPartyAlarmNameMap[name] || name;
  };

  let resourceAlarmTemplateList = [
    "vm",
    "baremetalVm",
    "baremetal2Vm",
    "vrouter",
    "backupStorage",
    "host",
    "l3network",
    "vip",
    "primaryStorage",
    "loadBalancerListener",
  ];

  const resourceAlarmResourceList = [
    "vm",
    "baremetalVm",
    "baremetal2Vm",
    "vrouter",
    "image",
    "backupStorage",
    "managementServerDir",
    "host",
    "l3network",
    "volume",
    "vip",
    "loadBalancerListener",
  ];

  let eventAlarmResourceList = [
    "vm",
    "vrouter",
    "backupStorage",
    "host",
    "primaryStorage",
  ];

  const adminRoleList = ["Admin", "PlatformAdmin", "PlatformUser"];

  const currentIdentity = currentUser?.currentIdentity || "";
  if (adminRoleList.indexOf(currentIdentity) === -1) {
    resourceAlarmTemplateList = resourceAlarmTemplateList.filter(
      (item) =>
        [
          "backupStorage",
          "host",
          "primaryStorage",
          "baremetalVm",
          "baremetal2Vm",
        ].indexOf(item) === -1,
    );
    eventAlarmResourceList = eventAlarmResourceList.filter(
      (item) =>
        ["backupStorage", "host", "primaryStorage"].indexOf(item) === -1,
    );
  }
  const formatThreshold = (unit: string, threshold: any) => {
    const result =
      unit.indexOf("byte") > -1
        ? parseNumber(threshold.number, threshold.unit)
        : threshold;
    return parseInt(result, 10);
  };

  const formatTime = (time: any) => {
    // 原生替代 lodash.isNumber: 检查是否为有效的有限数字
    // 如果 time?.number 可能是字符串，需要先转换；如果只接受数字类型，用 typeof 检查
    if (time?.number === "" || !Number.isFinite(Number(time?.number)))
      return null;
    const map: any = {
      s: 1,
      min: 1 * 60,
      hour: 1 * 60 * 60,
      day: 1 * 60 * 60 * 24,
    };
    return time?.unit ? time.number * map[time.unit] : time;
  };

  const periodList = [
    { number: 30, unit: "s" },
    { number: 1, unit: "min" },
    { number: 5, unit: "min" },
    { number: 10, unit: "min" },
    { number: 30, unit: "min" },
    { number: 1, unit: "hour" },
  ];
  const repeatIntervalList = [
    { number: -1, unit: "once" },
    { number: 1, unit: "min" },
    { number: 5, unit: "min" },
    { number: 30, unit: "min" },
    { number: 1, unit: "hour" },
  ];

  const formatEventNameHelp = (eventName: string) => {
    const helpMap: any = {
      VRouterAbnormalFilesExists: intl.formatMessage({
        id: "zwatchAlarm.field.alarmEntry.vpcRouterDisk.tips",
        defaultMessage: `This alarm metric is triggered if a file in the VPC vRouter exceeds the threshold of abnormal file size.`,
      }),
      SlbVmInstanceDisconnected: intl.formatMessage({
        id: "zwatchAlarm.field.alarmEntry.slbVmInstanceDisconnected.tips",
        defaultMessage: `Monitors only dedicated-performance load balancer.`,
      }),
      SlbVmInstanceConnected: intl.formatMessage({
        id: "zwatchAlarm.field.alarmEntry.slbVmInstanceConnected.tips",
        defaultMessage: `Monitors only dedicated-performance load balancer.`,
      }),
      SlbVmInstanceAbnormalFilesExists: intl.formatMessage({
        id: "zwatchAlarm.field.alarmEntry.slbVmInstanceAbnormalFilesExists.tips",
        defaultMessage:
          "The alarm metric is triggered if a file in the LB instance exceeds the threshold of abnormal file size. \nMonitors only dedicated-performance load balancer.",
      }),
      VMInternalIpDuplicate: intl.formatMessage({
        id: "zwatchAlarm.field.alarmEntry.VMInternalIpDuplicate.tips",
        defaultMessage:
          "The metric will be triggered when an IP address configured in the VM has been occupied by the resource on the platform. This metric only monitors NICs on the port group where DHCP service is disabled.",
      }),
      VMInternalIpChanged: intl.formatMessage({
        id: "zwatchAlarm.field.alarmEntry.VMInternalIpChanged.tips",
        defaultMessage:
          "This metric will be triggered when the IP address of the VM's NIC changes. This metric only monitors NICs on the port group where DHCP service is disabled.",
      }),
    };
    return helpMap[eventName];
  };

  const resourceNamespaceList =
    currentUser?.currentIdentity !== "Admin"
      ? ["ZStack/VM", "ZStack/Image", "ZStack/L3Network", "ZStack/BaremetalVM"]
      : [
          "ZStack/License",
          "ZStack/VM",
          "ZStack/Image",
          "ZStack/BackupStorage",
          "ZStack/DisasterRecoveryStorage",
          "ZStack/System",
          "ZStack/Host",
          "ZStack/L3Network",
          "ZStack/PrimaryStorage",
          "ZStack/MN",
          "ZStack/BaremetalVM",
        ];

  const eventNamespaceList =
    currentUser?.currentIdentity !== "Admin"
      ? []
      : [
          "ZStack/VM",
          "ZStack/BackupStorage",
          "ZStack/MN",
          "ZStack/Host",
          "ZStack/PrimaryStorage",
          "ZStack/Scheduler",
          "ZStack/DisasterRecoveryStorage",
          "ZStack/HA",
        ];

  const namespaceList = React.useMemo(
    () =>
      resourceNamespaceList.concat(
        eventNamespaceList.filter(
          (item) => !resourceNamespaceList.includes(item),
        ),
      ),
    [resourceNamespaceList, eventNamespaceList],
  );

  return {
    namespaceList,
    resourceNamespaceList,
    eventNamespaceList,
    systemAlarmUuidList,
    resourceAlarmResourceList,
    eventAlarmResourceList,
    eventAlarmConfig,
    resourceAlarmConfig,
    metricNameGroup,
    namespaceMap,
    translateMetricName,
    translateEventName,
    translateSelectMetricName,
    getMetricAuth,
    translateMetricLabels,
    translateRepeeatInterval,
    translateResourceType,
    translateAlarmAuth,
    translatePointConfigName,
    translateThirdPartyAlarmName,
    translateMetricNameGroupType,
    translateMetricNameGroupAllType,
    translateEventType,
    translateNamespaceToName,
    formatThreshold,
    formatTime,
    timeMap,
    translatePeriod,
    translateThreshold,
    translateEmergencyLevel,
    translateSystemALarmName,
    translateAlarmNameByLocale,
    formatEventNameHelp,
    periodList,
    operatorMap,
    repeatIntervalList,
    templateMetricList,
    resourceAlarmTemplateList,
  };
}

export default useMetricNameConfig;
