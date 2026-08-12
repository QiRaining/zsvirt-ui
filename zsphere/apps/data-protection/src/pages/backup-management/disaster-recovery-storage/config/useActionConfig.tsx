import { useActionConfig } from "@zstack/zsphere-engine/src/zsv-backup-storage";
import type { ZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import React, { useContext } from "react";
import { useIntl } from "react-intl";
import { ZoneContext } from "zsv_data_protection_shared/backup-management/disaster-recovery-storage/mf-index";

import EnterSelectModal from "../action/create/enter-select-modal";
import DataClearAction from "../action/data-clear";
import DeleteAction from "../action/delete";
import DisableAction from "../action/disable";
import EditBackupStorageAction from "../action/edit-backup-storage";
import EditNameDescAction from "../action/edit-name-desc";
import EnableModal from "../action/enable";
import ReconnectAction from "../action/reconnet";
import ScanDataAction from "../action/scan-backup-data";
import UpdatePasswordAction from "../action/update-password";
import {
  single,
  selected,
  verifyDisable,
  verifyEnable,
} from "../action/validator";

export default () => {
  const intl = useIntl();
  const { selectedZone } = useContext(ZoneContext);
  return useActionConfig<ZSVBackupStorage>([
    {
      key: "create.backup.storage",
      name: intl.formatMessage({
        id: "add.backup.storage",
        defaultMessage: "Add Backup Storage",
      }),
      primary: true,
      autoInjectPreValidator: false,
      ActionWrapper: (props) => <EnterSelectModal {...props} />,
    },
    {
      key: "enable",
      ActionWrapper: (props) => <EnableModal {...props} />,
      preValidators: [selected],
      validators: [verifyEnable],
    },
    {
      key: "disable",
      ActionWrapper: (props) => <DisableAction {...props} />,
      preValidators: [selected],
      validators: [verifyDisable],
    },
    {
      key: "delete",
      ActionWrapper: (props) => <DeleteAction {...props} />,
      preValidators: [selected],
    },
    {
      key: "data.clear",
      ActionWrapper: (props) => <DataClearAction {...props} />,
      preValidators: [selected],
    },
    {
      key: "edit.name.and.desc",
      ActionWrapper: (props) => <EditNameDescAction {...props} />,
      preValidators: [single],
    },
    {
      key: "update.password",
      ActionWrapper: (props) => <UpdatePasswordAction {...props} />,
      preValidators: [single],
    },
    {
      key: "modify.config",
      ActionWrapper: (props) => <EditBackupStorageAction {...props} />,
      preValidators: [single],
    },
    {
      key: "reconnet",
      ActionWrapper: (props) => <ReconnectAction {...props} />,
      preValidators: [selected],
    },
    {
      key: "scan.backup.data",
      preValidators: [single],
      ActionWrapper: (props) => {
        const { source } = props;
        return (
          <ScanDataAction {...props} source={{ ...source, selectedZone }} />
        );
      },
    },
  ]);
};
