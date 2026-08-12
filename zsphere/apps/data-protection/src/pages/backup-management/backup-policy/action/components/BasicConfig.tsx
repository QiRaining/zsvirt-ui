import { Text } from "@zstack/design";
import { ZSVForm, Form, useAuth } from "@zstack/zsphere-components";
import type { FormInstance } from "antd";
import cls from "classnames";
import { useIntl } from "react-intl";
import { RemoteBackupSwitch } from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import BackupEntityType from "./BackupEntityType";
import SelectStorage from "./SelectStorage";
import SelectVm from "./SelectVm";
import ZoneSelect from "./ZoneSelect";

import style from "./style.module.less";

export interface IBasicConfigProps {
  form: FormInstance;
  className?: string;
  isEdit?: boolean;
}

export default function BasicConfig({
  form,
  className,
  isEdit,
}: IBasicConfigProps) {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const renderBackupEntity = () => {
    if (isEdit) {
      return (
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.entityType !== curr.entityType}
        >
          {({ getFieldValue }) => (
            <Form.Item
              label={intl.formatMessage({
                id: "backup.entity.type",
                defaultMessage: "Backup Object Type",
              })}
            >
              {getFieldValue("entityType") === "vm"
                ? intl.formatMessage({
                    id: "vm",
                    defaultMessage: "Virtual Machine",
                  })
                : intl.formatMessage({
                    id: "platform.database",
                    defaultMessage: "Platform Database",
                  })}
            </Form.Item>
          )}
        </Form.Item>
      );
    }
    if (
      !hasAuth({
        type: "block",
        authKey: "database",
        resource: "resource.database",
      })
    ) {
      return (
        <Form.Item
          name="entityType"
          label={intl.formatMessage({
            id: "backup.entity.type",
            defaultMessage: "Backup Object Type",
          })}
        >
          {intl.formatMessage({
            id: "vm",
            defaultMessage: "Virtual Machine",
          })}
        </Form.Item>
      );
    }
    return <BackupEntityType />;
  };

  return (
    <div className={cls(style.formWrapper, className)}>
      <div className={style.section}>
        <div className={style.sectionTitle}>
          {intl.formatMessage({ id: "basic.info", defaultMessage: "Basic Info" })}
        </div>
        <div className={style.nameAndDesc}>
          <ZSVForm.NameAndDesc />
        </div>
        {!isEdit ? (
          <ZoneSelect form={form} />
        ) : (
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.zoneName !== curr.zoneName}
          >
            {({ getFieldValue }) =>
              getFieldValue("zoneName") && (
                <Form.Item
                  label={intl.formatMessage({
                    id: "zone",
                    defaultMessage: "Data Center",
                  })}
                >
                  <Text>{getFieldValue("zoneName")}</Text>
                </Form.Item>
              )
            }
          </Form.Item>
        )}
      </div>
      <div className={style.section}>
        <div className={style.sectionTitle}>
          {intl.formatMessage({
            id: "disaster.recovery.storage",
            defaultMessage: "Backup Storage",
          })}
        </div>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.zoneUuid !== curr.zoneUuid}
        >
          {({ getFieldValue }) => (
            <SelectStorage zoneUuid={getFieldValue("zoneUuid")} />
          )}
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.zoneUuid !== curr.zoneUuid}
        >
          {({ getFieldValue }) => (
            <RemoteBackupSwitch
              form={form}
              zoneUuid={getFieldValue("zoneUuid")}
            />
          )}
        </Form.Item>
      </div>
      <div className={style.section}>
        <div className={style.sectionTitle}>
          {intl.formatMessage({
            id: "backup.entity",
            defaultMessage: "Backup Object",
          })}
        </div>
        {renderBackupEntity()}
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) =>
            prev.schedulerJobGroupUuid !== curr.schedulerJobGroupUuid ||
            prev.entityType !== curr.entityType ||
            prev.zoneUuid !== curr.zoneUuid ||
            prev.initialVmCount !== curr.initialVmCount
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("entityType") === "vm" && (
              <SelectVm
                zoneUuid={getFieldValue("zoneUuid")}
                initialVmCount={getFieldValue("initialVmCount")}
                required={!isEdit}
                schedulerJobGroupUuid={getFieldValue("schedulerJobGroupUuid")}
              />
            )
          }
        </Form.Item>
      </div>
    </div>
  );
}
