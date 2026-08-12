import { useLazyQuery } from "@apollo/client";
import { Button, InfoPopover } from "@zstack/design";
import { Spin } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { DialogBase } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import SVG from "react-inlinesvg";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { ZoneContext } from "zsv_data_protection_shared/backup-management/disaster-recovery-storage/mf-index";

import { haveRemoteBackupStorage } from "../../../../../gql/disaster-recovery-storage.gql";
import CreateBackupStorage from "./create";

import styles from "../style.module.less";

interface IEntryList {
  title: string;
  icon: React.ReactNode;
  content: {
    icon: IconTypes;
    title: string;
    value: string;
    description: string;
    onClick: () => void;
  }[];
}

export type ICreateWay =
  | "localFromImageStorage"
  | "localFromHost"
  | "localCreate"
  | "remoteCreate";

const EnterSelect: React.FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const [createWay, setCreateWay] = useState<ICreateWay>(
    "localFromImageStorage",
  );
  const [createBackupStorageVisible, setCreateBackupStorageVisible] =
    useState<boolean>(false);
  const { selectedZone = "" } = useContext(ZoneContext);
  const [getHaveRemoteBackupStorage, { data, loading }] = useLazyQuery(
    haveRemoteBackupStorage,
  );

  useEffect(() => {
    if (!visible && !createBackupStorageVisible) {
      setCreateWay("localFromImageStorage");
    }
    if (visible) {
      getHaveRemoteBackupStorage();
    }
  }, [createBackupStorageVisible, visible]);

  const EntryList = useMemo(() => {
    const entryList: IEntryList[] = [
      {
        title: intl.formatMessage({
          id: "local.back.up.storage",
          defaultMessage: "Local Backup Storage",
        }),
        icon: (
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backup.storage.create.tooltip",
                  defaultMessage:
                    "### Backup Storage\n\nSupports local backup storage and remote backup storage.\n\n- Local backup storage: You can add multiple local backup storage according to your business requirements.\n- Remote backup storage: You can only add 1 remote backup storage.\n",
                })}
              </ReactMarkdown>
            }
          />
        ),
        content: [
          {
            icon: "server" as IconTypes,
            title: intl.formatMessage({
              id: "local.from.image.storage",
              defaultMessage: "Reuse Image Storage",
            }),
            value: "localFromImageStorage",
            description: intl.formatMessage({
              id: "reuse.existing.image.storage.description",
              defaultMessage: "Reuse an existing image storage to store backup data.",
            }),
            onClick: () => setCreateWay("localFromImageStorage"),
          },
          {
            icon: "disk-2" as IconTypes,
            title: intl.formatMessage({
              id: "local.from.host",
              defaultMessage: "Reuse Host",
            }),
            value: "localFromHost",
            description: intl.formatMessage({
              id: "reuse.existing.host.description",
              defaultMessage:
                "Reuse an existing host and utilize free host capacity to store backup data.",
            }),
            onClick: () => setCreateWay("localFromHost"),
          },
          {
            icon: "slot" as IconTypes,
            title: intl.formatMessage({
              id: "dedicated.backup.storage",
              defaultMessage: "Dedicated Backup Storage",
            }),
            value: "localCreate",
            description: intl.formatMessage({
              id: "add.dedicated.backup.storage.description",
              defaultMessage:
                "Add a dedicated backup storage and use free disks or local directory to store backup data.",
            }),
            onClick: () => setCreateWay("localCreate"),
          },
        ],
      },
    ];

    if (!data?.haveRemoteBackupStorage) {
      entryList.push({
        title: intl.formatMessage({
          id: "remote.back.up.storage",
          defaultMessage: "Remote Backup Storage",
        }),
        icon: (
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backup.storage.create.tooltip",
                  defaultMessage:
                    "### Backup Storage\n\nSupports local backup storage and remote backup storage.\n\n- Local backup storage: You can add multiple local backup storage according to your business requirements.\n- Remote backup storage: You can only add 1 remote backup storage.\n",
                })}
              </ReactMarkdown>
            }
          />
        ),
        content: [
          {
            icon: "slot" as IconTypes,
            title: intl.formatMessage({
              id: "dedicated.backup.storage",
              defaultMessage: "Dedicated Backup Storage",
            }),
            value: "remoteCreate",
            description: intl.formatMessage({
              id: "add.dedicated.backup.storage.description",
              defaultMessage:
                "Add a dedicated backup storage and use free disks or local directory to store backup data.",
            }),
            onClick: () => setCreateWay("remoteCreate"),
          },
        ],
      });
    }
    return entryList;
  }, [data?.haveRemoteBackupStorage, intl]);

  const onNextButton = useCallback(() => {
    setCreateBackupStorageVisible(true);
    setVisible(false);
  }, []);

  const createWayContent = useMemo(() => {
    return (
      <div className={styles["create-way"]}>
        <div className={styles.tip}>
          {intl.formatMessage({
            id: "disaster.recovery.storage.modal.title.create.way.tip",
            defaultMessage: "Choose a type to add a backup storage.",
          })}
        </div>

        <div className={styles.way}>
          {EntryList.map((t) => {
            return (
              <div key={t.title} className={styles["item-wrapper"]}>
                <div className={styles["item-title"]}>
                  {t.title}
                  <span className={styles["item-info"]}>{t.icon}</span>
                </div>
                <div className={styles["item-content"]}>
                  {t.content.map((c) => {
                    const selectedFlag = c.value === createWay;
                    return (
                      <div
                        key={c.value}
                        onClick={c.onClick}
                        className={
                          selectedFlag
                            ? styles["item-selected"]
                            : styles["item-not-selected"]
                        }
                      >
                        <div className={styles["icon-title"]}>
                          <div
                            className={
                              selectedFlag
                                ? styles["iconself-checked"]
                                : styles.iconself
                            }
                          >
                            <Icon
                              type={c.icon}
                              className={
                                selectedFlag
                                  ? styles["icon-checked"]
                                  : styles.icon
                              }
                            />
                          </div>
                          <div className={styles.title}>{c.title}</div>
                        </div>
                        <div className={styles.description}>
                          {c.description}
                        </div>
                        <div
                          className={
                            selectedFlag
                              ? styles["selected-indicator"]
                              : styles["check-indicator"]
                          }
                        >
                          <SVG
                            className={styles.triangle}
                            src={require("./illustration_triangle.svg")}
                            uniquifyIDs
                          />
                          <Icon type="checkmark" className={styles.checkmark} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [intl, EntryList, createWay]);

  return (
    <>
      <DialogBase
        title={intl.formatMessage({
          id: "backup.storage.modal.title.create.way.select.modal.title",
          defaultMessage: "Select Backup Storage Addition Type",
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
              data-testid="action-wrapper-cancel"
              onClick={() => {
                setVisible(false);
              }}
              disabled={!visible}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              id="modal-ok"
              key="confirm"
              variant="primary"
              data-testid="action-wrapper-confirm"
              onClick={onNextButton}
              disabled={!visible || loading}
            >
              {intl.formatMessage({
                id: "nextStep",
                defaultMessage: "Next",
              })}
              <Icon style={{ marginLeft: 4 }} type="arrow-ios-right" />
            </Button>
          </>
        }
      >
        {loading ? <Spin /> : createWayContent}
      </DialogBase>

      <CreateBackupStorage
        visible={createBackupStorageVisible}
        setVisible={setCreateBackupStorageVisible}
        view=""
        source={{ selectedZone, createWay }}
        selectedList={[]}
        position="row"
      />
    </>
  );
};

export default EnterSelect;
