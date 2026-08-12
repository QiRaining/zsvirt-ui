import { Op } from "@zstack/zsphere-types";
import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";
import React from "react";
import { AuditingList } from "zsv_auditing/mf-index";

interface IProps {
  current: Partial<IEmailServerSetting>;
}

const AuditList: React.FC<IProps> = ({ current }) => {
  const defaultQuery = React.useMemo(
    () => ({
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: current?.uuid,
        },
      ],
    }),
    [current],
  );
  return (
    <AuditingList
      view="sub"
      defaultQuery={defaultQuery}
      toolbarHandleTooltip={undefined}
    />
  );
};

export default AuditList;
