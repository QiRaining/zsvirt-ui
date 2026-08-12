import type { IntlShape } from "react-intl";

/**
 * 菜单项 i18n 翻译声明
 *
 * 菜单配置（menu/list.json）中的 i18nKey 在运行时由 processI18n 通过
 * intl.formatMessage 动态翻译。但 ui bot 只能从 tsx/ts 源码中静态提取
 * formatMessage({ id: "xxx" }) 调用来生成翻译文件。
 *
 * 本文件将 list.json 中所有菜单 i18nKey 显式声明为 formatMessage 调用，
 * 确保 bot 能提取到完整的菜单翻译 key 集合。
 *
 * 新增菜单项时，需要在此文件中同步添加对应的 formatMessage 声明。
 */
export function translateMenuKeys(intl: IntlShape) {
  return {
    eventZwacthAlarm: intl.formatMessage({
      id: "eventZwacthAlarm",
      defaultMessage: "Event Alarm",
    }),
    "ha.tasks": intl.formatMessage({
      id: "ha.tasks",
      defaultMessage: "HA Task",
    }),
    hostGroup: intl.formatMessage({
      id: "hostGroup",
      defaultMessage: "Host Scheduling Group",
    }),
    "log.collect": intl.formatMessage({
      id: "log.collect",
      defaultMessage: "Log Collection",
    }),
    "mn.monitoring": intl.formatMessage({
      id: "mn.monitoring",
      defaultMessage: "MN Monitoring",
    }),
    "operation.tasks": intl.formatMessage({
      id: "operation.tasks",
      defaultMessage: "Operation Task",
    }),
    platformAlarmMessage: intl.formatMessage({
      id: "platformAlarmMessage",
      defaultMessage: "Platform Alarms",
    }),
    resourceAlarm: intl.formatMessage({
      id: "resourceAlarm",
      defaultMessage: "Resource Alarm",
    }),
    "scheduling.task": intl.formatMessage({
      id: "scheduling.task",
      defaultMessage: "Scheduling Task",
    }),
    storageAlarmMessage: intl.formatMessage({
      id: "storageAlarmMessage",
      defaultMessage: "Storage Alarms",
    }),
    storageZwacthAlarm: intl.formatMessage({
      id: "storageZwacthAlarm",
      defaultMessage: "Storage Alarm",
    }),
    "virtual.directory": intl.formatMessage({
      id: "virtual.directory",
      defaultMessage: "VM Group",
    }),
    "virtualization.accesskey.management": intl.formatMessage({
      id: "virtualization.accesskey.management",
      defaultMessage: "AccessKey Management",
    }),
    "virtualization.account.third.party.auth": intl.formatMessage({
      id: "virtualization.account.third.party.auth",
      defaultMessage: "Single Sign-On",
    }),
    "virtualization.administration": intl.formatMessage({
      id: "virtualization.administration",
      defaultMessage: "System Management",
    }),
    "virtualization.alarm.service": intl.formatMessage({
      id: "virtualization.alarm.service",
      defaultMessage: "Alarm Service",
    }),
    "virtualization.auditing": intl.formatMessage({
      id: "virtualization.auditing",
      defaultMessage: "Event",
    }),
    "virtualization.automation.om": intl.formatMessage({
      id: "virtualization.automation.om",
      defaultMessage: "Automated O&M",
    }),
    "virtualization.backup.management": intl.formatMessage({
      id: "virtualization.backup.management",
      defaultMessage: "Backup Management",
    }),
    "virtualization.backup.policy": intl.formatMessage({
      id: "virtualization.backup.policy",
      defaultMessage: "Backup Plan",
    }),
    "virtualization.backup.storage": intl.formatMessage({
      id: "virtualization.backup.storage",
      defaultMessage: "Image Storage",
    }),
    "virtualization.bare.metal": intl.formatMessage({
      id: "virtualization.bare.metal",
      defaultMessage: "Bare Metal Management",
    }),
    "virtualization.bm.chassis": intl.formatMessage({
      id: "virtualization.bm.chassis",
      defaultMessage: "Bare Metal Chassis",
    }),
    "virtualization.bm.cluster": intl.formatMessage({
      id: "virtualization.bm.cluster",
      defaultMessage: "Bare Metal Cluster",
    }),
    "virtualization.bm.instance": intl.formatMessage({
      id: "virtualization.bm.instance",
      defaultMessage: "Bare Metal Instance",
    }),
    "virtualization.business.reliability": intl.formatMessage({
      id: "virtualization.business.reliability",
      defaultMessage: "Business Reliability",
    }),
    "virtualization.certificate.management": intl.formatMessage({
      id: "virtualization.certificate.management",
      defaultMessage: "SSL Certificate",
    }),
    "virtualization.cluster": intl.formatMessage({
      id: "virtualization.cluster",
      defaultMessage: "Cluster",
    }),
    "virtualization.console.proxy": intl.formatMessage({
      id: "virtualization.console.proxy",
      defaultMessage: "Console Proxy",
    }),
    "virtualization.custom.config.baremetal.template": intl.formatMessage({
      id: "virtualization.custom.config.baremetal.template",
      defaultMessage: "Bare Metal Template",
    }),
    "virtualization.dashboard": intl.formatMessage({
      id: "virtualization.dashboard",
      defaultMessage: "Dashboard",
    }),
    "virtualization.data.protection": intl.formatMessage({
      id: "virtualization.data.protection",
      defaultMessage: "Data Protection",
    }),
    "virtualization.data.storage": intl.formatMessage({
      id: "virtualization.data.storage",
      defaultMessage: "Data Storage",
    }),
    "virtualization.disaster.recovery.storage": intl.formatMessage({
      id: "virtualization.disaster.recovery.storage",
      defaultMessage: "Backup Storage",
    }),
    "virtualization.disaster.recovery.service.management": intl.formatMessage({
      id: "virtualization.disaster.recovery.service.management",
      defaultMessage: "Disaster Recovery Service",
    }),
    "virtualization.disaster.recovery.service.deployment": intl.formatMessage({
      id: "virtualization.disaster.recovery.service.deployment",
      defaultMessage: "Service Deployment",
    }),
    "virtualization.dynamic.resource.dispatch.strategy": intl.formatMessage({
      id: "virtualization.dynamic.resource.dispatch.strategy",
      defaultMessage: "DRS Policy",
    }),
    "virtualization.email.server": intl.formatMessage({
      id: "virtualization.email.server",
      defaultMessage: "Email Server",
    }),
    "virtualization.ha.strategic": intl.formatMessage({
      id: "virtualization.ha.strategic",
      defaultMessage: "HA Policy",
    }),
    "virtualization.host": intl.formatMessage({
      id: "virtualization.host",
      defaultMessage: "Host",
    }),
    "virtualization.host.vm": intl.formatMessage({
      id: "virtualization.host.vm",
      defaultMessage: "VM and Host",
    }),
    "virtualization.identity.and.accessManagement": intl.formatMessage({
      id: "virtualization.identity.and.accessManagement",
      defaultMessage: "IAM",
    }),
    "virtualization.image": intl.formatMessage({
      id: "virtualization.image",
      defaultMessage: "Image",
    }),
    "virtualization.image.storage.and.template": intl.formatMessage({
      id: "virtualization.image.storage.and.template",
      defaultMessage: "Image  and Template",
    }),
    "virtualization.ip-blocklist.allowlist": intl.formatMessage({
      id: "virtualization.ip-blocklist.allowlist",
      defaultMessage: "IP Allowlist/Blocklist",
    }),
    "virtualization.l2.network": intl.formatMessage({
      id: "virtualization.l2.network",
      defaultMessage: "Distributed Switch",
    }),
    "virtualization.l3.network": intl.formatMessage({
      id: "virtualization.l3.network",
      defaultMessage: "Distributed Port Group",
    }),
    "virtualization.log.server": intl.formatMessage({
      id: "virtualization.log.server",
      defaultMessage: "Log Server",
    }),
    "virtualization.telemetry": intl.formatMessage({
      id: "virtualization.telemetry",
      defaultMessage: "Experience Improvement Program",
    }),
    "virtualization.login.policy": intl.formatMessage({
      id: "virtualization.login.policy",
      defaultMessage: "Security Settings",
    }),
    "virtualization.menu.alarm": intl.formatMessage({
      id: "virtualization.menu.alarm",
      defaultMessage: "Alarm",
    }),
    "virtualization.menu.alarm-message": intl.formatMessage({
      id: "virtualization.menu.alarm-message",
      defaultMessage: "Alarm Message",
    }),
    "virtualization.menu.license": intl.formatMessage({
      id: "virtualization.menu.license",
      defaultMessage: "Licenses",
    }),
    "virtualization.menu.license.management": intl.formatMessage({
      id: "virtualization.menu.license.management",
      defaultMessage: "License Management",
    }),
    "virtualization.migration.management": intl.formatMessage({
      id: "virtualization.migration.management",
      defaultMessage: "Migration Management",
    }),
    "virtualization.migration.service": intl.formatMessage({
      id: "virtualization.migration.service",
      defaultMessage: "Migration Service",
    }),
    "virtualization.monitor.template": intl.formatMessage({
      id: "virtualization.monitor.template",
      defaultMessage: "Message Template",
    }),
    "virtualization.monitoring.om": intl.formatMessage({
      id: "virtualization.monitoring.om",
      defaultMessage: "O&M Management",
    }),
    "virtualization.network.resource": intl.formatMessage({
      id: "virtualization.network.resource",
      defaultMessage: "Network Resource",
    }),
    "virtualization.nofity.object": intl.formatMessage({
      id: "virtualization.nofity.object",
      defaultMessage: "Endpoint",
    }),
    "virtualization.platform.database": intl.formatMessage({
      id: "virtualization.platform.database",
      defaultMessage: "Platform Database",
    }),
    "virtualization.platform.reliability": intl.formatMessage({
      id: "virtualization.platform.reliability",
      defaultMessage: "Platform Reliability",
    }),
    "virtualization.platform.security": intl.formatMessage({
      id: "virtualization.platform.security",
      defaultMessage: "Platform Security",
    }),
    "virtualization.platform.setting": intl.formatMessage({
      id: "virtualization.platform.setting",
      defaultMessage: "Platform Management",
    }),
    "virtualization.primary-storage": intl.formatMessage({
      id: "virtualization.primary-storage",
      defaultMessage: "Data Storage",
    }),
    "virtualization.protected.resource.title": intl.formatMessage({
      id: "virtualization.protected.resource.title",
      defaultMessage: "Protected Resources",
    }),
    "virtualization.reliability.service": intl.formatMessage({
      id: "virtualization.reliability.service",
      defaultMessage: "Reliability",
    }),
    "virtualization.resource": intl.formatMessage({
      id: "virtualization.resource",
      defaultMessage: "Inventory",
    }),
    "virtualization.resource.attribute": intl.formatMessage({
      id: "virtualization.resource.attribute",
      defaultMessage: "Custom Attribute",
    }),
    "virtualization.role": intl.formatMessage({
      id: "virtualization.role",
      defaultMessage: "Role",
    }),
    "virtualization.root.node": intl.formatMessage({
      id: "virtualization.root.node",
      defaultMessage: "Root Node",
    }),
    "virtualization.script.library": intl.formatMessage({
      id: "virtualization.script.library",
      defaultMessage: "Script Library",
    }),
    "virtualization.security.group": intl.formatMessage({
      id: "virtualization.security.group",
      defaultMessage: "Security Group",
    }),
    "virtualization.snapshot": intl.formatMessage({
      id: "virtualization.snapshot",
      defaultMessage: "Snapshot",
    }),
    "virtualization.snapshot.management": intl.formatMessage({
      id: "virtualization.snapshot.management",
      defaultMessage: "Snapshot Management",
    }),
    "virtualization.snapshot.strategy": intl.formatMessage({
      id: "virtualization.snapshot.strategy",
      defaultMessage: "Snapshot Policy",
    }),
    "virtualization.snmp.management": intl.formatMessage({
      id: "virtualization.snmp.management",
      defaultMessage: "SNMP Management",
    }),
    "virtualization.system.parameter": intl.formatMessage({
      id: "virtualization.system.parameter",
      defaultMessage: "System Parameters",
    }),
    "virtualization.tag": intl.formatMessage({
      id: "virtualization.tag",
      defaultMessage: "Tag",
    }),
    "virtualization.tag.and.attribute": intl.formatMessage({
      id: "virtualization.tag.and.attribute",
      defaultMessage: "Tag and Attribute",
    }),
    "virtualization.task": intl.formatMessage({
      id: "virtualization.task",
      defaultMessage: "Task",
    }),
    "virtualization.task.and.event": intl.formatMessage({
      id: "virtualization.task.and.event",
      defaultMessage: "Task and Event",
    }),
    "virtualization.time.server": intl.formatMessage({
      id: "virtualization.time.server",
      defaultMessage: "Time Configuration",
    }),
    "virtualization.user": intl.formatMessage({
      id: "virtualization.user",
      defaultMessage: "User",
    }),
    "virtualization.user.management": intl.formatMessage({
      id: "virtualization.user.management",
      defaultMessage: "User Management",
    }),
    "virtualization.userGroup": intl.formatMessage({
      id: "virtualization.userGroup",
      defaultMessage: "User Group",
    }),
    "virtualization.virtualMachine.scheduling.rule": intl.formatMessage({
      id: "virtualization.virtualMachine.scheduling.rule",
      defaultMessage: "VM Scheduling Policy",
    }),
    "virtualization.vm": intl.formatMessage({
      id: "virtualization.vm",
      defaultMessage: "Virtual Machine",
    }),
    "virtualization.vm.scheduling.rule": intl.formatMessage({
      id: "virtualization.vm.scheduling.rule",
      defaultMessage: "VM Scheduling Policy",
    }),
    "virtualization.vm.template": intl.formatMessage({
      id: "virtualization.vm.template",
      defaultMessage: "Virtual Machine Template",
    }),
    "virtualization.wizard": intl.formatMessage({
      id: "virtualization.wizard",
      defaultMessage: "Wizard",
    }),
    "virtualization.xml.hook": intl.formatMessage({
      id: "virtualization.xml.hook",
      defaultMessage: "XML Hook",
    }),
    "virtualization.zmigrate.resource": intl.formatMessage({
      id: "virtualization.zmigrate.resource",
      defaultMessage: "Migration Resource",
    }),
    "virtualization.zmigrate.task": intl.formatMessage({
      id: "virtualization.zmigrate.task",
      defaultMessage: "Migration Task",
    }),
    "virtualization.zone": intl.formatMessage({
      id: "virtualization.zone",
      defaultMessage: "Data Center",
    }),
    "vm.spec": intl.formatMessage({
      id: "vm.spec",
      defaultMessage: "VM Specifications",
    }),
    vmGroup: intl.formatMessage({
      id: "vmGroup",
      defaultMessage: "VM Scheduling Group",
    }),
  };
}
