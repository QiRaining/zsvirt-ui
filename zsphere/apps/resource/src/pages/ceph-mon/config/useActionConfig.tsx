import ModifyConfigModal from "@zstack/virtualization-resource/src/pages/backup-storage/action/modify-config";
import { useActionConfig } from "@zstack/zsphere-engine/src/ceph-mon";
import type {
  BackupStorage as IBackupStorage,
  CephMon as ICephMon,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import { verifySingle } from "../action/validator";

export default () => {
  return useActionConfig<ICephMon>([
    // 主存储
    {
      autoInjectPreValidator: false,
      key: "primary.storage.add.ceph.mon",
      ActionWrapper: require("../action/add-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "primary.storage.modify.ssh.username",
      ActionWrapper: require("../action/modify-ssh-username-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "primary.storage.modify.ssh.password",
      ActionWrapper: require("../action/modify-ssh-password-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "primary.storage.modify.ssh.port",
      ActionWrapper: require("../action/modify-ssh-port-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "primary.storage.modify.mon.port",
      ActionWrapper: require("../action/modify-mon-port-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "primary.storage.delete.ceph.mon",
      ActionWrapper: require("../action/delete-modal").default,
    },
    // 镜像服务器
    {
      autoInjectPreValidator: false,
      key: "backup.storage.add.ceph.mon",
      ActionWrapper: require("../action/add-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "backup.storage.modify.ssh.username",
      ActionWrapper: require("../action/modify-ssh-username-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "backup.storage.modify.ssh.password",
      ActionWrapper: require("../action/modify-ssh-password-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "backup.storage.modify.ssh.port",
      ActionWrapper: require("../action/modify-ssh-port-modal").default,
    },
    {
      preValidators: [verifySingle],
      key: "backup.storage.modify.mon.port",
      ActionWrapper: require("../action/modify-mon-port-modal").default,
    },
    {
      key: "backup.storage.delete.ceph.mon",
      ActionWrapper: require("../action/delete-modal").default,
    },
    // zsv 镜像存储-详情页-监控节点
    {
      key: "modify.config",
      autoInjectPreValidator: false,
      ActionWrapper: ({ source, visible, setVisible }) => {
        const memoizedSelectedList = useMemo(
          () => [source as IBackupStorage],
          [source],
        );
        return (
          <ModifyConfigModal
            selectedList={memoizedSelectedList}
            visible={visible}
            setVisible={setVisible}
          />
        );
      },
    },
  ]);
};
