import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BackupStorageList from "../../../backup-storage/list";

import style from "./style.module.less";

interface IProps {
  current: IZone;
}

const BackupStorage: React.FC<IProps> = ({ current }) => {
  const defaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "zone.uuid",
          value: current.uuid,
          op: Op.eq,
        },
        {
          key: "__systemTag__",
          op: Op.notIn,
          values: ["remote", "aliyun", "onlybackup", "remotebackup"],
        },
      ],
    };
  }, [current.uuid]);

  return (
    <div className={style.container}>
      <BackupStorageList
        view="sub.virutalization.zone"
        source={current}
        defaultQuery={defaultQuery}
      />
    </div>
  );
};

export default BackupStorage;
