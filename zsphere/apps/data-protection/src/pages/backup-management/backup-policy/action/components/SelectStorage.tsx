import { ModalSelect, Form } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import BackStorageList from "../../../disaster-recovery-storage/list";

import style from "./style.module.less";

export interface ISelectStorageProps {
  zoneUuid?: string;
}

export default function SelectStorage({ zoneUuid }: ISelectStorageProps) {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "__systemTag__",
          op: Op.in,
          values: ["allowbackup", "onlybackup"],
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
    }),
    [zoneUuid],
  );

  return (
    <Form.Item
      required
      className={style.localBackupStorage}
      label={intl.formatMessage({
        id: "local.back.up.storage",
        defaultMessage: "Local Backup Storage",
      })}
    >
      <Form.Item
        noStyle
        name="localBackupStorage"
        rules={[isRequired(IIsRequiredType.select)]}
      >
        <ModalSelect
          className={style.modalSelect}
          selectType="checkbox"
          label={intl.formatMessage({
            id: "add.local.backup.storage",
            defaultMessage: "Add Local Backup Storage",
          })}
          title={intl.formatMessage({
            id: "select.local.backup.storage",
            defaultMessage: "Select Local Backup Storage",
          })}
          maxSelectedCount={2}
          maxCountOverflowTooltip={intl.formatMessage({
            id: "add.local.backup.storage.modal.alert.message",
            defaultMessage: "You can select a maximum of two local backup storage for a backup plan.",
          })}
        >
          <BackStorageList view="select" defaultQuery={defaultQuery} />
        </ModalSelect>
      </Form.Item>
      <div className={style.localBackupStorageDescription}>
        {intl.formatMessage({
          id: "add.local.backup.storage.description.failover",
          defaultMessage:
            "When two local backup storage are specified, the failover mechanism is supported. If a backup storage fails, backup plans will automatically switch to the other backup storage.",
        })}
      </div>
    </Form.Item>
  );
}
