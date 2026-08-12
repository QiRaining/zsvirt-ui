import { gql, useQuery } from "@apollo/client";
import { Alert, Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { DialogBase, DialogWeak } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BackupData, BackupDatabase } from "@zstack/zsphere-types/graphql";
import React, { useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { navigateToUrl } from "single-spa";

import styles from "./style.module.less";

const getConsoleLog = gql`
  query getConsoleLog($first: Boolean!) {
    getConsoleLog(first: $first)
  }
`;

export interface IConsole {
  setConsoleVis: React.Dispatch<React.SetStateAction<boolean>>;
  consoleVis?: boolean;

  setConsoleStatus: React.Dispatch<
    React.SetStateAction<RecoverDatabaseStatus | undefined>
  >;
  consoleStatus?: RecoverDatabaseStatus;
}

export interface IWizard {
  getParams?: (password: string) => object;
}

export enum RecoverDatabaseStatus {
  Success = "Success",
  StartFailed = "StartFailed",
  LicenseNoPermision = "LicenseNoPermision",
  NoRunning = "NoRunning",
  Running = "Running",
  SocketConnectFailed = "SocketConnectFailed",
}

const failed = "failed to start management server";
const licenseFailed = "The license is not permitted for the operation";
const success = "managementNode starts successfully";

const Action: React.FC<
  IActionWrapperProps<BackupData | BackupDatabase> & IConsole & IWizard
> = ({ getParams, setConsoleVis, consoleVis, consoleStatus }) => {
  const intl = useIntl();
  const [status, setStatus] = useState<RecoverDatabaseStatus>(
    RecoverDatabaseStatus.Running,
  );
  const [first, setFirst] = useState(true);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [pollInterval, setPollInterval] = useState(0);

  const { data, stopPolling } = useQuery<{ getConsoleLog: string }>(
    getConsoleLog,
    {
      variables: {
        first,
      },
      pollInterval,
      skip: !consoleVis,
      fetchPolicy: "no-cache",
      nextFetchPolicy: "no-cache",
      onCompleted(_data) {
        if (first) {
          //第一次会删除文件，删除文件之后开始poll
          setFirst(false);
          setPollInterval(1000);
        }
      },
    },
  );

  if (wrapRef?.current) {
    wrapRef.current.scrollTop = wrapRef?.current?.scrollHeight;
  }

  const msg = data?.getConsoleLog;

  useEffect(() => {
    if (msg?.includes(failed)) {
      setStatus(RecoverDatabaseStatus.StartFailed);
      stopPolling?.();
    }
    if (msg?.includes(licenseFailed)) {
      setStatus(RecoverDatabaseStatus.LicenseNoPermision);
      stopPolling?.();
    }

    if (msg?.includes(success)) {
      setStatus(RecoverDatabaseStatus.Success);
      stopPolling?.();
    }
  }, [msg, stopPolling]);

  const onOk = () => {
    setConsoleVis(false);
    if (
      [
        RecoverDatabaseStatus.Success,
        RecoverDatabaseStatus.LicenseNoPermision,
      ].includes(status!)
    ) {
      navigateToUrl("/login");
    }
  };

  const renderSuccessOrFailed = () => {
    if (
      ![
        RecoverDatabaseStatus.StartFailed,
        RecoverDatabaseStatus.LicenseNoPermision,
        RecoverDatabaseStatus.Success,
      ].includes(status) &&
      RecoverDatabaseStatus.SocketConnectFailed !== consoleStatus
    ) {
      return null;
    }

    const isSuccess = status === RecoverDatabaseStatus.Success;

    let resultTitle = (
      {
        [RecoverDatabaseStatus.Success]: intl.formatMessage({
          id: "management.node.started.successfully",
          defaultMessage: "Management Node Start Succeeded",
        }),
        [RecoverDatabaseStatus.StartFailed]: intl.formatMessage({
          id: "management.node.started.failed",
          defaultMessage: "Management Node Start Failed",
        }),
        [RecoverDatabaseStatus.LicenseNoPermision]: intl.formatMessage({
          id: "management.node.started.failed.for.license.expired",
          defaultMessage: "License expired",
        }),
      } as any
    )[status];

    if (consoleStatus === RecoverDatabaseStatus.SocketConnectFailed) {
      resultTitle = intl.formatMessage({
        id: "management.node.failed.for.connect.socket",
        defaultMessage: "Failed to connect database.",
      });
    }

    return (
      <div className="flex flex-col items-center py-4">
        <Icon
          type={isSuccess ? "checkmark-circle-fill" : "close-circle-fill"}
          width={64}
          height={64}
          className={isSuccess ? "text-success-500" : "text-danger-500"}
        />
        <div className="mt-3 text-center text-xl font-semibold text-neutral-800">
          {resultTitle}
        </div>
      </div>
    );
  };

  const okButtonProps = useMemo(() => {
    if (consoleStatus === RecoverDatabaseStatus.SocketConnectFailed) {
      return {
        disabled: false,
      };
    }
    return {
      disabled: ![
        RecoverDatabaseStatus.StartFailed,
        RecoverDatabaseStatus.LicenseNoPermision,
        RecoverDatabaseStatus.Success,
      ].includes(status),
    };
  }, [status, consoleStatus]);

  useEffect(() => {
    if (!consoleVis) {
      setPollInterval(0);
      setFirst(true);
    }
  }, [setConsoleVis, consoleVis]);

  useEffect(() => {
    if (consoleStatus === RecoverDatabaseStatus.SocketConnectFailed) {
      stopPolling();
    }
  }, [consoleStatus, stopPolling]);

  const okText = React.useMemo(() => {
    if (
      RecoverDatabaseStatus.LicenseNoPermision === status ||
      consoleStatus === RecoverDatabaseStatus.SocketConnectFailed
    ) {
      return intl.formatMessage({
        id: "ok",
        defaultMessage: "OK",
      });
    }
    return intl.formatMessage({
      id: "virtualization.relogin",
      defaultMessage: "Relogin",
    });
  }, [intl, status, consoleStatus]);

  const title = useMemo(() => {
    if (status === RecoverDatabaseStatus.Success) {
      return intl.formatMessage({
        id: "recover.dataBase.completed",
        defaultMessage: "Database Recovery Completed",
      });
    }

    if (
      [
        RecoverDatabaseStatus.LicenseNoPermision,
        RecoverDatabaseStatus.StartFailed,
      ].includes(status)
    ) {
      return intl.formatMessage({
        id: "recovering.dataBase.failed",
        defaultMessage: "Database Recovery Failed",
      });
    }

    if (getParams) {
      return intl.formatMessage({
        id: "recovering.platform.database",
        defaultMessage: "Restoring Platform Database",
      });
    }

    return intl.formatMessage({
      id: "recovering.dataBase",
      defaultMessage: "Database Recovering",
    });
  }, [intl, status, getParams]);

  if (!msg && consoleStatus !== RecoverDatabaseStatus.SocketConnectFailed) {
    return null;
  }

  // 处理 wizard 情况
  if (getParams && status === RecoverDatabaseStatus.Success) {
    return (
      <DialogWeak
        type="warning"
        title={intl.formatMessage({
          id: "congratulations.on.initialization.completion",
          defaultMessage: "Backup Data Recovery Complete",
        })}
        visible={!!consoleVis}
        setVisible={setConsoleVis}
        onConfirm={onOk}
        description={intl.formatMessage({
          id: "management.node.started.successfully.alert",
          defaultMessage:
            'All platform resources have been recovered to their state at backup time. To obtain current backup data, click "Scan Backup Data" in the local backup storage.',
        })}
        footer={
          <Button variant="primary" onClick={onOk}>
            {okText}
          </Button>
        }
      />
    );
  }

  return (
    <DialogBase
      visible={!!consoleVis}
      setVisible={setConsoleVis}
      title={title}
      footer={
        <Button
          variant="primary"
          onClick={onOk}
          disabled={okButtonProps.disabled}
        >
          {okText}
        </Button>
      }
    >
      <div style={{ padding: "24px 24px 20px" }}>
        {status === RecoverDatabaseStatus.Success && (
          <Alert variant="warning">
            {intl.formatMessage({
              id: "management.node.started.successfully.alert",
              defaultMessage:
                'All platform resources have been recovered to their state at backup time. To obtain current backup data, click "Scan Backup Data" in the local backup storage.',
            })}
          </Alert>
        )}
        {status === RecoverDatabaseStatus.LicenseNoPermision && (
          <Alert variant="warning">
            {intl.formatMessage({
              id: "management.node.started.failed.alert",
              defaultMessage:
                "The management node fails to start because the license-authorized quotas are insufficient after database recovery. Update the license.",
            })}
          </Alert>
        )}

        {status === RecoverDatabaseStatus.Running &&
          consoleStatus !== RecoverDatabaseStatus.SocketConnectFailed && (
            <div className={styles.listWrap} ref={wrapRef}>
              {msg ?? ""}
            </div>
          )}
        {renderSuccessOrFailed()}
      </div>
    </DialogBase>
  );
};

export default Action;
