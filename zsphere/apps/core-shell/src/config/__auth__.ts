/**
 * 用于一些组件内无法扫到的 authKey 配置
 * 或者需要额外配置的 authKey 可以在这里添加
 */

export const extraAuth = [
  {
    type: "block",
    resource: "common",
    authKey: "custom.column",
  },
  {
    type: "block",
    resource: "common",
    authKey: "export.to.csv",
  },
  {
    type: "menu",
    resource: "common",
    authKey: "export.to.csv",
  },
];
