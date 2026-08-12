import { Form } from "@zstack/zsphere-components";
import cls from "classnames";
import { useRef, useImperativeHandle } from "react";
import { useIntl } from "react-intl";

import BackupStrategyPanel from "./BackupStrategyPanel";
import RetentionPolicyPanel from "./RetentionPolicyPanel";

import style from "./style.module.less";

export interface IBackupConfigProp {
  sectionRef?: any;
  className?: string;
}

export default function BackupConfig({
  className,
  sectionRef,
}: IBackupConfigProp) {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    sectionRef,
    () => ({
      jumpToError: () => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const errorPane = containerRef.current.querySelector(
              ".ant-form-item-has-error",
            );
            if (errorPane) {
              errorPane.scrollIntoView({ behavior: "instant" });
            }
          }
        });
      },
    }),
    [],
  );

  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, curr) => prev.entityType !== curr.entityType}
    >
      {({ getFieldValue }) => {
        const backupType = getFieldValue("entityType");
        return (
          <div className={cls(style.formWrapper, className)}>
            <div className={style.section}>
              <div className={style.sectionTitle}>
                {intl.formatMessage({
                  id: "backup.strategy",
                  defaultMessage: "Backup Policy",
                })}
              </div>
              <div className={style.sectionBody} ref={containerRef}>
                <BackupStrategyPanel backupType={backupType} />
              </div>
            </div>
            <div className={style.section}>
              <div className={style.sectionTitle}>
                {intl.formatMessage({
                  id: "retention.policy",
                  defaultMessage: "Retention Policy",
                })}
              </div>
              <RetentionPolicyPanel backupType={backupType} />
            </div>
          </div>
        );
      }}
    </Form.Item>
  );
}
