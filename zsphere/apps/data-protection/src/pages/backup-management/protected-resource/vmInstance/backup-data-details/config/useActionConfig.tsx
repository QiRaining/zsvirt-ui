import type { BackupData as IBackupData } from "@zstack/zsphere-types/graphql";
import { useActionConfig } from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";
import CreateVmByBackupData from "zsv_resource/vm/create-by-resource/backup-data";

import VmChangeOwner from "../../../action/vm/change-owner";

export default () => {
  return useActionConfig<IBackupData>([
    {
      key: "create.vm",
      icon: "plus",
      ActionWrapper: CreateVmByBackupData,
    },
    {
      key: "change.owner",
      ActionWrapper: VmChangeOwner,
    },
  ]);
};
