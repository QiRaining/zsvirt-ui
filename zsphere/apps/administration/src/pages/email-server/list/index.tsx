import type { IListProps } from "@zstack/zsphere-types";
import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";
import React from "react";
import List from "zsv_shared/email-server/base-list";

import useActionConfig from "../config/useActionConfig";

import style from "../style.module.less";

const EmailServerSettingList: React.FC<IListProps<IEmailServerSetting>> = (
  props,
) => {
  const actionConfig = useActionConfig();

  return (
    <div className={style.tableList}>
      <List actionConfig={actionConfig} {...props} />
    </div>
  );
};

export default EmailServerSettingList;
