import type { IConfig } from "./type";

const config: IConfig[] = [
  {
    // 打开全局搜索
    command: "activate.global.search",
    key: "accel+k",
  },
  {
    // 移动搜索选项
    command: "move.global.search.selected.item",
    key: ["up", "down"],
  },
  {
    // 切换搜索类型
    command: "switch.global.search.result.type",
    key: "tab",
  },
  {
    // 选中搜索结果
    command: "select.global.search.result",
    key: "enter",
  },
  {
    // 退出全局搜索
    command: "exit.global.search",
    key: "esc",
  },
  {
    // 切换底部窗口展开收起
    command: "expand.collapse.footer.panel",
    key: "accel+.",
  },
  {
    // 切换左侧导航树展开收起
    command: "expand.collapse.left.nav.tree",
    key: "accel+/",
  },
  {
    // 跳转报警消息列表页
    command: "view.alarm.message",
    key: "shift+m",
  },
  {
    // 跳转主页
    command: "navigate.virtualization.dashboard",
    key: "ctrl+alt+1",
  },
  {
    // 跳转资源清单
    command: "navigate.virtualization.resource",
    key: "ctrl+alt+2",
  },
  {
    // 跳转业务可靠
    command: "navigate.virtualization.reliability",
    key: "ctrl+alt+3",
  },
  {
    // 跳转数据保护
    command: "navigate.virtualization.data.protection",
    key: "ctrl+alt+4",
  },
  {
    // 跳转运维管理
    command: "navigate.virtualization.monitoring.om",
    key: "ctrl+alt+5",
  },
  {
    // 跳转系统管理
    command: "navigate.virtualization.administration",
    key: "ctrl+alt+6",
  },
  {
    // 跳转资源清单各资源类型
    command: "navigate.virtualization.resource.submenu",
    key: {
      "virtualization.cluster.host": "shift+1",
      "virtualization.template.vm": "shift+2",
      "virtualization.data.storage": "shift+3",
      "virtualization.network": "shift+4",
      "virtualization.bare.metal": "shift+5",
    },
  },
  // 跳转回收站
  {
    command: "navigate.recycle",
    key: "shift+r",
  },
];

export default config;
