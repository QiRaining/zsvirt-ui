import { gql, useLazyQuery } from "@apollo/client";
import { Alert } from "@zstack/design";
import { Action } from "@zstack/zsphere-components";
import type { IPosition } from "@zstack/zsphere-components/lib/action/type";
import type { IQuery } from "@zstack/zsphere-types";
import { BackupResourceType, Op } from "@zstack/zsphere-types";
import { bus } from "@zstack/zsphere-utils";
import type { FC } from "react";
import { useContext, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { ProtectedResourceContext } from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import { backupDataList } from "../../../../../gql/protected-resource.gql";
import { useActionConfig, useVmActionConfig } from "./config";
import BackupDatalist from "./list";
import BasicInfo from "./overview/basic-info";

import styles from "./style.module.less";

const queryVmInstance = gql`
  query vmInstance($uuid: String!) {
    vmInstance(uuid: $uuid) {
      uuid
      name
      state
      zoneUuid
      rootVolumeUuid
      haveScsiLun
      attachedShareableVolumeUuidList
      backupTaskType
      primaryStorage {
        uuid
        defaultProtocol
      }
      backupJob {
        uuid
        jobData
        state
        schedulerJobGroupJobRefs {
          schedulerJobGroupUuid
          priority
        }
        schedulerJobGroup {
          uuid
          name
        }
      }
    }
  }
`;

interface IProps {
  onClickName?: (value: any) => void;
}

const BackupDataDetails: FC<IProps> = ({ onClickName }) => {
  const intl = useIntl();
  const { store } = useContext(ProtectedResourceContext);

  const [queryVm, { data: vmInstanceListResult, refetch: refetchVm }] =
    useLazyQuery(queryVmInstance);
  const [
    queryBackupData,
    { data: backupDataResult, refetch: refetchBackupData },
  ] = useLazyQuery(backupDataList);

  const vm = vmInstanceListResult?.vmInstance;
  const backupData = backupDataResult?.backupDataList?.list?.[0];

  useEffect(() => {
    if (store?.uuid) {
      if (store?.type === "vm") {
        queryVm({
          variables: { uuid: store.uuid },
        });
      } else if (store?.type === "backupData") {
        queryBackupData({
          variables: {
            conditions: [{ key: "uuid", op: Op.eq, value: store.uuid }],
          },
        });
      }
    }
  }, [store?.uuid, store?.type, queryVm, queryBackupData]);

  useEffect(() => {
    if (store?.type) {
      const listener =
        store.type === "vm"
          ? () =>
              refetchVm?.({
                variables: { uuid: store.uuid },
              })
          : () =>
              refetchBackupData?.({
                variables: {
                  conditions: [{ key: "uuid", op: Op.eq, value: store.uuid }],
                },
              });
      const resourceType = store.type === "vm" ? "VmInstance" : "BackupData";
      bus.addListener(`action:refetch:${resourceType}`, listener);
      return () =>
        bus.removeListener(`action:refetch:${resourceType}`, listener);
    }
  }, [queryBackupData, queryVm, store?.type, store?.uuid]);

  const defaultQuery: IQuery | undefined = useMemo(() => {
    if (store?.type) {
      return store.type === "vm"
        ? {
            conditions: [
              {
                key: "status",
                op: Op.eq,
                value: "Ready",
              },
              {
                key: "_VolumeBackupStorageRefReadyStatus_",
                op: Op.eq,
                value:
                  store?.backupStorageType === "local"
                    ? "__UnknownLocalBackupStorageUuid__"
                    : "__UnknownRemoteBackupStorageUuid__",
              },
              {
                key: "vmInstanceUuid",
                op: Op.eq,
                value: store?.uuid ?? "",
              },
            ],
          }
        : {
            type: BackupResourceType.Group,
            conditions: [
              {
                key: "groupUuid",
                op: Op.eq,
                value: backupData?.groupUuid ?? "",
              },
              {
                key: "status",
                op: Op.eq,
                value: "Ready",
              },
              {
                key: "_VolumeBackupStorageRefReadyStatus_",
                op: Op.eq,
                value:
                  store?.backupStorageType === "local"
                    ? "__UnknownLocalBackupStorageUuid__"
                    : "__UnknownRemoteBackupStorageUuid__",
              },
            ],
          };
    }
  }, [store, backupData]);

  const useRenderAction = () => {
    const { list, viewMap } = useActionConfig();
    const { list: vmList, viewMap: vmViewMap } = useVmActionConfig();

    let view = "sub.virtualization.protectedResource";

    if (store?.backupStorageType === "local" && store?.type === "backupData") {
      view = "main.local";
    } else if (
      store?.backupStorageType === "remote" &&
      store?.type === "backupData"
    ) {
      view = "main.remote";
    }

    let selectedList: any[] = [];
    if (store?.type === "vm" && vm) {
      selectedList = [vm];
    } else if (store?.type === "backupData" && backupData) {
      selectedList = [backupData];
    }

    const actionProps = {
      view,
      menuList: store?.type === "vm" ? vmList : list,
      viewMap: store?.type === "vm" ? vmViewMap : viewMap,
      position: "header" as IPosition,
      selectedList,
    };

    return <Action key={view} {...actionProps} />;
  };

  const renderDetailTitle = useMemo(() => {
    if (store?.type === "vm") {
      return `${store?.name}${
        store?.state === "Destroyed"
          ? intl.formatMessage({
              id: "backup.data.details.destroyed",
              defaultMessage: "(Deleted)",
            })
          : ""
      }`;
    }
    return (
      <>
        <span>{store?.name}</span>
        {store?.index === 0 && (
          <div className={styles.tag}>
            {intl.formatMessage({ id: "latest", defaultMessage: "Latest" })}
          </div>
        )}
      </>
    );
  }, [store, intl]);

  const renderBackupDataListInfo = useMemo(() => {
    if (store?.type === "vm") {
      return (
        <div className={styles.list}>
          <div className={styles.listTitle}>
            {intl.formatMessage({
              id: "backup.data",
              defaultMessage: "Backup Data",
            })}
          </div>
          <BackupDatalist
            key={store.type}
            view={
              store?.backupStorageType === "local"
                ? "main.local"
                : "main.remote"
            }
            defaultQuery={defaultQuery}
            source={{ ...vm, backupStorageType: store?.backupStorageType }}
            onClickName={onClickName}
          />
        </div>
      );
    }

    if (store?.type === "backupData") {
      return (
        <div className={styles.list}>
          <div className={styles.listTitle}>
            {intl.formatMessage({
              id: "backup.info",
              defaultMessage: "Backup Info",
            })}
          </div>
          <BackupDatalist
            key={store.type}
            view={
              store?.backupStorageType === "local" ? "sub.local" : "sub.remote"
            }
            defaultQuery={defaultQuery}
            source={{
              ...backupData,
              backupStorageType: store?.backupStorageType,
            }}
          />
        </div>
      );
    }

    return null;
  }, [
    backupData,
    defaultQuery,
    intl,
    store?.backupStorageType,
    store?.type,
    vm,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{renderDetailTitle}</div>
      <div className={styles.content}>
        {store?.type === "vm" && !store.count && !store.size && (
          <Alert style={{ marginBottom: 12 }} variant="info" closable>
            {intl.formatMessage({
              id: "backup.data.not.yet.generated.alert.info",
              defaultMessage:
                "The VM has been associated with a backup plan. According to the scheduled time, the backup data has not yet been generated. Please check again later.",
            })}
          </Alert>
        )}
        <div className={styles.actionBox}>{useRenderAction()}</div>
        <BasicInfo vm={vm} backupData={backupData} />
        {renderBackupDataListInfo}
      </div>
    </div>
  );
};

export default BackupDataDetails;
