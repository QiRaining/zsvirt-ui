import { useLazyQuery } from "@apollo/client";
import { Text, Tooltip } from "@zstack/design";
import type { ISwitchProps } from "@zstack/zsphere-components";
import { Switch, Form } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import { formatStorageToObj } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd";
import cls from "classnames";
import { useEffect } from "react";
import { useIntl } from "react-intl";

import { ZSVBackupStorageList } from "../../../disaster-recovery-storage/list";

import style from "./style.module.less";

export interface IRemoteBackupSwitchProps {
  form: FormInstance;
  zoneUuid?: string;
}

export default function RemoteBackupSwitch({
  form,
  zoneUuid,
}: IRemoteBackupSwitchProps) {
  const intl = useIntl();

  const [query, { data, loading }] = useLazyQuery(ZSVBackupStorageList, {
    notifyOnNetworkStatusChange: true,
    variables: {
      conditions: [
        {
          key: "__systemTag__",
          op: Op.in,
          values: ["remotebackup"],
        },
        {
          key: "type",
          op: Op.eq,
          value: "ImageStoreBackupStorage",
        },
        {
          key: "state",
          op: Op.eq,
          value: "Enabled",
        },
        {
          key: "status",
          op: Op.eq,
          value: "Connected",
        },
        ...(zoneUuid
          ? [
              {
                key: "zone.uuid",
                op: Op.eq,
                value: zoneUuid,
              },
            ]
          : []),
      ],
    },
    onCompleted: (result) => {
      form.setFieldsValue({
        remoteBackupStorage: result?.ZSVBackupStorageList?.list?.[0],
      });
    },
  });
  const remoteBackupStorage = data?.ZSVBackupStorageList?.list?.[0];

  useEffect(() => {
    query();
  }, [query, zoneUuid]);

  return (
    <>
      <Form.Item
        className={style.syncRemote}
        name="syncRemote"
        label={intl.formatMessage({
          id: "sync.to.remote.backup.storage",
          defaultMessage: "Sync to Remote Backup Storage",
        })}
        valuePropName="checked"
      >
        <SyncSwitch
          remoteBackupStorage={remoteBackupStorage}
          loading={loading}
        />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.syncRemote !== curr.syncRemote}
      >
        {({ getFieldValue }) => {
          return (
            <Form.Item
              className={cls({
                [style.syncRemoteOff]: !getFieldValue("syncRemote"),
              })}
              name="remoteBackupStorage"
              label={intl.formatMessage({
                id: "remote.back.up.storage",
                defaultMessage: "Remote Backup Storage",
              })}
            >
              <CapacityLabel />
            </Form.Item>
          );
        }}
      </Form.Item>
    </>
  );
}

interface ICapacityLabel {
  value?: any;
}

function CapacityLabel({ value }: ICapacityLabel) {
  const intl = useIntl();
  const cap = formatStorageToObj(value?.availableCapacity ?? 0);
  return (
    <div className={style.remoteBackupStorage}>
      <Text>{value?.name}</Text>
      <div className={style.bar} />
      <div className={style.capacity}>
        {intl.formatMessage({
          id: "remote.available.capacity",
          defaultMessage: "Available Capacity",
        })}
        ：{`${cap.number} ${cap.unit}`}
      </div>
    </div>
  );
}

interface ISyncSwitchProps extends ISwitchProps {
  remoteBackupStorage?: any;
  loading?: boolean;
}

function SyncSwitch({
  remoteBackupStorage,
  loading,
  ...switchProps
}: ISyncSwitchProps) {
  const intl = useIntl();
  return (
    <Tooltip
      title={
        remoteBackupStorage
          ? undefined
          : intl.formatMessage({
              id: "remote.backup.storage.not.available.tooltip",
              defaultMessage: "No available remote backup storage.",
            })
      }
    >
      <Switch {...switchProps} disabled={loading || !remoteBackupStorage} />
    </Tooltip>
  );
}
