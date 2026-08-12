import VmTemplateList from "@zstack/virtualization-resource/src/pages/vm-template/list";
import { Op, VmQueryType } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React from "react";

import style from "./style.module.less";

interface IProps {
  current: IZone;
}

const TemplatedVM: React.FC<IProps> = ({ current }) => {
  return (
    <div className={style.container}>
      <VmTemplateList
        view="main"
        source={current}
        defaultQuery={{
          conditions: [
            {
              key: "zoneUuid",
              value: current.uuid,
              op: Op.eq,
            },
          ],
          type: VmQueryType.GetVmInstanceTemplate,
        }}
      />
    </div>
  );
};

export default TemplatedVM;
