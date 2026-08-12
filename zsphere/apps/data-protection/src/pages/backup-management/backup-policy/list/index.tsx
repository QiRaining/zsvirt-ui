import type { IListProps } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { BackupPolicyPlainList } from "zsv_data_protection_shared/backup-management/backup-policy/mf-index";

import useActionConfig from "../config/useActionConfig";

const BackupPolicyList: React.FC<IListProps<SchedulerJobGroup>> = (props) => {
  const actionConfig = useActionConfig();
  return <BackupPolicyPlainList actionConfig={actionConfig} {...props} />;
};

export default BackupPolicyList;
