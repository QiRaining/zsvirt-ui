import IscsiLunList from "@zstack/virtualization-resource/src/pages/iscsi-lun/list";
import { Op } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React from "react";

interface IProps {
  current: Partial<IIscsiServer>;
}

const IscsiLunSubList: React.FC<IProps> = ({ current }) => {
  return (
    <IscsiLunList
      view="sub.virtualization.iqn"
      source={current}
      defaultQuery={{
        conditions: [
          {
            key: "iscsiTarget.iscsiServerUuid",
            op: Op.eq,
            value: current?.uuid,
          },
        ],
      }}
    />
  );
};

export default IscsiLunSubList;
