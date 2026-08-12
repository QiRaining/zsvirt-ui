import { Tooltip } from "@zstack/design";
import { Button } from "@zstack/design";
import type { ListItem } from "@zstack/zsphere-components";
import {
  Constant,
  List,
  ResourceName,
  useAuth,
} from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { VmBindBackUpJob } from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import styles from "./style.module.less";

const STYLE_BUTTON_LINK = { padding: 0, height: 22 } as const;

interface IProps {
  current: any;
  refetch?: () => void;
}

const BackupPolicyCard: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);
  const { hasAuth } = useAuth();
  const hasBackupPolicy = !!current?.currentBackupPolicy.uuid;
  const canBindBackupJob = hasAuth({
    authKey: "virtualization.vm.bind.backup.job",
    resource: "vm",
    type: "action",
  });
  const isVhostPs = useMemo(
    () => current?.primaryStorage?.defaultProtocol === "Vhost",
    [current],
  );

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "backup.policy",
          defaultMessage: "Backup Plan",
        }),
        value: hasBackupPolicy ? (
          <ResourceName
            value={current?.currentBackupPolicy?.name || ""}
            link={{
              to: "/backup-management/backup-policy",
              uuid: current?.currentBackupPolicy?.uuid,
              microAppName: "virtualization-data-protection",
              keepState: false,
            }}
          />
        ) : (
          <span className={styles["text-neutral-500"]}>
            {canBindBackupJob
              ? intl.formatMessage(
                  {
                    id: "backup.policy.not.bound",
                    defaultMessage: "No associated backup plan. {bind}",
                  },
                  {
                    bind: isVhostPs ? (
                      <Tooltip
                        title={intl.formatMessage({
                          id: "vhost.ps.not.support.bind.backup.policy",
                          defaultMessage: "You cannot associate a back plan with this VM, because the VM disks are stored on ZHPS distributed storage.",
                        })}
                      >
                        <span>
                          <Button
                            variant="link"
                            disabled
                            style={STYLE_BUTTON_LINK}
                            onClick={() => setVisible(true)}
                          >
                            {intl.formatMessage({
                              id: "go.bind",
                              defaultMessage: " Associate",
                            })}
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <Button
                        variant="link"
                        style={STYLE_BUTTON_LINK}
                        onClick={() => setVisible(true)}
                      >
                        {intl.formatMessage({
                          id: "go.bind",
                          defaultMessage: " Associate",
                        })}
                      </Button>
                    ),
                  },
                )
              : intl.formatMessage({
                  id: "backup.policy.not.bound.readonly",
                  defaultMessage: "No Backup Plan Associated",
                })}
          </span>
        ),
      },
      {
        label: intl.formatMessage({
          id: "state",
          defaultMessage: "State",
        }),
        value: hasBackupPolicy ? (
          <Constant value={current?.currentBackupPolicy?.state as any} />
        ) : (
          <span className={styles["text-neutral-500"]}>-</span>
        ),
      },
    ],
    [current, isVhostPs, hasBackupPolicy, intl],
  );

  const memoizedSelectedList = useMemo(() => [current as IVM], [current]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "backup.policy.card.title",
          defaultMessage: "Backup Plan",
        })}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <VmBindBackUpJob
        source={current}
        selectedList={memoizedSelectedList}
        visible={visible}
        setVisible={setVisible}
        refetch={refetch}
        view="select"
        position="toolbar"
      />
    </>
  );
};

export default BackupPolicyCard;
