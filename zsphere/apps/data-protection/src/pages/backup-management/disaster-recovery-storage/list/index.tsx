import type { IListProps } from "@zstack/zsphere-types";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { BackupStoragePlainList } from "zsv_data_protection_shared/backup-management/disaster-recovery-storage/mf-index";

import { useActionConfig } from "../config";

interface IProps {
  selectedZone?: unknown;
}

const BackupStoragelist: React.FC<IListProps<IZSVBackupStorage> & IProps> = (
  props,
) => {
  const actionConfig = useActionConfig();
  return <BackupStoragePlainList actionConfig={actionConfig} {...props} />;
};

export default BackupStoragelist;
