import { useLazyQuery } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { Button } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import type { ListItem } from "@zstack/zsphere-components";
import {
  List,
  ResourceName,
  Constant,
  Link,
  useAuth,
} from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import {
  BackupResourceFullBackupType,
  Op,
  VmInstanceState,
  VolumeBackupDataSummaryQueryType,
} from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { BackupData, VmInstance } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import { sum } from "lodash-es";
import React, { useMemo, useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import {
  ProtectedResourceContext,
  StorageProgress,
  VmBindBackUpJob as VmBindBackUpPolicy,
} from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import { getVolumeBackupDataSize as zsvGetVolumeBackupDataSize } from "../../../../../../gql/protected-resource.gql";

import styles from "./style.module.less";

export interface IProps {
  vm?: VmInstance;
  backupData?: BackupData;
}

const BasicInfo: React.FC<IProps> = ({ vm, backupData }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  const { getServerTime } = useTime();
  const { store } = useContext(ProtectedResourceContext);
  const { hasAuth } = useAuth();

  const canBindBackupJob = hasAuth({
    authKey: "virtualization.vm.bind.backup.job",
    resource: "vm",
    type: "action",
  });

  const getSyncStatus = (value?: string) => {
    if (!value) {
      return;
    }
    return value === "Yes"
      ? intl.formatMessage({
          id: "Synced",
          defaultMessage: "Synced",
        })
      : intl.formatMessage({
          id: "unSynced",
          defaultMessage: "Not synced",
        });
  };

  const getBackupType: Record<string, string> = {
    [BackupResourceFullBackupType.Full]: intl.formatMessage({
      id: "full.backup",
      defaultMessage: "Full Backup",
    }),
    [BackupResourceFullBackupType.Incremental]: intl.formatMessage({
      id: "incremental.backup",
      defaultMessage: "Incremental Backup",
    }),
  };

  const [_getVolumeBackupDataSize, { data: zsvVolumeBackupDataSize }] =
    useLazyQuery(zsvGetVolumeBackupDataSize, {
      fetchPolicy: "no-cache",
    });

  useEffect(() => {
    if (store?.type === "vm" && store?.uuid && store?.backupStorageType) {
      _getVolumeBackupDataSize({
        variables: {
          conditions: [
            {
              key: "_VolumeBackupStorageRefReadyStatus_",
              op: Op.eq,
              value:
                store.backupStorageType === "local"
                  ? "__UnknownLocalBackupStorageUuid__"
                  : "__UnknownRemoteBackupStorageUuid__",
            },
          ],
          resourceUuid: store.uuid,
          type: VolumeBackupDataSummaryQueryType.VmInstance,
        },
      });
    }
  }, [
    _getVolumeBackupDataSize,
    store?.type,
    store?.uuid,
    store?.backupStorageType,
  ]);

  const { storageProgressData, size } = useMemo(() => {
    const dataList: {
      color: string;
      value: number;
      description: JSX.Element;
    }[] = [];
    const {
      full = 0,
      incremental = 0,
      incrementalDependency = 0,
    } = zsvVolumeBackupDataSize?.getVolumeBackupDataSize || {};

    const addItem = (color: string, value: number, message: string) => {
      if (value) {
        dataList.push({
          color,
          value,
          description: (
            <span>
              {message}: {formatBytesToSize(value)}
            </span>
          ),
        });
      }
    };

    addItem(
      "var(--info-500)",
      full,
      intl.formatMessage({
        id: "backup.mode.full.data",
        defaultMessage: "Full Data",
      }),
    );

    addItem(
      "var(--positive-500)",
      incremental,
      intl.formatMessage({
        id: "backup.mode.incremental.data",
        defaultMessage: "Incremental Data",
      }),
    );

    addItem(
      "var(--neutral-400)",
      incrementalDependency,
      intl.formatMessage({
        id: "incremental.dependency",
        defaultMessage: "Incremental Dependencies",
      }),
    );

    return {
      storageProgressData: dataList,
      size: {
        full,
        incremental,
        incrementalDependency,
        storageTotalCapacity:
          formatBytesToSize(full + incremental + incrementalDependency) || 0,
      },
    };
  }, [intl, zsvVolumeBackupDataSize?.getVolumeBackupDataSize]);

  const backupStorage = useMemo(
    () =>
      store?.backupStorageType === "local"
        ? backupData?.localBackupStorage
        : backupData?.remoteBackupStorage,
    [store, backupData],
  );

  const list: ListItem[] = useMemo(() => {
    return store?.type === "vm"
      ? [
          {
            label: intl.formatMessage({
              id: "state",
              defaultMessage: "State",
            }),
            value: store?.state && (
              <Constant value={(vm?.state ?? store.state) as any} />
            ),
          },
          {
            label: intl.formatMessage({
              id: "backup.data.totalCapacity",
              defaultMessage: "Total Backup Data Size",
            }),
            icon: "info",
            iconTooltip: (
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backup.data.total.capacity.tooltip",
                  defaultMessage:
                    "### Total Backup Data Size\n\nDisplays the utilization status of resource backup data.\n\n- Full Data: Data generated by full backups.\n- Incremental Data: Data generated by incremental backups.\n- Incremental Dependencies: Dependent data created during incremental backups, which can be cleared to free up capacity after all incremental backups are deleted.\n",
                })}
              </ReactMarkdown>
            ),
            value: storageProgressData.length ? (
              <div className={styles.storageProgressBox}>
                <StorageProgress
                  width={160}
                  height={8}
                  dataSource={storageProgressData}
                />
                <span style={{ marginLeft: 8 }}>
                  {size.storageTotalCapacity}
                </span>
              </div>
            ) : (
              <div className={styles.noData}>
                {intl.formatMessage({
                  id: "backup.totalCapacity.no.data",
                  defaultMessage: "No Data",
                })}
              </div>
            ),
            children: [
              {
                label: intl.formatMessage({
                  id: "backup.mode.full.data",
                  defaultMessage: "Full Data",
                }),
                value: formatBytesToSize(size.full),
              },
              {
                label: intl.formatMessage({
                  id: "backup.mode.incremental.data",
                  defaultMessage: "Incremental Data",
                }),
                value: formatBytesToSize(size.incremental),
              },
              {
                label: intl.formatMessage({
                  id: "incremental.dependency",
                  defaultMessage: "Incremental Dependencies",
                }),
                value: formatBytesToSize(size.incrementalDependency),
              },
            ],
          },
          {
            label: intl.formatMessage({
              id: "backup.policy",
              defaultMessage: "Backup Plan",
            }),
            value: vm?.backupJob?.schedulerJobGroup?.length ? (
              <ResourceName
                value={vm.backupJob.schedulerJobGroup[0].name}
                link={{
                  to: "/backup-management/backup-policy",
                  uuid: vm.backupJob.schedulerJobGroup[0].uuid,
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
                        bind: (
                          <Button
                            disabled={store?.state === "Destroyed"}
                            variant="link"
                            style={{ padding: 0, height: 22 }}
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
              id: "uuid",
              defaultMessage: "UUID",
            }),
            value: <CopyableText>{store?.uuid || ""}</CopyableText>,
          },
        ]
      : [
          {
            label: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
            value: (
              <ResourceName
                value={
                  backupData?.vmInstance?.name ?? backupData?.attachedVmName
                }
                isRouterManaged
                link={
                  backupData?.vmInstance?.uuid
                    ? {
                        to: "/vm",
                        uuid: backupData.vmInstance.uuid,
                        microAppName: "virtualization-resource",
                        leftnav: LeftNavType.ClusterHost,
                        keepState: false,
                      }
                    : undefined
                }
              />
            ),
          },
          {
            label: intl.formatMessage({
              id: "backup.capacity",
              defaultMessage: "Backup Size",
            }),
            value: formatBytesToSize(
              (backupData?.backupDataSize ?? 0) +
                sum(
                  backupData?.dataVolumeBackup?.map(
                    (item) => item.backupDataSize ?? 0,
                  ) ?? [],
                ),
            ),
          },
          {
            label: intl.formatMessage({
              id: "backup.type",
              defaultMessage: "Backup Type",
            }),
            value:
              backupData?.backupType && getBackupType[backupData.backupType],
          },
          {
            label: intl.formatMessage({
              id: "back.up.storage",
              defaultMessage: "Backup Storage",
            }),
            value: (
              <ResourceName
                value={backupStorage?.name || ""}
                link={{
                  to: "/backup-management/disaster-recovery-storage",
                  uuid: backupStorage?.uuid,
                  microAppName: "virtualization-data-protection",
                  keepState: false,
                }}
              />
            ),
          },
          {
            label:
              store?.backupStorageType === "local"
                ? intl.formatMessage({
                    id: "sync.to.remote",
                    defaultMessage: "Sync to Remote",
                  })
                : intl.formatMessage({
                    id: "sync.to.local",
                    defaultMessage: "Sync to Local",
                  }),
            value:
              store?.backupStorageType === "local"
                ? getSyncStatus(backupData?.isRemoteSynced)
                : getSyncStatus(backupData?.isLocalSynced),
          },
          {
            label: intl.formatMessage({
              id: "owner",
              defaultMessage: "Owner",
            }),
            value: (
              <Link.Owner
                uuid={backupData?.owner?.uuid ?? ""}
                type={backupData?.owner?.type}
              >
                {backupData?.owner?.name}
              </Link.Owner>
            ),
          },
          {
            label: intl.formatMessage({
              id: "uuid",
              defaultMessage: "UUID",
            }),
            value: <CopyableText>{backupData?.groupUuid || ""}</CopyableText>,
          },
          {
            label: intl.formatMessage({
              id: "createDate",
              defaultMessage: "Creation Time",
            }),
            value: getServerTime(backupData?.createDate).format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            key: "createDate",
          },
        ];
  }, [backupStorage, intl, size, storageProgressData, store, vm, backupData]);

  return (
    <>
      <DraggableCard
        className={styles.card}
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        extra={
          store?.type === "vm" && store?.state !== VmInstanceState.Destroyed ? (
            <Tooltip
              title={intl.formatMessage({
                id: "read.more",
                defaultMessage: "More",
              })}
            >
              <div>
                <Link.Detail
                  className={styles.link}
                  to="/vm"
                  uuid={backupData?.vmInstance?.uuid}
                  microAppName="virtualization-resource"
                  leftnav={LeftNavType.ClusterHost}
                  keepState={false}
                >
                  <Icon type="external-link" />
                </Link.Detail>
              </div>
            </Tooltip>
          ) : null
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <VmBindBackUpPolicy
        selectedList={vm ? [vm] : []}
        visible={visible}
        setVisible={setVisible}
        view="select"
        position="toolbar"
      />
    </>
  );
};

export default BasicInfo;
