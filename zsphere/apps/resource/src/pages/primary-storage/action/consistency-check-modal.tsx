import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { DialogBase } from "@zstack/zsphere-design-biz";
import type { ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import bgIcon from "../../../assets/images/bg.webp";
import rotateImg from "../../../assets/images/rotate.webp";

import styles from "./style.module.less";

type ConsistencyStatus = "checking" | "success" | "uuidMismatch" | "failed";

const TAKEOVER_PRIMARY_STORAGE = gql`
  mutation TakeoverPrimaryStorage($input: TakeoverPrimaryStorageInput!) {
    TakeoverPrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const ConsistencyCheckModal: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const intl = useIntl();
  const [status, setStatus] = useState<ConsistencyStatus>("checking");

  const primaryStorage = selectedList?.[0];
  const primaryStorageUuid = primaryStorage?.uuid;

  const doAction = useAction();

  const title = useMemo(
    () =>
      intl.formatMessage({
        id: "primaryStorage.consistencyCheck.title",
        defaultMessage: "Consistency Check",
      }),
    [intl],
  );

  const triggerConsistencyCheck = useCallback(() => {
    if (!primaryStorageUuid) {
      setStatus("failed");
      return;
    }

    setStatus("checking");

    let hasProgress = false;

    doAction({
      mutation: TAKEOVER_PRIMARY_STORAGE,
      payload: { primaryStorageUuid, dryRun: true },
      name: intl.formatMessage({
        id: "primaryStorage.consistencyCheck.title",
        defaultMessage: "Consistency Check",
      }),
      total: 1,
      type: "PrimaryStorageVO",
      silent: true,
      onProgress: (result: ITaskResult) => {
        hasProgress = true;

        if (result.error) {
          setStatus("failed");
          return;
        }

        const inventory = result.inventory;
        if (!inventory) {
          setStatus("failed");
          return;
        }

        if (inventory.success === true) {
          setStatus("uuidMismatch");
        } else if (inventory.errorCode === "PS.1005") {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      },
      onFinish: () => {
        if (!hasProgress) {
          setStatus("failed");
        }
      },
    });
  }, [primaryStorageUuid, doAction, intl]);

  useEffect(() => {
    if (visible) {
      triggerConsistencyCheck();
    }
  }, [visible, triggerConsistencyCheck]);

  const handleFixNow = useCallback(() => {
    if (!primaryStorageUuid) {
      return;
    }

    doAction({
      mutation: TAKEOVER_PRIMARY_STORAGE,
      payload: { primaryStorageUuid, dryRun: false },
      name: intl.formatMessage({
        id: "primaryStorage.consistencyCheck.fixNow",
        defaultMessage: "Fix Now",
      }),
      total: 1,
      type: "PrimaryStorageVO",
    });

    setVisible(false);
  }, [primaryStorageUuid, doAction, intl, setVisible]);

  const handleRetry = useCallback(() => {
    triggerConsistencyCheck();
  }, [triggerConsistencyCheck]);

  const content = useMemo(() => {
    if (status === "checking") {
      return (
        <>
          <div className={styles.iconContainer}>
            <div className={styles.icon}>
              <img src={bgIcon} className={styles.bgIcon} alt="background" />
              <img
                src={rotateImg}
                className={styles.rotateIcon}
                alt="scanning"
              />
            </div>
            <div className={styles.statusText}>
              {intl.formatMessage({
                id: "primaryStorage.consistencyCheck.checking",
                defaultMessage: "Checking Data Storage Consistency…",
              })}
            </div>
          </div>
        </>
      );
    }

    if (status === "success") {
      return (
        <>
          <Icon
            type="checkmark-circle-fill"
            style={{ width: 48, height: 48, color: "#34C759" }}
          />
          <div className={styles.statusText}>
            {intl.formatMessage({
              id: "primaryStorage.consistencyCheck.success.title",
              defaultMessage: "Consistency Check Passed",
            })}
          </div>
          <div className={styles.statusDescription}>
            {intl.formatMessage({
              id: "primaryStorage.consistencyCheck.success.desc",
              defaultMessage:
                "The data storage consistency check completed successfully. No consistency issues were detected.",
            })}
          </div>
        </>
      );
    }

    if (status === "uuidMismatch") {
      return (
        <>
          <Icon
            type="alert-triangle-fill"
            style={{ width: 48, height: 48, color: "#FF9500" }}
          />
          <div className={styles.statusText}>
            {intl.formatMessage({
              id: "primaryStorage.consistencyCheck.uuidMismatch.title",
              defaultMessage: "Consistency Check Completed, Inconsistency Detected",
            })}
          </div>
          <div className={styles.statusDescription}>
            {intl.formatMessage(
              {
                id: "primaryStorage.consistencyCheck.uuidMismatch.desc",
                defaultMessage:
                  "The data storage UUIDs do not match. Perform {fixLink} to ensure data consistency.",
              },
              {
                fixLink: (
                  <Button
                    variant="link"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      handleFixNow();
                    }}
                    className={styles.link}
                  >
                    {intl.formatMessage({
                      id: "primaryStorage.consistencyCheck.uuidMismatch.fixNow",
                      defaultMessage: "Fix Now",
                    })}
                  </Button>
                ),
              },
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <Icon
          type="close-circle-fill"
          style={{ width: 48, height: 48, color: "#FF3B30" }}
        />
        <div className={styles.statusText}>
          {intl.formatMessage({
            id: "primaryStorage.consistencyCheck.failed.title",
            defaultMessage: "Consistency Check Failed",
          })}
        </div>
        <div className={styles.statusDescription}>
          {intl.formatMessage(
            {
              id: "primaryStorage.consistencyCheck.failed.desc",
              defaultMessage:
                "The data storage consistency check could not be completed. Verify the storage connection status and try again. {retryLink}",
            },
            {
              retryLink: (
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleRetry();
                  }}
                  className={styles.link}
                >
                  {intl.formatMessage({
                    id: "primaryStorage.consistencyCheck.failed.retry",
                    defaultMessage: "Recheck",
                  })}
                </a>
              ),
            },
          )}
        </div>
      </>
    );
  }, [intl, status, handleFixNow, handleRetry]);

  const footer = useMemo(() => {
    if (status === "uuidMismatch") {
      return (
        <>
          <Button
            onClick={() => setVisible(false)}
            children={intl.formatMessage({
              id: "cancel",
              defaultMessage: "Cancel",
            })}
            variant="subtle"
          />
          <Button
            variant="primary"
            onClick={handleFixNow}
            children={intl.formatMessage({
              id: "primaryStorage.consistencyCheck.fixNow",
              defaultMessage: "Fix Now",
            })}
          />
        </>
      );
    }

    return (
      <Button
        variant="primary"
        onClick={() => setVisible(false)}
        children={intl.formatMessage({
          id: "ok",
          defaultMessage: "OK",
        })}
      />
    );
  }, [intl, setVisible, status, handleFixNow, handleRetry]);

  return (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={title}
      footer={status === "checking" ? null : footer}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <div className={styles["consistency-check-content"]}>{content}</div>
    </DialogBase>
  );
};

export default ConsistencyCheckModal;
