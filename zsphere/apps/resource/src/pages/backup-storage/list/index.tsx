import type { IListProps } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { BackupStoragePlainList } from "zsv_resource_shared/backup-storage/mf-index";

import { useActionConfig } from "../config";

const BackupStorageList: React.FC<IListProps<IBackupStorage>> = ({
  ...props
}) => {
  const actionConfig = useActionConfig();

  return <BackupStoragePlainList actionConfig={actionConfig} {...props} />;
};

export default BackupStorageList;
