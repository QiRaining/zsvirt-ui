// 给扫描脚本扫描用
const authList = [
  {
    auth: {
      type: "action",
      resource: "operation.log",
      authKey: "cancel",
    },
  },
  {
    auth: {
      type: "action",
      resource: "operation.log",
      authKey: "pause",
    },
  },
  {
    auth: {
      type: "action",
      resource: "operation.log",
      authKey: "goingOn",
    },
  },
];

export default authList;
