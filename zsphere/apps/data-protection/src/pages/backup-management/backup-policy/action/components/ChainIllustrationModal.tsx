import { Alert } from "@zstack/design";
import { DialogBase } from "@zstack/zsphere-design-biz";
import cls from "classnames";
import { useIntl } from "react-intl";

import style from "./style.module.less";

declare const __ZSV_ENGLISH_ONLY__: boolean | undefined;

export interface IChainIllustrationModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const isZsvEnglishOnlyMode = () => {
  return typeof __ZSV_ENGLISH_ONLY__ === "boolean"
    ? __ZSV_ENGLISH_ONLY__
    : false;
};

export const shouldUseChineseChainIllustration = (locale: string) => {
  return !isZsvEnglishOnlyMode() && (locale === "zh-CN" || locale === "zh_CN");
};

export default function ChainIllustrationModal({
  visible,
  setVisible,
}: IChainIllustrationModalProps) {
  const intl = useIntl();

  const title = intl.formatMessage({
    id: "backup.chain",
    defaultMessage: "Backup Chain",
  });

  return (
    <DialogBase
      widthClassName="w-[800px]"
      visible={visible}
      setVisible={setVisible}
      title={title}
      hideCancelButton
      onOk={() => setVisible(false)}
    >
      <Alert variant="warning">
        {intl.formatMessage({
          id: "backup.chain.illustration.modal.alert.warning",
          defaultMessage:
            "Restoring VM from backup data requires merging incremental and full backup data at and before the recovery point. For data security, it is recommend to shorten the backup chain.",
        })}
      </Alert>
      <div className={style.section}>
        <div className={style.sectionTitle}>
          <div>
            {intl.formatMessage({
              id: "backup.chain.illustration",
              defaultMessage: "Explanatory Diagram",
            })}
          </div>
          <div className={style.chainLegend}>
            <div className={style.chainLegendItem}>
              <div className={cls(style.legendIcon, style.fullBackupIcon)} />
              {intl.formatMessage({
                id: "full.backup",
                defaultMessage: "Full Backup",
              })}
            </div>
            <div className={style.chainLegendItem}>
              <div
                className={cls(style.legendIcon, style.incrementalBackupIcon)}
              />
              {intl.formatMessage({
                id: "incremental.backup",
                defaultMessage: "Incremental Backup",
              })}
            </div>
            <div className={style.chainLegendItem}>
              <div className={cls(style.legendIcon, style.recoveryPointIcon)} />
              {intl.formatMessage({
                id: "recovery.point",
                defaultMessage: "Recovery Point",
              })}
            </div>
          </div>
        </div>
        <div className={style.sectionField}>
          <div className={style.illustration}>
            <span>
              {intl.formatMessage({
                id: "backup.chain.illustration.default.description",
                defaultMessage:
                  "Default Incremental Backup: After 63 incremental backups, the system automatically performs a full backup, capping the backup chain length at 64.",
              })}
            </span>
            <img
              alt=""
              src={
                shouldUseChineseChainIllustration(intl.locale)
                  ? require("./assets/illustration_incremental.webp")
                  : require("./assets/illustration_incremental_en.webp")
              }
              width={720}
              height={116}
            />
          </div>
          <div className={style.illustration}>
            <span>
              {intl.formatMessage({
                id: "backup.chain.illustration.custom.description",
                defaultMessage:
                  "Customized Incremental Backup: By configuring tailored full backup policies to reduce intervals between full backups, the number of full backups increases, thereby shortening the backup chain and less backup data is merged during recovery.",
              })}
            </span>
            <img
              alt=""
              src={
                shouldUseChineseChainIllustration(intl.locale)
                  ? require("./assets/illustration_full.webp")
                  : require("./assets/illustration_full_en.webp")
              }
              width={720}
              height={116}
            />
          </div>
        </div>
      </div>
    </DialogBase>
  );
}
