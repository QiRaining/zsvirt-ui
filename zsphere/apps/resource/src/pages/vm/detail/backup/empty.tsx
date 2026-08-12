import { Button, Tooltip } from "@zstack/design";
import { Empty, useAuth } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";
import {
  VmBindBackUpJob,
  CreateBackupData,
} from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import styles from "./style.module.less";

interface IProps {
  current: IVM;
  zsvBackupDataRrefetch?: Function;
  zsvSchedulerJobGroupRrefetch?: Function;
}

const BackupEmpty: FC<IProps> = ({
  current,
  _zsvBackupDataRrefetch,
  zsvSchedulerJobGroupRrefetch,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const canBindBackupJob = hasAuth({
    authKey: "virtualization.vm.bind.backup.job",
    resource: "vm",
    type: "action",
  });
  const canCreateBackup = hasAuth({
    authKey: "virtualization.create.backup.vm",
    resource: "vm",
    type: "action",
  });

  const isVhostPs: boolean = useMemo(
    () => current?.primaryStorage?.defaultProtocol === "Vhost",
    [current],
  );

  const tooltip = useMemo(() => {
    if (isVhostPs) {
      return intl.formatMessage({
        id: "vhost.ps.not.support.bind.backup",
        defaultMessage: "You cannot associate a back plan with this VM, because the VM disks are stored on ZHPS distributed storage.",
      });
    }
    return;
  }, [intl, isVhostPs]);

  // 两action
  const [bindBackupPolicyVisable, setBindBackupPolicyVisable] =
    useState<boolean>(false);
  const [createBackupVisable, setCreateBackupVisable] =
    useState<boolean>(false);

  const memoizedSelectedList = useMemo(() => [current as IVM], [current]);

  return (
    <>
      <Empty className={styles.empty}>
        <Tooltip title={tooltip}>
          <div className={styles.emptyContent}>
            {canBindBackupJob && (
              <Button
                variant="link"
                disabled={isVhostPs}
                onClick={() => setBindBackupPolicyVisable(true)}
              >
                {intl.formatMessage({
                  id: "bind.backup.policy",
                  defaultMessage: "Associate Backup Plan",
                })}
              </Button>
            )}
            {canCreateBackup && (
              <Button
                variant="link"
                disabled={isVhostPs}
                onClick={() => setCreateBackupVisable(true)}
              >
                {intl.formatMessage({
                  id: "create.backup",
                  defaultMessage: "Create Backup",
                })}
              </Button>
            )}
          </div>
        </Tooltip>
      </Empty>
      <CreateBackupData
        source={current}
        selectedList={memoizedSelectedList}
        visible={createBackupVisable}
        setVisible={setCreateBackupVisable}
        view="select"
        position="toolbar"
      />
      <VmBindBackUpJob
        source={current}
        selectedList={memoizedSelectedList}
        visible={bindBackupPolicyVisable}
        setVisible={setBindBackupPolicyVisable}
        view="select"
        position="toolbar"
        refetch={zsvSchedulerJobGroupRrefetch}
      />
    </>
  );
};

export default BackupEmpty;
