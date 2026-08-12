import { gql, useQuery } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/local-backup-data-db";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction, useHandleHttpsDownload } from "@zstack/zsphere-hooks";
import type {
  ScanDatabaseBackupInput,
  BackupDatabase,
} from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import {
  canScanDatabaseBackup,
  scanDatabaseBackups,
} from "../../../../../gql/protected-resource.gql";
import DeleteBackupBase from "../../action/platform-database/delete-backupBase";
import OverwriteRevertDatabase from "../../action/platform-database/overwrite-revert-database";
import SyncToLocalBackupStorage from "../../action/platform-database/sync-to-local-backupStorage";
import SyncToRemoteBackupStorage from "../../action/platform-database/sync-to-remote-backupStorage";

const exportDatabaseBackupUrl = gql`
  mutation exportDatabaseBackupUrl($input: ExportBackupDatabaseUrlListInput!) {
    exportDatabaseBackupUrl(input: $input) {
      actionId
    }
  }
`;

export default (view: string) => {
  const intl = useIntl();
  const { handleHttpsDownload } = useHandleHttpsDownload();
  const doAction = useAction();

  const { data } = useQuery<{ canScanDatabaseBackup: boolean }>(
    canScanDatabaseBackup,
  );

  const _canScanDatabaseBackup = useCallback(
    () => !!data?.canScanDatabaseBackup,
    [data],
  );

  return useActionConfig<BackupDatabase>([
    {
      key: "scan",
      autoInjectPreValidator: false,
      preValidators: [_canScanDatabaseBackup],
      onClick: ({ source: _source }) => {
        const payload: ScanDatabaseBackupInput[] = [];

        doAction({
          mutation: scanDatabaseBackups,
          payload,
          name: intl.formatMessage({
            id: "scan.database.backup",
            defaultMessage: "Scan Platform Database Backup",
          }),
          type: "BackupDatabase",
          total: 1,
        });
      },
    },
    {
      key: "cover.revert",
      ActionWrapper: OverwriteRevertDatabase,
    },
    {
      key: "export",
      onClick: ({ selectedList }) => {
        const uuid = selectedList?.[0]?.uuid;

        const bsUuid =
          view === "main.remote"
            ? selectedList?.[0]?.remoteBackupStorage?.uuid
            : selectedList?.[0]?.localBackupStorage?.uuid;

        const exportUrl = selectedList?.[0]?.backupStorageRefs?.find(
          (ref) => ref.backupStorageUuid === bsUuid,
        )?.exportUrl;
        if (exportUrl) {
          if (window.location.protocol === "https:") {
            handleHttpsDownload(exportUrl);
          } else {
            window.open(exportUrl);
          }
          return;
        }

        doAction({
          mutation: exportDatabaseBackupUrl,
          payload: {
            uuid,
            backupStorageUuid: bsUuid,
          },
          name: intl.formatMessage({
            id: "export.database.url",
            defaultMessage: "Export Platform Database Backup",
          }),
          total: 1,
          type: "BackupDatabase",
          onFinish: (result: IActionResult) => {
            if (window.location.protocol === "https:") {
              handleHttpsDownload(result?.inventory?.url);
            } else {
              window.open(result?.inventory?.url);
            }
          },
        });
      },
    },
    {
      key: "sync.to.local.backupStorage",
      ActionWrapper: SyncToLocalBackupStorage,
    },
    {
      key: "sync.to.remote.backupStorage",
      ActionWrapper: SyncToRemoteBackupStorage,
    },
    {
      key: "delete.db",
      ActionWrapper: DeleteBackupBase,
    },
  ]);
};
