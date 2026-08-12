import { RadioGroup } from "@zstack/design";
import { Form, InputUnit } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import BackupStrategy from "./BackupStrategy";
import ChainLength, { chainLengthDependencies } from "./ChainLength";
import { validateRange, volumeUnitList } from "./Qos";
import StartTime from "./StartTime";

import style from "./style.module.less";

export interface IBackupStrategyPanelProp {
  backupType: "vm" | "db";
}

export default function BackupStrategyPanel({
  backupType,
}: IBackupStrategyPanelProp) {
  const intl = useIntl();
  const form = Form.useFormInstance();
  const { isRequired } = useValidator(intl);
  return (
    <>
      {backupType === "vm" && (
        <>
          <Form.Item
            name="mode"
            label={intl.formatMessage({
              id: "backup.mode",
              defaultMessage: "Backup Mode",
            })}
          >
            <RadioGroup
              options={[
                {
                  value: "default",
                  label: intl.formatMessage({
                    id: "default.incremental.backup",
                    defaultMessage: "Default Incremental Backup",
                  }),
                },
                {
                  value: "custom",
                  label: intl.formatMessage({
                    id: "custom.incremental.backup",
                    defaultMessage: "Customized Incremental Backup",
                  }),
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            label=" "
            className={style.radioGroupDescription}
            shouldUpdate={(prev, curr) => prev.mode !== curr.mode}
          >
            {({ getFieldValue }) =>
              getFieldValue("mode") === "default"
                ? intl.formatMessage({
                    id: "backup.mode.option.default.description",
                    defaultMessage:
                      "Performs incremental backups based on your customized incremental backup policy. After 63 incremental backups, the system automatically performs a full backup, then deletes previous incremental backup records without compromising data integrity.",
                  })
                : intl.formatMessage({
                    id: "backup.mode.option.custom.description",
                    defaultMessage:
                      "Performs both incremental and full backups based on your customized incremental and full backup polices. After 63 incremental backups, the system automatically performs a full backup, then deletes previous incremental backup records without compromising data integrity.",
                  })
            }
          </Form.Item>
          <Form.Item
            className={style.fieldTitle}
            label={intl.formatMessage({
              id: "incremental.backup.strategy",
              defaultMessage: "Incremental Backup Policy",
            })}
          />
        </>
      )}
      <BackupStrategy
        mode="incremental"
        backupType={backupType}
        tooltip={
          <ReactMarkdown>
            {backupType === "db"
              ? intl.formatMessage({
                  id: "database.backup.strategy.execute.time.tooltip",
                  defaultMessage:
                    "### Execution Time\n\nFor backup by week or day, you can set a fine-grained execution time for the backup plan, with the support for selection down to the minute level.\n\n- Backup by week: If you set the execution time to 00:00 on Sunday and Tuesday of each week, the backup plan is executed at 00:00:00 on Sunday and Tuesday of each week.\n- Backup by day: If you set the execution time to 00:30, the backup plan is executed at 00:30:00 every day.\n",
                })
              : intl.formatMessage({
                  id: "incremental.backup.strategy.execute.time.tooltip",
                  defaultMessage:
                    "### Execution Time\n\nFor backup by month, week, or day, you can set a fine-grained incremental backup execution time, with the support for selection down to the minute level.\n\n- Backup by month: If you set the execution time to 00:00 on the first day of each month, the incremental backup is executed at 00:00:00 on the first day of each month.\n- Backup by week: If you set the execution time to 00:00 on Sunday and Tuesday of each week, the incremental backup is executed at 00:00:00 on Sunday and Tuesday of each week.\n- Backup by day: If you set the execution time to 00:30, the incremental backup is executed at 00:30:00 every day.\n",
                })}
          </ReactMarkdown>
        }
      />
      {backupType === "vm" && (
        <>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.mode !== curr.mode}
          >
            {({ getFieldValue }) =>
              getFieldValue("mode") === "custom" && (
                <>
                  <Form.Item
                    className={style.fieldTitle}
                    label={intl.formatMessage({
                      id: "full.backup.strategy",
                      defaultMessage: "Full Backup Policy",
                    })}
                  />
                  <BackupStrategy
                    mode="full"
                    backupType={backupType}
                    tooltip={
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "full.backup.strategy.execute.time.tooltip",
                          defaultMessage:
                            "### Execution Time\n\nFor backup by month or week, you can set a fine-grained full backup execution time, with the support for selection down to the minute level.\n\n- Backup by month: If you set the execution time to 00:00 on the first day of each month, the full backup is executed at 00:00:00 on the first day of each month.\n- Backup by week: If you set the execution time to 00:00 on Sunday and Tuesday of each week, the full backup is executed at 00:00:00 on Sunday and Tuesday of each week.\n",
                        })}
                      </ReactMarkdown>
                    }
                  />
                </>
              )
            }
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) =>
              chainLengthDependencies.some((dep) => prev[dep] !== curr[dep]) ||
              (!!curr.incrementalExecuteTimeList &&
                curr.incrementalExecuteTimeList.some(
                  (item: any, index: number) =>
                    item !== prev.incrementalExecuteTimeList[index],
                ))
            }
          >
            {({ getFieldsValue }) => (
              <ChainLength {...getFieldsValue(chainLengthDependencies)} />
            )}
          </Form.Item>
        </>
      )}
      <Form.Item
        required
        name="startTime"
        label={intl.formatMessage({
          id: "startTime",
          defaultMessage: "Start Time",
        })}
        rules={[isRequired()]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backup.startTime.tooltip",
              defaultMessage:
                "### Start Time\n\nThe backup plan starts from the specified time and follows the set backup cycle and execution time.\n",
            })}
          </ReactMarkdown>
        }
      >
        <StartTime />
      </Form.Item>
      {backupType === "vm" && (
        <Form.Item
          name="diskWrite"
          label={intl.formatMessage({
            id: "disk.read.speed",
            defaultMessage: "Disk Read Speed",
          })}
          rules={[
            validateRange(
              1048576,
              107374182401,
              intl.formatMessage({
                id: "backupJob.field.volumeBandwidth.validator.invalid",
                defaultMessage: "Valid disk speed: 1 MB/s–100 GB/s",
              }),
            ),
          ]}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "backup.field.disk.read.speed.tooltip",
                defaultMessage:
                  "### Disk Read Speed\n\n1. Set a maximum disk read speed limit for VM backup plans. Leave blank for unlimited speed by default.\n2. The disk read speed setting should match the physical network bandwidth and account for the bandwidth occupied by concurrent backups.",
              })}
            </ReactMarkdown>
          }
        >
          <InputUnit
            min={0}
            unitList={volumeUnitList}
            placeholder={intl.formatMessage({
              id: "not.limited",
              defaultMessage: "Unlimited",
            })}
            onChange={(value) => {
              if (value?.number) {
                form?.setFieldsValue({ qos: true });
              } else {
                form?.setFieldsValue({ qos: false });
              }
            }}
          />
        </Form.Item>
      )}
    </>
  );
}
