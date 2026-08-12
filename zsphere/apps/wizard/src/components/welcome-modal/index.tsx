import { Button } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { DialogBase } from "@zstack/zsphere-design-biz";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { useGetWizardInfo } from "../../hooks/use-get-wizard-info";
import AutoInitModal from "../auto-init";
import BackupRestoreInitCreator from "../backup-restore-init-creator";
import InitWayItem from "./init-way-item";

import styles from "./style.module.less";

export type IInitWay = "bootstrap" | "basicEnv" | "backupRestore";

const WelcomeModal: React.FC<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
  refetchZoneList?: () => void;
}> = ({ visible, setVisible, refetchZoneList }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [initWay, setInitWay] = useState<IInitWay>("basicEnv");
  const [backupRestoreVisible, setBackupRestoreVisible] =
    useState<boolean>(false);
  const [autoInitVisible, setAutoInitVisible] = useState<boolean>(false);

  /**
   * 检测到环境走了bootstrap部署的，能够获得平台硬件及存储信息的。 登录至ZSphere平台后，提供三种初始化方式
   */
  const { data: wizardInfo, loading } = useGetWizardInfo();
  const initWayList = useMemo(() => {
    const resultList = [
      {
        icon: "compass" as IconTypes,
        title: intl.formatMessage({
          id: "welcome.modal.basic.env.by.manual",
          defaultMessage: "Initialize Manually",
        }),
        value: "basicEnv" as IInitWay,
        description: intl.formatMessage({
          id: "welcome.modal.basic.env.by.manual.description",
          defaultMessage:
            "This option guides you through creating necessary resources for initiating a new environment.",
        }),
        onClick: () => setInitWay("basicEnv"),
      },
      {
        icon: "backup" as IconTypes,
        title: intl.formatMessage({
          id: "welcome.modal.backup.restore",
          defaultMessage: "Restore from Backup Data",
        }),
        value: "backupRestore" as IInitWay,
        description: intl.formatMessage({
          id: "welcome.modal.backup.restore.description",
          defaultMessage:
            "This option guides you through restoring the whole environment from existing platform database backups.",
        }),
        onClick: () => setInitWay("backupRestore"),
      },
    ];
    if (wizardInfo) {
      resultList.unshift({
        icon: "scan" as IconTypes,
        title: intl.formatMessage({
          id: "welcome.modal.bootstrap",
          defaultMessage: "Initialize Automatically",
        }),
        value: "bootstrap" as IInitWay,
        description: intl.formatMessage({
          id: "welcome.modal.bootstrap.description",
          defaultMessage:
            "This option scans hardware and automatically deploys necessary resources for initiating a new environment.",
        }),
        onClick: () => setInitWay("bootstrap"),
      });
      setInitWay("bootstrap");
    }

    return resultList;
  }, [intl, wizardInfo, setInitWay]);

  const createWayContent = useMemo(() => {
    return (
      <div className={styles["init-way"]}>
        <div className={styles.tip}>
          {intl.formatMessage({
            id: "welcome.modal.tip",
            defaultMessage:
              "How would you like to set up your initial environment?",
          })}
        </div>
        <div className={styles.way}>
          {!loading &&
            initWayList.map((t) => (
              <InitWayItem
                key={t.value}
                icon={t.icon}
                title={t.title}
                description={t.description}
                selected={t.value === initWay}
                onClick={t.onClick}
              />
            ))}
        </div>
      </div>
    );
  }, [initWayList, initWay, intl, loading]);

  const onNextButton = useCallback(() => {
    setVisible(false);
    if (initWay === "basicEnv") {
      navigate("/virtualization-wizard");
    } else if (initWay === "backupRestore") {
      setBackupRestoreVisible(true);
    } else if (initWay === "bootstrap") {
      setAutoInitVisible(true);
    }
  }, [setVisible, initWay, navigate]);

  return (
    <>
      <DialogBase
        title={intl.formatMessage({
          id: "welcome.modal.title",
          defaultMessage: "Welcome to Initialization Wizard",
        })}
        visible={visible}
        setVisible={setVisible}
        widthClassName="w-[600px]"
        footer={
          <>
            <Button
              id="modal-cancel"
              key="cancel"
              variant="link"
              onClick={() => setVisible(false)}
              disabled={!visible}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              id="modal-ok"
              key="confirm"
              variant="primary"
              icon={<Icon style={{ marginLeft: 4 }} type="arrow-ios-right" />}
              onClick={onNextButton}
              disabled={!visible}
            >
              {intl.formatMessage({
                id: "nextStep",
                defaultMessage: "Next",
              })}
            </Button>
          </>
        }
      >
        {createWayContent}
      </DialogBase>
      <BackupRestoreInitCreator
        visible={backupRestoreVisible}
        setVisible={setBackupRestoreVisible}
      />
      <AutoInitModal
        dataSet={wizardInfo}
        visible={autoInitVisible}
        setVisible={setAutoInitVisible}
        refetchZoneList={refetchZoneList}
      />
    </>
  );
};

export default WelcomeModal;
