import type { RoleFilterConfig } from "./types";

// 仅管理员可访问的资源类型
export const ADMIN_ONLY_RESOURCE_TYPES: readonly string[] = [
  "wizard",
  "local.backup.data.db",
  "zsv.role",
  "zsv.user.group",
  "account.information",
  "account.third.party.auth",
  "license.management",
  "ha.strategic",
  "system.parameter",
  "log.server",
  "login.policy",
  "https.certificate",
  "access.control.rule",
  "console.proxy",
  "host.group",
  "dynamic.resource.ispatch.strategy",
  "snmp",
  "vm.dir.group",
  "time.server",
  "mn.monitoring",
  "global.config",
  "baremetal.cluster",
  "baremetal.chassis",
  "baremetal.instance",
  "pre.config.template",
];

// 存在 cloud 和 zsv action 混用的资源类型
export const VIRTUALIZATION_RESOURCE_TYPES: readonly string[] = ["vm"];

// 非预定义角色的过滤配置
export const NON_SOD_FILTER_CONFIG: RoleFilterConfig = {
  // 这部分资源只放开部分操作
  allowedActions: {
    zone: ["virtualization.create.instance.group"],
    cluster: ["create.instance.group", "create.l3Network"],
    host: ["create.instance"],
    "backup.storage": ["add.image"],
  },
  // 过滤掉的action，仅管理员可用
  filteredActionKeys: [
    "primary.storage",
    "host",
    "zone",
    "cluster",
    "backup.storage",
    "root.node",
    "zsv.backup.storage",
    "kms.provider",
  ],
  // 角色配置树需要过滤的菜单（仅管理员可用）
  filteredMenuKeys: [
    "wizard", // 向导
    "identity.and.accessManagement", // 身份与访问管理所有子Menu
    "security.setting", // 平台安全所有子Menu
    "menu.license.management", // 许可管理所有子Menu
    "log.server", // 日志服务器
    "system.parameter", // 系统参数
    "console.proxy", // 控制台代理
    "snmp", // SNMP管理
    "dynamic.resource.ispatch.strategy", // 动态资源调度策略
    "host.group", // 虚拟机调度策略下面的主机调度组
    "ha.strategic", // 高可用策略
    "auto.scaling", // 弹性伸缩组
    "monitoring.center", // 监控
    "mn.monitoring", // 管理节点监控
    "local.backup.data.db", // 已保护资源平台数据库
    "vm.dir.group",
    "time.server",
    "baremetal.cluster",
    "baremetal.chassis",
    "baremetal.instance",
    "pre.config.template",
    "automation.om", // 自动化运维（脚本库、XML Hook）,
    "kms.provider",
  ],
};
