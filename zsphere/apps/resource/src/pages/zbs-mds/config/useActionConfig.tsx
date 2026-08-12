import { useActionConfig } from "@zstack/zsphere-engine/src/zbs-mds";

export default () => {
  return useActionConfig([
    {
      key: "add.mdsNode",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/add-modal").default,
    },
    {
      key: "change.sshPassword",
      ActionWrapper: require("../action/modify-ssh-password-modal").default,
    },
    {
      key: "delete.mdsNode",
      ActionWrapper: require("../action/delete-modal").default,
    },
    {
      key: "modify.ssh.username",
      ActionWrapper: require("../action/modify-ssh-username-modal").default,
    },
    {
      key: "modify.ssh.port",
      ActionWrapper: require("../action/modify-ssh-port-modal").default,
    },
    {
      key: "modify.ssh.info",
      ActionWrapper: require("../action/modify.ssh.info").default,
    },
  ]);
};
