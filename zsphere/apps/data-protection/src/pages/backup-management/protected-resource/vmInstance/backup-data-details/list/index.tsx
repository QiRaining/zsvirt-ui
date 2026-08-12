import type { IListProps } from "@zstack/zsphere-types";
import type {
  BackupData as IBackupData,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { BackupDatalist as List } from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import { useActionConfig } from "../config";

interface IProps {
  source?: IVM;
  onClickName?: (value: IBackupData) => void;
}

const BackupDatalist: React.FC<IListProps<IBackupData> & IProps> = (props) => {
  const actionConfig = useActionConfig();
  return <List actionConfig={actionConfig} {...props} />;
};

export default BackupDatalist;
