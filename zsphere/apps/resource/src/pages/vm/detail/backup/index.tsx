import type { IDraggableCardProps } from "@zstack/zsphere-components";
import {
  Radio,
  ResponsiveDndCardsLayout,
  Spin,
} from "@zstack/zsphere-components";
import type { IQuery } from "@zstack/zsphere-types";
import { Op, ProfileType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { bus, formatBytesToSize } from "@zstack/zsphere-utils";
import type { FC } from "react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import {
  BackupDatalist,
  useActionConfig as useBackupDataActionConfig,
} from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import VmChangeOwner from "../../action/change-owner";
import CreateVmByBackupData from "../../create-vm-by-resource/backup-data";
import BackupCapacityCard from "./backupCapacity-card";
import BackupPolicyCard from "./backupPolicy-card";
import BackupEmpty from "./empty";
import { useBackupQuery } from "./hooks";

import styles from "./style.module.less";

const useActionConfig = () => {
  return useBackupDataActionConfig([
    {
      key: "create.vm",
      icon: "plus",
      ActionWrapper: CreateVmByBackupData,
    },
    {
      key: "change.owner",
      ActionWrapper: VmChangeOwner,
    },
  ]);
};

interface IProps {
  current: IVM;
}

export interface IDataList {
  color: string;
  value: number;
  description: JSX.Element;
}

const Backup: FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const [backupStorageType, setBackupStorageType] = useState("local");

  const actionConfig = useActionConfig();

  const defaultQuery: IQuery = useMemo(() => {
    const conditions: any = [
      {
        key: "status",
        op: Op.eq,
        value: "Ready",
      },
      {
        key: "type",
        op: Op.eq,
        value: "Root",
      },
      {
        key: "vmInstanceUuid",
        op: Op.eq,
        value: current?.uuid,
      },
    ];

    if (backupStorageType === "local") {
      conditions.push({
        key: "backupStorage.__systemTag__",
        op: Op.in,
        values: ["onlybackup", "allowbackup"],
      });
      conditions.push({
        key: "_VolumeBackupStorageRefReadyStatus_",
        op: Op.eq,
        value: "__UnknownLocalBackupStorageUuid__",
      });
    }

    if (backupStorageType === "remote") {
      conditions.push({
        key: "backupStorage.__systemTag__",
        op: Op.in,
        values: ["remotebackup"],
      });
      conditions.push({
        key: "_VolumeBackupStorageRefReadyStatus_",
        op: Op.eq,
        value: "__UnknownRemoteBackupStorageUuid__",
      });
    }

    return { conditions };
  }, [backupStorageType, current]);

  const {
    loading,
    backupDataSize,
    noBackup,
    currentBackupPolicy,
    zsvBackupDataRefetch,
    zsvSchedulerJobGroupRefetch,
    refetchVolumeBackupDataSize,
  } = useBackupQuery(current);

  useEffect(() => {
    const cb = () => {
      zsvBackupDataRefetch();
      zsvSchedulerJobGroupRefetch();
      refetchVolumeBackupDataSize();
    };
    bus.addListener("action:refetch:BackupData", cb);
    return () => bus.removeListener("action:refetch:BackupData", cb);
  }, []);

  const getSizeData = useCallback(
    (data: any) => {
      const { full, incremental, incrementalDependency } = data;
      const dataList: IDataList[] = [];

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
        storageTotalCapacity:
          formatBytesToSize(full + incremental + incrementalDependency) || 0,
      };
    },
    [intl],
  );

  const localSizeData = useMemo(
    () => getSizeData(backupDataSize.local),
    [backupDataSize.local, getSizeData],
  );
  const remoteSizeData = useMemo(
    () => getSizeData(backupDataSize.remote),
    [backupDataSize.remote, getSizeData],
  );

  const dataSet = useMemo(() => {
    const result: any = {
      backupPolicy: {
        resourceKey: "backupPolicy",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BackupPolicyCard
            current={{ ...current, currentBackupPolicy }}
            refetch={zsvSchedulerJobGroupRefetch}
            {...props}
          />
        ),
      },
      backupCapacity: {
        resourceKey: "backupCapacity",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BackupCapacityCard
            localSizeData={localSizeData}
            remoteSizeData={remoteSizeData}
            {...props}
          />
        ),
      },
    };
    return result;
  }, [current, currentBackupPolicy, remoteSizeData, localSizeData]);

  if (loading) {
    return <Spin />;
  }

  if (noBackup) {
    return (
      <BackupEmpty
        current={current}
        zsvBackupDataRrefetch={zsvBackupDataRefetch}
        zsvSchedulerJobGroupRrefetch={zsvSchedulerJobGroupRefetch}
      />
    );
  }

  return (
    <>
      <div>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="virtualization-resource-vm"
          cols={2}
          dataSet={dataSet}
        />
      </div>
      <div className={styles.list}>
        <Radio.Group
          value={backupStorageType}
          onChange={(e) => setBackupStorageType(e.target.value)}
        >
          <Radio.Button value="local">
            {intl.formatMessage({
              id: "local.backup.data",
              defaultMessage: "Local Backup Data",
            })}
          </Radio.Button>
          <Radio.Button value="remote">
            {intl.formatMessage({
              id: "remote.backup.data",
              defaultMessage: "Remote Backup Data",
            })}
          </Radio.Button>
        </Radio.Group>
        <BackupDatalist
          actionConfig={actionConfig}
          source={{ ...current, backupStorageType }}
          view={backupStorageType === "local" ? "main.local" : "main.remote"}
          defaultQuery={defaultQuery}
        />
      </div>
    </>
  );
};

export default Backup;
