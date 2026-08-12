import { InfoPopover, RadioGroup } from "@zstack/design";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import { useState, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import DatabaseBackupList from "./list";

import style from "./style.module.less";

export enum PlatformDatabaseBackupType {
  LocalBackup = "LocalBackup",
  ManagementNode = "ManagementNodeBackup",
  RemoteBackup = "RemoteBackup",
}

const PlatformDatabase = () => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<PlatformDatabaseBackupType>(
    PlatformDatabaseBackupType.LocalBackup,
  );
  const onChange = (v: any) => {
    setActiveTab(v);
  };

  const defaultDatabaseQuery: IQuery = useMemo(() => {
    const conditions: any = [];

    if (activeTab === PlatformDatabaseBackupType.ManagementNode) {
      conditions.push({
        key: "backupStorage.__systemTag__",
        op: Op.in,
        values: [],
      });
    }

    if (activeTab === PlatformDatabaseBackupType.LocalBackup) {
      conditions.push({
        key: "backupStorage.__systemTag__",
        op: Op.in,
        values: ["onlybackup", "allowbackup"],
      });
    }

    if (activeTab === PlatformDatabaseBackupType.RemoteBackup) {
      conditions.push({
        key: "backupStorage.__systemTag__",
        op: Op.in,
        values: ["remotebackup"],
      });
    }

    return { conditions };
  }, [activeTab]);

  const renderHeader = () => {
    return (
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center" }}>
        <RadioGroup
          style={{ marginRight: 8 }}
          variant="outline"
          onValueChange={(value) => onChange(value)}
          defaultValue={PlatformDatabaseBackupType.LocalBackup}
          options={[
            {
              value: PlatformDatabaseBackupType.LocalBackup,
              label: intl.formatMessage({
                id: "local.backup",
                defaultMessage: "Local Backup",
              }),
            },
            {
              value: PlatformDatabaseBackupType.RemoteBackup,
              label: intl.formatMessage({
                id: "remote.backup",
                defaultMessage: "Remote Backup",
              }),
            },
          ]}
        />

        <InfoPopover
          content={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "backup.platform.database.tooltip",
                defaultMessage:
                  "### Platform Database Backup\n\n- Local Backup: Backup files are stored in the local backup storage.\n- Remote Backup: Backup files are stored in the remote backup storage.\n",
              })}
            </ReactMarkdown>
          }
        />
      </div>
    );
  };

  const view = {
    [PlatformDatabaseBackupType.ManagementNode]: "main.managementNode",
    [PlatformDatabaseBackupType.LocalBackup]: "main.local",
    [PlatformDatabaseBackupType.RemoteBackup]: "main.remote",
  };

  return (
    <div className="zsv-list-padding">
      <div>{renderHeader()}</div>
      <div style={{ marginTop: "8px" }}>
        <DatabaseBackupList
          view={view[activeTab]}
          defaultQuery={defaultDatabaseQuery}
          source={{ activeTab }}
        />
      </div>
    </div>
  );
};

export default PlatformDatabase;
