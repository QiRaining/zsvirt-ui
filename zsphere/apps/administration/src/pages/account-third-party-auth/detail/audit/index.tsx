import { Op } from "@zstack/zsphere-types";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import AuditList from "zsv_auditing/auditing-sub-list";

interface IProps {
  current: Partial<IAccountThirdPartyAuth & IThirdPartyAuthVO>;
}

const Audit: React.FC<IProps> = ({ current }) => {
  return (
    <AuditList
      view="sub"
      defaultQuery={{
        conditions: [
          {
            key: "resourceUuid",
            op: Op.eq,
            value: current.uuid,
          },
        ],
      }}
    />
  );
};

export default Audit;
